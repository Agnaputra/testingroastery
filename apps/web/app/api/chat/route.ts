import { NextRequest, NextResponse } from 'next/server';
import { getPublishedProducts, toKnowledgeCatalogSlug, toWebCatalogSlug } from '../../../lib/catalog-master';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const publishedSlugs = new Set(getPublishedProducts().map((product) => product.slug));
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

    const { message, history } = body as { message?: unknown; history?: unknown };
    if (typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    if (message.length > 500) {
      return NextResponse.json({ error: 'Message is too long' }, { status: 400 });
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
          return { ...message, recommendedProductSlugs: slugs };
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
          body: JSON.stringify({ message: message.trim(), history: safeHistory }),
          signal: AbortSignal.timeout(remainingMs),
        });

        if (backendRes.ok) {
          const payload = await backendRes.json();
          const sourceSlugs = Array.isArray(payload.recommendedProductSlugs)
            ? payload.recommendedProductSlugs
            : Array.isArray(payload.recommendedSlugs)
              ? payload.recommendedSlugs
              : [];
          const validatedSlugs = sourceSlugs
            .filter((slug: unknown): slug is string => typeof slug === 'string')
            .map(toWebCatalogSlug)
            .filter((slug: string) => publishedSlugs.has(slug));
          const recommendedProducts = Array.isArray(payload.recommendedProducts)
            ? payload.recommendedProducts.map((product: unknown) => {
                if (!product || typeof product !== 'object') return product;
                const record = product as Record<string, unknown>;
                return {
                  ...record,
                  slug: typeof record.slug === 'string' ? toWebCatalogSlug(record.slug) : record.slug,
                };
              })
            : payload.recommendedProducts;

          return NextResponse.json({
            ...payload,
            recommendedProductSlugs: validatedSlugs,
            recommendedSlugs: validatedSlugs,
            recommendedProducts,
            actions: [], // Phase 2 will add validated website actions.
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
