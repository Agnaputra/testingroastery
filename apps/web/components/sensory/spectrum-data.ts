export interface SensoryProfile {
  id: string;
  name: string;
  notes: string;
  color: string;
  rotation: number;
  description: string;
  cue: string;
  aroma: string;
  body: string;
  aftertaste: string;
}

export const SENSORY_PROFILES: SensoryProfile[] = [
  {
    id: 'floral',
    name: 'Floral',
    notes: 'Melati · Lavender · Mawar',
    color: '#246A73',
    rotation: 225,
    description: 'Aroma ringan yang mengingatkan pada bunga segar, teh putih, atau melati. Karakter ini biasanya terasa bersih, wangi, dan elegan.',
    cue: 'Cium aromanya saat kopi mulai hangat, lalu cari kesan bunga yang lembut di bagian akhir tegukan.',
    aroma: 'Bunga melati segar, lavender, teh putih, orange blossom',
    body: 'Light, silky, tea-like clarity',
    aftertaste: 'Clean, floral sweetness, refreshing finish',
  },
  {
    id: 'fruity',
    name: 'Fruity',
    notes: 'Stroberi · Persik · Ceri',
    color: '#A52136',
    rotation: -90,
    description: 'Rasa manis-asam yang menyerupai buah matang atau beri. Bisa tampil juicy, cerah, dan berlapis.',
    cue: 'Perhatikan sensasi buah yang muncul di tengah tegukan dan berubah saat suhu seduhan turun.',
    aroma: 'Buah beri matang, peach, stone fruit, plum',
    body: 'Medium, juicy, syrupy mouthfeel',
    aftertaste: 'Sweet berry jam lingering, pleasant acidity',
  },
  {
    id: 'acidic',
    name: 'Sour / Acidic',
    notes: 'Jeruk · Mandarin · Apel',
    color: '#E57A44',
    rotation: 180,
    description: 'Keasaman segar seperti jeruk, mandarin, atau apel. Bukan rasa masam tajam, melainkan kesan cerah yang membuat kopi hidup.',
    cue: 'Cari rasa segar di sisi lidah dan aftertaste yang bersih setelah menelan.',
    aroma: 'Kulit jeruk segar, mandarin, apel hijau, bergamot',
    body: 'Crisp, lively, vibrant structure',
    aftertaste: 'Bright citric finish, palate cleansing',
  },
  {
    id: 'green',
    name: 'Green / Vegetative',
    notes: 'Herbal · Daun · Teh Hijau',
    color: '#4D8B62',
    rotation: 135,
    description: 'Karakter segar yang mengingatkan pada daun, herbal, teh hijau, atau sayuran muda. Dapat terasa ringan maupun earthy.',
    cue: 'Cari aroma daun atau herbal saat kopi hangat dan perubahan rasanya ketika suhu mulai turun.',
    aroma: 'Daun teh hijau, lemongrass, eucalyptus, botanikal',
    body: 'Smooth, light to medium, delicate',
    aftertaste: 'Herbal coolness, earthy sweetness',
  },
  {
    id: 'other',
    name: 'Other',
    notes: 'Fermentasi · Winey · Earthy',
    color: '#3E91AA',
    rotation: 90,
    description: 'Kelompok karakter yang lebih unik, seperti fermentasi, winey, mineral, atau earthy. Biasanya memberi identitas kuat pada suatu origin.',
    cue: 'Perhatikan aroma yang terasa tidak seperti buah, bunga, atau rempah dan bagaimana ia bertahan di aftertaste.',
    aroma: 'Red wine, fermented grapes, cacao nibs, dried fruit',
    body: 'Heavy, velvety, complex weight',
    aftertaste: 'Prolonged winey finish, deep sweetness',
  },
  {
    id: 'spices',
    name: 'Spices',
    notes: 'Kayu Manis · Cengkeh · Rempah',
    color: '#8B5E3C',
    rotation: -45,
    description: 'Aroma hangat atau earthy yang mengingatkan pada rempah, daun herbal, kayu manis, dan cengkeh.',
    cue: 'Nikmati perlahan saat kopi mendingin; karakter rempah biasanya lebih jelas di akhir.',
    aroma: 'Kayu manis, cengkeh, kapulaga, nutmeg',
    body: 'Medium to full, round, comforting warmth',
    aftertaste: 'Warm spicy finish, lingering sweet spice',
  },
  {
    id: 'nutty',
    name: 'Nutty',
    notes: 'Almond · Hazelnut · Kacang Panggang',
    color: '#8C5E34',
    rotation: 0,
    description: 'Rasa gurih-manis seperti almond, hazelnut, atau kacang panggang yang membuat seduhan terasa bulat dan akrab.',
    cue: 'Cari kesan kacang panggang di tengah tegukan dan rasa gurih yang tinggal sesudahnya.',
    aroma: 'Roasted hazelnut, almond, toasted walnut',
    body: 'Creamy, coating, dense texture',
    aftertaste: 'Nutty cocoa, toasted sweetness',
  },
  {
    id: 'sweet',
    name: 'Sweet',
    notes: 'Madu · Karamel · Gula Aren',
    color: '#D7A84D',
    rotation: 45,
    description: 'Manis lembut dengan nuansa madu, gula aren, atau karamel. Memberi kesan bulat dan nyaman pada seduhan.',
    cue: 'Rasakan manis yang menetap setelah kopi ditelan, bukan hanya saat tegukan pertama.',
    aroma: 'Gula aren cair, toffee, brown sugar, honey',
    body: 'Rich, smooth, rounded sweet body',
    aftertaste: 'Long caramel finish, brown sugar lingering',
  },
];
