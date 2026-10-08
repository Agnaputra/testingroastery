import { NextRequest, NextResponse } from 'next/server';
import { getPublishedProducts, toKnowledgeCatalogSlug, toWebCatalogSlug } from '../../../lib/catalog-master';
import { isVirtualBaristaAction, type VirtualBaristaAction } from '../../../lib/virtual-barista-actions';
import { resolveCatalogSelectedVariant } from '../../../lib/virtual-barista-recommendations';
import { isVirtualBaristaChatResponse } from '../../../lib/virtual-barista-response';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const publishedProducts = getPublishedProducts();
const publishedProductsBySlug = new Map(publishedProducts.map((product) => [product.slug, product]));
const publishedSlugs = new Set(publishedProductsBySlug.keys());
const BLOCKED_PHRASES = [
  'ignore previous instructions', 'ignore all instructions', 'system prompt', 'jailbreak',
  'bypass filter', 'bypass guardrail', 'act as dan', 'you are dan', 'pretend you are',
  'drop table', 'select * from', 'insert into', 'delete from', '--', 'hack akun',
  'cara meretas', 'ddos', 'script injection', 'xss payload', 'cara membuat bom',
  'cara membuat senjata',
];

function unavailableResponse() {
  return NextResponse.json({
    reply: 'Virtual Barista sedang tidak tersedia. Kamu masih bisa membuka Catalogue atau Brewing Guidance.',
    intent: 'off_topic',
    grounding: 'none',
    recommendedProductSlugs: [],
    recommendedSlugs: [],
    actions: [],
    sources: [],
    followUpSuggestions: [],
    groundedInCatalog: false,
    guardrailStatus: 'backend_unavailable',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { message, history, requestId } = body as { message?: unknown; history?: unknown; requestId?: unknown };
    if (typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    if (message.length > 500) {
      return NextResponse.json({ error: 'Message is too long' }, { status: 400 });
    }
    if (requestId !== undefined && (typeof requestId !== 'string' || !/^[a-zA-Z0-9_-]{8,100}$/.test(requestId))) {
      return NextResponse.json({ error: 'Invalid request id' }, { status: 400 });
    }
    if (BLOCKED_PHRASES.some((phrase) => message.toLowerCase().includes(phrase))) {
      return NextResponse.json({
        reply: 'Maaf, saya tidak dapat membantu permintaan yang mencoba membocorkan sistem atau membahayakan orang lain.',
        intent: 'off_topic',
        grounding: 'none',
        recommendedProductSlugs: [],
        recommendedSlugs: [],
        actions: [],
        sources: [],
        followUpSuggestions: ['Tanya tentang specialty coffee', 'Buka Catalogue'],
        groundedInCatalog: false,
        guardrailStatus: 'blocked_input_policy',
      });
    }

    const safeHistory = Array.isArray(history)
      ? history.slice(-8).map((entry: unknown) => {
          if (!entry || typeof entry !== 'object') return entry;
          const message = entry as Record<string, unknown>;
          const slugs = Array.isArray(message.recommendedProductSlugs)
            ? message.recommendedProductSlugs
                .filter((slug: unknown): slug is string => typeof slug === 'string')
                .map(toKnowledgeCatalogSlug)
            : message.recommendedProductSlugs;
          const variants = Array.isArray(message.recommendedVariants)
            ? message.recommendedVariants.map((variant) => {
                if (!variant || typeof variant !== 'object') return variant;
                const record = variant as Record<string, unknown>;
                return {
                  ...record,
                  productSlug: typeof record.productSlug === 'string' ? toKnowledgeCatalogSlug(record.productSlug) : record.productSlug,
                };
              })
            : message.recommendedVariants;
          return { ...message, recommendedProductSlugs: slugs, recommendedVariants: variants };
        })
      : [];
    const aiBackendUrl = process.env.AI_BACKEND_URL || 'http://127.0.0.1:8000';
    const startedAt = Date.now();

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const remainingMs = 27_000 - (Date.now() - startedAt);
      if (remainingMs < 1_000) break;
      try {
        const backendRes = await fetch(`${aiBackendUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: message.trim(), history: safeHistory, requestId }),
          signal: AbortSignal.timeout(remainingMs),
        });

        if (backendRes.ok) {
          const payload: unknown = await backendRes.json();
          if (!isVirtualBaristaChatResponse(payload)) return unavailableResponse();
          const sourceSlugs = Array.isArray(payload.recommendedProductSlugs)
            ? payload.recommendedProductSlugs
            : Array.isArray(payload.recommendedSlugs)
              ? payload.recommendedSlugs
              : [];
          const validatedSlugs = sourceSlugs
            .filter((slug: unknown): slug is string => typeof slug === 'string')
            .map(toWebCatalogSlug)
            .filter((slug: string) => publishedSlugs.has(slug));
          const recommendationBySlug = new Map<string, Record<string, unknown>>();
          if (Array.isArray(payload.recommendedProducts)) {
            for (const product of payload.recommendedProducts) {
              if (!product || typeof product !== 'object') continue;
              const record = product as Record<string, unknown>;
              if (typeof record.slug !== 'string') continue;
              const slug = toWebCatalogSlug(record.slug);
              const catalogProduct = publishedProductsBySlug.get(slug);
              if (!catalogProduct) continue;
              recommendationBySlug.set(slug, {
                ...record,
                slug,
                selectedVariant: resolveCatalogSelectedVariant(catalogProduct, record.selectedVariant),
              });
            }
          }
          const recommendedProducts = validatedSlugs.flatMap((slug: string) => {
            const recommendation = recommendationBySlug.get(slug);
            return recommendation ? [recommendation] : [];
          });
          const actions: VirtualBaristaAction[] = Array.isArray(payload.actions)
            ? payload.actions.map((action: unknown): unknown => {
                if (!action || typeof action !== 'object') return action;
                const record = action as Record<string, unknown>;
                return {
                  ...record,
                  product_slug: typeof record.product_slug === 'string'
                    ? toWebCatalogSlug(record.product_slug)
                    : record.product_slug,
                };
              }).filter((action: unknown): action is VirtualBaristaAction => {
                if (!isVirtualBaristaAction(action)) return false;
                return action.type === 'open_feature' || publishedSlugs.has(action.product_slug);
              })
            : [];

          return NextResponse.json({
            ...payload,
            recommendedProductSlugs: validatedSlugs,
            recommendedSlugs: validatedSlugs,
            recommendedProducts,
            actions,
          });
        }
      } catch {
        // Retry only when the first failure was immediate, such as a FastAPI reload.
      }
      if (attempt === 0 && Date.now() - startedAt < 2_000) {
        await new Promise((resolve) => setTimeout(resolve, 350));
      } else {
        break;
      }
    }

    return unavailableResponse();
  } catch {
    return unavailableResponse();
  }
}
