import { isVirtualBaristaChatResponse } from './virtual-barista-response';

const validResponse = () => ({
  reply: 'Halo, ada yang bisa saya bantu?',
  intent: 'off_topic',
  grounding: 'none',
  recommendedProductSlugs: [],
  actions: [],
  followUpSuggestions: [],
  recommendedSlugs: [],
  recommendedProducts: [],
  sources: [],
  groundedInCatalog: false,
  guardrailStatus: 'passed',
});

function expectRejected(value: unknown, label: string) {
  if (isVirtualBaristaChatResponse(value)) throw new Error(`${label} was accepted.`);
}

export function runVirtualBaristaResponseContractTests() {
  expectRejected({}, 'empty object');
  expectRejected([], 'array');
  expectRejected(null, 'null');
  expectRejected({ ...validResponse(), reply: undefined }, 'missing reply');
  expectRejected({ ...validResponse(), reply: 52 }, 'numeric reply');
  expectRejected({ ...validResponse(), actions: [{}] }, 'malformed action');
  expectRejected({ ...validResponse(), recommendedProducts: [{}] }, 'malformed recommendation');

  if (!isVirtualBaristaChatResponse(validResponse())) throw new Error('Valid greeting was rejected.');

  const recommendation = {
    ...validResponse(),
    grounding: 'catalog',
    recommendedProductSlugs: ['prau'],
    recommendedSlugs: ['prau'],
    recommendedProducts: [{
      slug: 'prau', name: 'Prau', series: 'Signature', origin: 'Indonesia', process: 'Washed',
      tasting_notes: ['Citrus'], base_price: 85000,
      selectedVariant: { weightGrams: 100, weightLabel: '100g', price: 85000, pricePerGram: 850 },
    }],
  };
  if (!isVirtualBaristaChatResponse(recommendation)) throw new Error('Valid recommendation was rejected.');

  const actionResponse = {
    ...validResponse(),
    actions: [
      { action_id: 'vb-aaaaaaaaaaaaaaaaaaaa', type: 'add_to_cart', product_slug: 'prau', variant_weight: 100, quantity: 1 },
      { action_id: 'vb-bbbbbbbbbbbbbbbbbbbb', type: 'open_feature', path: '/coffee-lab/brewing-guidance' },
    ],
  };
  if (!isVirtualBaristaChatResponse(actionResponse)) throw new Error('Valid actions were rejected.');
}
