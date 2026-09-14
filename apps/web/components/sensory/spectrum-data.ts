export const SENSORY_PROFILES = [
  {
    id: 'floral', name: 'Floral & Jasmine', notes: 'Melati · Lavender · Mawar', color: '#246A73',
    rotation: 0,
    description: 'Aroma ringan yang mengingatkan pada bunga segar, teh putih, atau melati. Karakter ini biasanya terasa bersih, wangi, dan elegan.',
    cue: 'Cium aromanya saat kopi mulai hangat, lalu cari kesan bunga yang lembut di bagian akhir tegukan.',
  },
  {
    id: 'fruity', name: 'Fruity & Berry', notes: 'Stroberi · Persik · Ceri', color: '#A52136',
    rotation: 45,
    description: 'Rasa manis-asam yang menyerupai buah matang atau beri. Bisa tampil juicy, cerah, dan berlapis.',
    cue: 'Perhatikan sensasi buah yang muncul di tengah tegukan dan berubah saat suhu seduhan turun.',
  },
  {
    id: 'acidic', name: 'Sour & Acidic', notes: 'Jeruk · Mandarin · Apel', color: '#E57A44',
    rotation: 90,
    description: 'Keasaman segar seperti jeruk, mandarin, atau apel. Bukan rasa masam tajam, melainkan kesan cerah yang membuat kopi hidup.',
    cue: 'Cari rasa segar di sisi lidah dan aftertaste yang bersih setelah menelan.',
  },
  {
    id: 'green', name: 'Green & Vegetative', notes: 'Herbal · Daun · Teh Hijau', color: '#4D8B62',
    rotation: 135,
    description: 'Karakter segar yang mengingatkan pada daun, herbal, teh hijau, atau sayuran muda. Dapat terasa ringan maupun earthy.',
    cue: 'Cari aroma daun atau herbal saat kopi hangat dan perubahan rasanya ketika suhu mulai turun.',
  },
  {
    id: 'other', name: 'Other', notes: 'Fermentasi · Winey · Earthy', color: '#3E91AA',
    rotation: 180,
    description: 'Kelompok karakter yang lebih unik, seperti fermentasi, winey, mineral, atau earthy. Biasanya memberi identitas kuat pada suatu origin.',
    cue: 'Perhatikan aroma yang terasa tidak seperti buah, bunga, atau rempah dan bagaimana ia bertahan di aftertaste.',
  },
  {
    id: 'spices', name: 'Spices & Herbal', notes: 'Kayu Manis · Cengkeh · Herbal', color: '#8B5E3C',
    rotation: 225,
    description: 'Aroma hangat atau earthy yang mengingatkan pada rempah, daun herbal, kayu manis, dan cengkeh.',
    cue: 'Nikmati perlahan saat kopi mendingin; karakter rempah biasanya lebih jelas di akhir.',
  },
  {
    id: 'nutty', name: 'Nutty', notes: 'Almond · Hazelnut · Kacang', color: '#8C5E34',
    rotation: 270,
    description: 'Rasa gurih-manis seperti almond, hazelnut, atau kacang panggang yang membuat seduhan terasa bulat dan akrab.',
    cue: 'Cari kesan kacang panggang di tengah tegukan dan rasa gurih yang tinggal sesudahnya.',
  },
  {
    id: 'sweet', name: 'Sweet', notes: 'Madu · Karamel · Gula Aren', color: '#D7A84D',
    rotation: 315,
    description: 'Manis lembut dengan nuansa madu, gula aren, atau karamel. Memberi kesan bulat dan nyaman pada seduhan.',
    cue: 'Rasakan manis yang menetap setelah kopi ditelan, bukan hanya saat tegukan pertama.',
  },
] as const;
