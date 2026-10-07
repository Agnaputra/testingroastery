import ownerCatalogSnapshot from './catalog-owner-snapshot.json';
import { PRODUCTS, type CoffeeProduct } from './data';

export type CatalogPublicationStatus = 'published' | 'draft' | 'needs_owner_review';

export interface OwnerCatalogPrices {
  filter100g: string;
  filter200g: string;
  filter500g: string;
  espresso200g: string;
  espresso500g: string;
  espresso1kg: string;
  reserve16g: string;
  reserve50g: string;
  reserve100g: string;
  reserve200g: string;
  slowbarCup: string;
}

export interface OwnerCatalogProduct {
  sourceRow: number;
  seriesExcel: string;
  seriesWeb: string;
  name: string;
  slowbarAlias: string;
  origin: string;
  tastingNotes: string;
  prices: OwnerCatalogPrices;
  otherWeights: string;
  listedOnWeb: string;
  listedOnSlowbar: string;
  listedOnMarketplace: string;
  marketplaceDescription: string;
  ownerNote: string;
}

export interface OwnerSlowbarItem {
  series: string;
  alias: string;
  baseBean: string;
  tastingNotes: string;
  cupPrice: string;
  listedOnWeb: string;
}

export interface OwnerCatalogReviewItem {
  id: number;
  description: string;
}

interface OwnerCatalogSnapshot {
  masterProducts: OwnerCatalogProduct[];
  slowbarItems: OwnerSlowbarItem[];
  reviewItems: OwnerCatalogReviewItem[];
}

const snapshot = ownerCatalogSnapshot as OwnerCatalogSnapshot;

export const OWNER_CATALOG_PRODUCTS = snapshot.masterProducts;
export const OWNER_SLOWBAR_ITEMS = snapshot.slowbarItems;
export const OWNER_CATALOG_REVIEW_ITEMS = snapshot.reviewItems;

/**
 * Blueprint ERD Models (Target Single Source of Truth)
 */
export interface MasterBean {
  id: string;
  masterRow: number;
  name: string;
  slowbarAlias?: string;
  origin: string;
  region: string;
  altitude: string;
  varietal: string;
  process: string;
  tastingNotes: string[];
  flavorCategory: string[];
  publicationStatus: CatalogPublicationStatus;
}

export interface ProductMappingEntry {
  webId: string;
  slug: string;
  knowledgeSlug?: string;
  masterRow: number;
  canonicalName: string;
  alias?: string;
  profileType: 'filter' | 'espresso' | 'reserve';
  dualRoastProfileBean?: string;
  publicationStatus: CatalogPublicationStatus;
}

/**
 * Verified mapping between 31 active website products and owner master rows (1-55).
 * Explicitly models dual-roast profiles (e.g. Ijen Full Wash & Kintamani Full Wash).
 */
