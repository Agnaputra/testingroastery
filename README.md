# 52 Coffee & Roastery — E-Commerce & Virtual Barista RAG System
> **Artisanal Roasting, Precision Extraction**  
> Jl. KH. Agus Salim No. 11, Sukoharjo, Kec. Klojen, Kota Malang, Jawa Timur 65118

Sistem e-commerce mandiri lengkap dengan asisten AI **Virtual Barista** berbasis *Retrieval-Augmented Generation (RAG)* untuk **52 Coffee & Roastery**. Dirancang dengan estetika *Minimalist Editorial Specialty Roastery* (terinspirasi dari [nircoffee.id](https://nircoffee.id/)), mengusung identitas warna dan filosofi sangrai asli 52 Coffee.

---

## ☕ 1. Identitas Visual & Desain Sistem

### Palet Warna (Tailwind Tokens)
- `roastery-dark`: `#1C130E` (Espresso Dark - teks utama, dark banner, footer)
- `roastery-charcoal`: `#2B2623` (Kontras teks sekunder)
- `roastery-caramel`: `#B85D26` (Aksen primer, tombol CTA, highlight rasa)
- `roastery-amber`: `#D48B47` (Badge kategori, garis aksen, rating)
- `roastery-cream`: `#F9F6F0` (Latar belakang utama / soft parchment)
- `roastery-card`: `#FFFFFF` (Kontainer kartu produk & modal)
- `roastery-sage`: `#53624F` (Tag proses pascapanen / natural / wash)
- `roastery-muted`: `#78716C` (Metadata, subtitle, deskripsi sekunder)

### Tipografi
- **Headings & Display**: `Playfair Display` (Serif elegan editorial)
- **Body UI**: `Plus Jakarta Sans` (Clean sans-serif)
- **Metrics & Numbers**: `JetBrains Mono` (Monospace untuk gramasi, rasio seduh, dan harga)

---

## 🗂️ 2. Struktur Arsitektur Monorepo

```
testingroastery/
├── apps/
│   ├── web/                          # Frontend Next.js 14+ App Router (TypeScript + Tailwind)
│   │   ├── app/
│   │   │   ├── layout.tsx            # Root Layout (Playfair, Plus Jakarta Sans, JetBrains Mono)
│   │   │   ├── page.tsx              # Editorial Homepage (Hero, Fresh Crop, Reserve, Slowbar, Story)
│   │   │   ├── catalog/
│   │   │   │   ├── page.tsx          # Catalog dengan filter multi-kategori, series, rasa, & pencarian
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # Detail Produk (Specs origin, Dynamic Weight & Grind Selector, Recipe)
│   │   │   ├── tools/
│   │   │   │   └── brew-calculator/  # Panduan Slowbar & Interactive Brew Ratio Stopwatch
│   │   │   ├── checkout/             # Checkout Page (Pengiriman JNE/Instant, Midtrans Snap Simulation)
│   │   │   └── api/
│   │   │       └── chat/route.ts     # Proxy AI route ke Backend FastAPI + Smart RAG fallback
│   │   ├── components/
│   │   │   ├── navbar.tsx            # Minimalist editorial header dengan cart counter
│   │   │   ├── footer.tsx            # Roastery details, alamat Malang, Linktree, IG
│   │   │   ├── product-card.tsx      # Specialty coffee card dengan quick add & process badge
│   │   │   ├── weight-selector.tsx   # Dynamic size selector (16g, 50g, 100g, 200g, 500g, 1kg)
│   │   │   ├── grind-selector.tsx    # Pilihan gilingan: Whole Beans, Coarse, Medium, Fine
│   │   │   ├── brew-calculator.tsx   # Kalkulator rasio seduh interaktif & timeline tuangan air
│   │   │   ├── cart-drawer.tsx       # Slide-over cart drawer dengan progress free shipping
│   │   │   └── virtual-barista.tsx   # Floating AI Barista chatbot dengan product recommendation cards
│   │   ├── lib/
│   │   │   ├── data.ts               # Dataset lengkap 52 Coffee & Roastery
│   │   │   └── store/
│   │   │       └── useCartStore.ts   # State management keranjang belanja (Zustand persist)
│   │   ├── tailwind.config.ts        # Token warna & font 52 Coffee
│   │   └── package.json
│   │
│   └── ai-backend/                   # Backend AI Microservice (FastAPI + pgvector + Gemini + NeMo)
│       ├── app/
│       │   ├── main.py               # FastAPI entrypoint (/health, /api/chat, /api/search, /api/products)
│       │   ├── config.py             # App configuration & Gemini settings
│       │   ├── database.py           # PostgreSQL SQLAlchemy connection
│       │   ├── models.py             # Pydantic schemas & response models
│       │   ├── rag_service.py        # Vector similarity search & Gemini RAG reasoning
│       │   ├── guardrails/           # NVIDIA NeMo Guardrails configuration
│       │   │   ├── config.yml        # Rails configuration
│       │   │   ├── prompts.yml       # Moderation & hallucination grounding prompts
│       │   │   └── rails.colang      # Colang dialogue flows
│       │   └── seed_data.py          # Script seeder menu ke PostgreSQL
│       ├── schema.sql                # Skema DDL lengkap PostgreSQL + pgvector
│       ├── requirements.txt          # Python dependencies
│       └── .env.example
├── package.json                      # Root scripts
└── README.md
```

---

## 📦 3. Data Menu Asli 52 Coffee & Roastery

1. **Filter Based — Ijen Series**:
   - *Ijen Carbonic Maceration*: Peach, Jasmine, Rich Taste, Medium Body (100g: 65K, 200g: 120K, 500g: 320K)
   - *Ijen Lactic*: Mango, Lychee, Lime, Creamy, Chocolate (100g: 59K, 200g: 109K, 500g: 290K)
   - *Ijen Yellow Bourbon*: Honey, Almond, Smooth Body (100g: 59K, 200g: 109K, 500g: 290K)
2. **Filter Based — Sunda Series**:
   - *Puntang Honey*: Honey, Peach, Chocolate-Like (100g: 95K, 200g: 179K, 500g: 379K)
   - *Puntang Natural*: Pineapple, Berry, Jackfruit (100g: 99K, 200g: 185K, 500g: 399K)
3. **Filter Based — Java Exotic Series**:
   - *Sindoro Strawberry Triple Yeast*: Sweet Jammy Strawberry, Vanilla (100g: 119K, 200g: 220K)
   - *Sumbing Supernova Wash*: Explosive Berry, Complex, Candy-Like (100g: 139K, 200g: 259K)
   - *Prau Natural Secret Project*: Strawberry Candy, White Floral, Fruit Punch (100g: 139K, 200g: 259K)
4. **Filter Based — Grand Reserve Micro-Lot**:
   - *Magnum Sidra El Vergel Cauca (Colombia)*: Tropical, Syrup, Layered Cocoa, Brown Sugar (16g: 72K, 50g: 180K, 100g: 350K, 200g: 685K)
   - *El Triunfo Geisha Tolima (Colombia)*: Jasmine, Bergamot, Peach, Tea-Like (16g: 86K, 50g: 200K, 100g: 380K, 200g: 709K)
   - *Yemen Haraz Golden Harvest (Yemen)*: Sweet Jammy Strawberry, Vanilla (16g: 59K, 50g: 165K, 100g: 229K, 200g: 549K)
5. **Espresso Based Roast Profiles**:
   - *Dampit Natural (Robusta Malang)*: Chocolate, Brown Sugar, Full Body (200g: 35K, 500g: 85K, 1kg: 150K)
   - *Kintamani Full Wash (Arabica Bali)*: Chocolate, Brown Sugar, Full Body (200g: 70K, 500g: 135K, 1kg: 260K)
   - *Brazil Santos (Arabica)*: Earthy, Dark Chocolate, Full Body (200g: 92K, 500g: 175K, 1kg: 340K)

---

## 🚀 4. Cara Menjalankan Proyek

### A. Frontend Web (Next.js)
```bash
cd apps/web
npm install
npm run dev
```
Buka browser di **http://localhost:3000**

### B. Backend AI Microservice (FastAPI)
```bash
cd apps/ai-backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Swagger UI API Docs dapat diakses di **http://localhost:8000/docs**
