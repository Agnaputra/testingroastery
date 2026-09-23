path = r'c:\laragon\www\testingroastery\apps\web\components\navbar.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

import re

nav_items_replacement = '''export type NavItem = {
  id: string;
  label: string;
  href?: string;
  children?: NavItem[];
};

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', href: '/', label: 'Beranda' },
  {
    id: 'about',
    label: 'About Us',
    href: '/about',
    children: [
      { id: 'about-behind', href: '/about#behind', label: 'Behind 52 Coffee & Roastery' },
      { id: 'about-journey', href: '/about#roastery-journey', label: 'Roastery Journey' },
      { id: 'about-slowbar', href: '/about#slowbar-ambience', label: 'Slowbar Ambience' },
    ],
  },
  {
    id: 'catalogue',
    label: 'Catalogue',
    href: '/catalog',
    children: [
      { id: 'catalogue-beans', href: '/catalog?category=beans', label: 'Retail Beans' },
      { id: 'catalogue-slowbar', href: '/catalog?category=slowbar', label: 'Slowbar Beverages' },
      { id: 'catalogue-glassware', href: '/catalog?category=glassware', label: 'Glassware' },
      { id: 'catalogue-machine', href: '/catalog?category=machine', label: 'Machine & Tools' },
    ],
  },
  {
    id: 'partnerships',
    label: 'Partnerships',
    href: '/work-with-us',
    children: [
      {
        id: 'partnerships-consultations',
        href: '/work-with-us/consultations',
        label: 'Consultations',
        children: [
          { id: 'consultation-form', href: '/work-with-us/consultations#consultation-form', label: 'Formulir Consultation' },
          { id: 'byob-consultation', href: '/work-with-us/consultations#byob', label: 'Build Your Own Blend' },
          { id: 'pricing-calculator', href: '/work-with-us/consultations#pricing-calculator', label: 'Pricing Calculator' },
        ],
      },
      {
        id: 'wholesale',
        href: '/work-with-us#wholesale-partnership',
        label: 'Wholesale & Partnership',
      },
    ],
  },
  {
    id: 'coffee-lab',
    label: 'Coffee Lab',
    href: '/coffee-lab',
    children: [
      {
        id: 'brewing-guidance',
        href: '/coffee-lab/brewing-guidance',
        label: 'Brewing Guidance',
        children: [
          { id: 'brewing-methods', href: '/coffee-lab/brewing-guidance#brewing-methods', label: 'Brewing Methods' },
          { id: 'recipes', href: '/coffee-lab/brewing-guidance#recipes', label: 'Recipes' },
          { id: 'grind-size', href: '/coffee-lab/brewing-guidance#grind-size', label: 'Grind Size' },
          { id: 'ratio-extraction', href: '/coffee-lab/brewing-guidance#ratio-extraction', label: 'Ratio & Extraction' },
        ],
      },
      {
        id: 'lab-blend',
        href: '/coffee-lab/build-your-own-blend',
        label: 'Build Your Own Blend',
        children: [
          { id: 'choose-beans', href: '/coffee-lab/build-your-own-blend#choose-your-beans', label: 'Choose Your Beans' },
          { id: 'define-profile', href: '/coffee-lab/build-your-own-blend#define-your-profile', label: 'Define Your Profile' },
          { id: 'blend-development', href: '/coffee-lab/build-your-own-blend#blend-development', label: 'Blend Development' },
          { id: 'tasting-adjustment', href: '/coffee-lab/build-your-own-blend#tasting-adjustment', label: 'Tasting & Adjustment' },
        ],
      },
      {
        id: 'coffee-experiments',
        href: '/coffee-lab/coffee-experiments',
        label: 'Coffee Experiments',
        children: [
          { id: 'cupping-events', href: '/coffee-lab/coffee-experiments#cupping-events', label: 'Cupping Events' },
          { id: 'roasting-experiments', href: '/coffee-lab/coffee-experiments#roasting-experiments', label: 'Roasting Experiments' },
          { id: 'brewing-experiments', href: '/coffee-lab/coffee-experiments#brewing-experiments', label: 'Brewing Experiments' },
        ],
      },
    ],
  },
];'''

text = re.sub(r'type NavItem = \{[\s\S]*?const NAV_ITEMS: NavItem\[\] = \[[\s\S]*?\];', nav_items_replacement, text)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated NAV_ITEMS in navbar.tsx successfully!")