export const ACTIVE_CATALOG_MAPPING: ProductMappingEntry[] = [
  // 1. Java Exotic Series
  { webId: 'sumbing-supernova-celestia', slug: 'sumbing-supernova-celestia', masterRow: 1, canonicalName: 'Sumbing Supernova Wash', alias: 'Celestia', profileType: 'filter', publicationStatus: 'published' },
  { webId: 'prau-natural-surya', slug: 'prau-natural-surya', knowledgeSlug: 'prau-natural-el-davisio-surya', masterRow: 2, canonicalName: 'Prau Natural El Davisio Double Mosto', alias: 'Surya', profileType: 'filter', publicationStatus: 'published' },
  { webId: 'prau-not-chiroso-unchiro', slug: 'prau-not-chiroso-unchiro', masterRow: 3, canonicalName: 'Prau Not-Chiroso Style', alias: 'Unchiro', profileType: 'filter', publicationStatus: 'published' },
  { webId: 'sindoro-strawberry-selai', slug: 'sindoro-strawberry-selai', masterRow: 5, canonicalName: 'Sindoro Strawberry Triple Yeast', alias: 'Selai', profileType: 'filter', publicationStatus: 'published' },
  { webId: 'sindoro-lavender-candy', slug: 'sindoro-lavender-candy', masterRow: 8, canonicalName: 'Sindoro Lavender Candy Wash', alias: 'Lavender', profileType: 'filter', publicationStatus: 'published' },

  // 2. Sunda / Puntang Series
  { webId: 'puntang-natural-aromanis', slug: 'puntang-natural-aromanis', masterRow: 10, canonicalName: 'Puntang Natural Aromanis', alias: 'Aromanis', profileType: 'filter', publicationStatus: 'published' },
  { webId: 'puntang-honey-gulali', slug: 'puntang-honey-gulali', masterRow: 11, canonicalName: 'Puntang Honey Gulali', alias: 'Gulali', profileType: 'filter', publicationStatus: 'published' },

  // 3. Ijen Series (Filter)
  { webId: 'ijen-cm-asmara', slug: 'ijen-carbonic-maceration-asmara', masterRow: 12, canonicalName: 'Ijen Carbonic Maceration', alias: 'Asmara', profileType: 'filter', publicationStatus: 'published' },
  { webId: 'ijen-lactic-laras', slug: 'ijen-lactic-laras', masterRow: 13, canonicalName: 'Ijen Lactic', alias: 'Laras', profileType: 'filter', publicationStatus: 'published' },
  { webId: 'ijen-anaerob-rahsa', slug: 'ijen-anaerob-rahsa', masterRow: 14, canonicalName: 'Ijen Anaerob', alias: 'Rahsa', profileType: 'filter', publicationStatus: 'published' },
  { webId: 'ijen-full-wash-washey', slug: 'ijen-full-wash-washey', masterRow: 15, canonicalName: 'Ijen Full Wash', alias: 'Washey', profileType: 'filter', dualRoastProfileBean: 'ijen-full-wash', publicationStatus: 'published' },
  { webId: 'ijen-kenyan-wening', slug: 'ijen-kenyan-wening', masterRow: 16, canonicalName: 'Ijen Kenyan', alias: 'Wening', profileType: 'filter', publicationStatus: 'published' },
  { webId: 'ijen-yellow-bourbon-kencana', slug: 'ijen-yellow-bourbon-kencana', masterRow: 17, canonicalName: 'Ijen Yellow Bourbon', alias: 'Kencana', profileType: 'filter', publicationStatus: 'published' },

  // 4. Enrekang Series
  { webId: 'buntu-lenta-wine-duharman', slug: 'buntu-lenta-wine-duharman', masterRow: 19, canonicalName: 'Buntu Lenta Wine', alias: 'Duharman Winey', profileType: 'filter', publicationStatus: 'published' },
  { webId: 'buntu-lenta-natural-duharman', slug: 'buntu-lenta-natural-duharman', masterRow: 20, canonicalName: 'Buntu Lenta Natural', alias: 'Duharman Natural', profileType: 'filter', publicationStatus: 'published' },
  { webId: 'buntu-lenta-wash-duharman', slug: 'buntu-lenta-wash-duharman', masterRow: 21, canonicalName: 'Buntu Lenta Wash', alias: 'Duharman Wash', profileType: 'filter', publicationStatus: 'published' },
  { webId: 'kalaciri-wash-process', slug: 'kalaciri-wash-process', masterRow: 22, canonicalName: 'Kalaciri Wash', alias: 'Kalaciri', profileType: 'filter', publicationStatus: 'published' },
  { webId: 'benteng-alla-wash-sembada', slug: 'benteng-alla-wash-sembada', masterRow: 23, canonicalName: 'Benteng Alla Wash', alias: 'Sembada', profileType: 'filter', publicationStatus: 'published' },

  // 5. Argopuro Walida Series
  { webId: 'argopuro-walida-anaerob-arcapada', slug: 'argopuro-walida-anaerob-arcapada', masterRow: 39, canonicalName: 'Argopuro Natural Anaerob', alias: 'Arcapada', profileType: 'filter', publicationStatus: 'published' },
  { webId: 'damarkandang-cm-kismis', slug: 'damarkandang-cm-kismis', masterRow: 41, canonicalName: 'Argopuro Damarkandang CM Kismis', alias: 'Damarkandang Kismis', profileType: 'filter', publicationStatus: 'published' },

  // 6. Grand Reserve
  { webId: 'grand-reserve-magnum-sidra', slug: 'grand-reserve-magnum-sidra', knowledgeSlug: 'magnum-sidra-el-vergel-soberano', masterRow: 29, canonicalName: 'Magnum Sidra El Vergel Cauca Colombia', alias: 'Soberano', profileType: 'reserve', publicationStatus: 'published' },
  { webId: 'grand-reserve-el-triunfo-geisha', slug: 'grand-reserve-el-triunfo-geisha', knowledgeSlug: 'el-triunfo-geisha-tolima-aurora', masterRow: 30, canonicalName: 'El Triunfo Geisha Tolima Colombia', alias: 'Aurora', profileType: 'reserve', publicationStatus: 'published' },
  { webId: 'grand-reserve-sudan-rume-carmin', slug: 'grand-reserve-sudan-rume-carmin', knowledgeSlug: 'sudan-rume-huila-carmin', masterRow: 31, canonicalName: 'Sudan Rume Huila Colombia', alias: 'Carmin', profileType: 'reserve', publicationStatus: 'published' },
  { webId: 'grand-reserve-pink-bourbon-marfil', slug: 'grand-reserve-pink-bourbon-marfil', masterRow: 32, canonicalName: 'Inmaculada Pink Bourbon Huila Colombia', alias: 'Marfil', profileType: 'reserve', publicationStatus: 'published' },
  { webId: 'grand-reserve-yemen-sahara', slug: 'grand-reserve-yemen-sahara', knowledgeSlug: 'yemen-haraz-golden-harvest-sahara', masterRow: 33, canonicalName: 'Yemen Haraz Golden Harvest', alias: 'Sahara', profileType: 'reserve', publicationStatus: 'published' },

  // 7. Espresso Lineup (Robusta & Arabica)
  { webId: 'espresso-dampit-natural', slug: 'dampit-natural-robusta-espresso', knowledgeSlug: 'dampit-natural-espresso', masterRow: 24, canonicalName: 'Dampit Natural', profileType: 'espresso', publicationStatus: 'published' },
  { webId: 'espresso-telemung-honey', slug: 'telemung-honey-robusta-espresso', masterRow: 25, canonicalName: 'Telemung Honey', profileType: 'espresso', publicationStatus: 'published' },
  { webId: 'espresso-arabica-kintamani', slug: 'kintamani-full-wash-arabica-espresso', masterRow: 18, canonicalName: 'Kintamani Full Wash', alias: 'Arkana', profileType: 'espresso', dualRoastProfileBean: 'kintamani-full-wash', publicationStatus: 'published' },
  { webId: 'espresso-arabica-gayo-full-wash', slug: 'gayo-full-wash-arabica-espresso', masterRow: 27, canonicalName: 'Gayo Full Wash', alias: 'Gayo', profileType: 'espresso', dualRoastProfileBean: 'gayo-full-wash', publicationStatus: 'published' },
  { webId: 'espresso-arabica-ijen-full-wash', slug: 'arabica-ijen-full-wash-espresso', masterRow: 15, canonicalName: 'Ijen Full Wash', alias: 'Washey', profileType: 'espresso', dualRoastProfileBean: 'ijen-full-wash', publicationStatus: 'published' },
  { webId: 'espresso-brazil-santos', slug: 'brazil-santos-espresso', masterRow: 28, canonicalName: 'Brazil Santos', profileType: 'espresso', publicationStatus: 'published' },
];

