import { isVirtualBaristaAction, type VirtualBaristaAction } from './virtual-barista-actions';

const GROUNDING_VALUES = new Set(['catalog', 'website', 'coffee_web', 'conversation', 'none']);

type BackendRecommendation = {
  slug: string;
  name: string;
  series: string;
  origin: string;
  process: string;
  tasting_notes: string[];
  base_price: number;
  similarity_score?: number | null;
  selectedVariant?: {
    weightGrams: number;
    weightLabel: string;
    price: number;
    pricePerGram: number;
  } | null;
};

export type BackendChatResponse = {
  reply: string;
  intent: string;
  grounding: string;
  recommendedProductSlugs: string[];
  actions: VirtualBaristaAction[];
  followUpSuggestions: string[];
  recommendedSlugs: string[];
  recommendedProducts: BackendRecommendation[];
  sources: Array<{ title: string; url: string }>;
  groundedInCatalog: boolean;
  guardrailStatus: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

function isSelectedVariant(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (!isRecord(value)) return false;
  return Number.isInteger(value.weightGrams)
    && typeof value.weightLabel === 'string'
    && Number.isInteger(value.price)
    && isFiniteNumber(value.pricePerGram);
}

function isRecommendation(value: unknown): value is BackendRecommendation {
  if (!isRecord(value)) return false;
  return typeof value.slug === 'string'
    && typeof value.name === 'string'
    && typeof value.series === 'string'
    && typeof value.origin === 'string'
    && typeof value.process === 'string'
    && isStringArray(value.tasting_notes)
    && isFiniteNumber(value.base_price)
    && (value.similarity_score === undefined || value.similarity_score === null || isFiniteNumber(value.similarity_score))
    && isSelectedVariant(value.selectedVariant);
}

export function isVirtualBaristaChatResponse(value: unknown): value is BackendChatResponse {
  if (!isRecord(value) || typeof value.reply !== 'string' || !value.reply.trim()) return false;
  return typeof value.intent === 'string'
    && typeof value.grounding === 'string'
    && GROUNDING_VALUES.has(value.grounding)
    && isStringArray(value.recommendedProductSlugs)
    && Array.isArray(value.actions) && value.actions.every(isVirtualBaristaAction)
    && isStringArray(value.followUpSuggestions)
    && isStringArray(value.recommendedSlugs)
    && Array.isArray(value.recommendedProducts) && value.recommendedProducts.every(isRecommendation)
    && Array.isArray(value.sources) && value.sources.every((source) =>
      isRecord(source) && typeof source.title === 'string' && typeof source.url === 'string'
    )
    && typeof value.groundedInCatalog === 'boolean'
    && typeof value.guardrailStatus === 'string';
}