export function toWebCatalogSlug(slug: string): string {
  return ACTIVE_CATALOG_MAPPING.find((mapping) => mapping.knowledgeSlug === slug)?.slug ?? slug;
}

/**
 * Rows in master snapshot that have missing prices, provisional "Harga belum ada" notes,
 * or naming ambiguity that require owner review before public release.
 */
const NEEDS_REVIEW_ROWS = new Set([
  34, // 52 Blend 50:50 (prices empty)
  35, // 52 Bold Blend (prices empty)
  36, // 52 Golden Blend (prices empty)
  37, // Single Origin Drip Bag (prices empty)
  38, // Mixed Origin Drip Bag (prices empty)
  45, // Arjuna Yellow Catura (naming & varietal ambiguity)
  46, // Kintamani Natural Sunsweet (note: "Harga belum ada (isi manual)")
  47, // Kintamani Natural Selected (note: "Harga belum ada (isi manual)")
  48, // Kintamani Washed Citrine (note: "Harga belum ada (isi manual)")
  49, // Kintamani Aerobic Natural (note: "Harga belum ada (isi manual)")
  50, // Kintamani Yeast Semi Anaerobic Natural (note: "Harga belum ada (isi manual)")
  51, // Kintamani Yeast Inoculated Honey (note: "Harga belum ada (isi manual)")
  52, // Ijen CM COE Winner (note: "Harga belum ada (isi manual)")
  53, // Ijen CM Pink Honey (note: "Harga belum ada (isi manual)")
  54, // Ijen Mosto Washed (note: "Harga belum ada (isi manual)")
  55, // Ijen Karamela (note: "Harga belum ada (isi manual)")
]);

function hasAnyPrice(product: OwnerCatalogProduct): boolean {
  return Object.values(product.prices).some(Boolean);
}

/**
 * Owner workbook status is treated as a publication candidate only. Notes and
 * missing prices keep a record out of automatic publication until reviewed.
 * Evaluates publication status according to strict owner guardrails:
 * 1. Missing prices or explicit "Harga belum ada" notes -> needs_owner_review (16 items)
 * 2. Mapped active items in web catalog -> published (30 master rows representing 31 products)
 * 3. Complete items in Excel/Slowbar not yet published -> draft (9 items)
 */
export function getOwnerPublicationStatus(product: OwnerCatalogProduct): CatalogPublicationStatus {
  if (NEEDS_REVIEW_ROWS.has(product.sourceRow) || !hasAnyPrice(product)) {
    return 'needs_owner_review';
  }

  const isMappedInWeb = ACTIVE_CATALOG_MAPPING.some((m) => m.masterRow === product.sourceRow);
  if (isMappedInWeb) {
    return 'published';
  }

  return 'draft';
}

export function getOwnerCatalogProductByName(name: string): OwnerCatalogProduct | undefined {
  return OWNER_CATALOG_PRODUCTS.find((product) => product.name.toLowerCase() === name.toLowerCase());
}

export function getOwnerProductsByStatus(status: CatalogPublicationStatus): OwnerCatalogProduct[] {
  return OWNER_CATALOG_PRODUCTS.filter((product) => getOwnerPublicationStatus(product) === status);
}

/**
 * Returns ONLY verified published products for customer-facing experiences.
 */
export function getPublishedProducts(): CoffeeProduct[] {
  return PRODUCTS.filter((p) => p.publicationStatus !== 'draft' && p.publicationStatus !== 'needs_owner_review');
}

export function getPublishedProductBySlug(slug: string): CoffeeProduct | undefined {
  const published = getPublishedProducts();
  return published.find((p) => p.slug === slug || p.id === slug);
}

/**
 * Returns validated published Slowbar items (25 menu items).
 */
export function getPublishedSlowbarItems(): OwnerSlowbarItem[] {
  return OWNER_SLOWBAR_ITEMS.filter((item) => item.listedOnWeb === 'Ya');
}

export interface MasterAuditReport {
  totalMasterProducts: number;
  publishedCount: number;
  draftCount: number;
  needsReviewCount: number;
  totalSlowbarItems: number;
  publishedSlowbarCount: number;
  reviewItemsCount: number;
}

export function getMasterAuditReport(): MasterAuditReport {
  const published = getOwnerProductsByStatus('published');
  const draft = getOwnerProductsByStatus('draft');
  const needsReview = getOwnerProductsByStatus('needs_owner_review');
  const publishedSlowbar = getPublishedSlowbarItems();

  return {
    totalMasterProducts: OWNER_CATALOG_PRODUCTS.length,
    publishedCount: published.length,
    draftCount: draft.length,
    needsReviewCount: needsReview.length,
    totalSlowbarItems: OWNER_SLOWBAR_ITEMS.length,
    publishedSlowbarCount: publishedSlowbar.length,
    reviewItemsCount: OWNER_CATALOG_REVIEW_ITEMS.length,
  };
}
