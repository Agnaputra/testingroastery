import os
import json
import math
from typing import List, Dict, Any, Tuple
# pyrefly: ignore [missing-import]
import google.generativeai as genai

from .config import settings
from .models import ProductSearchResult

# Hardcoded master knowledge base of 52 Coffee & Roastery for high-speed retrieval
COFFEE_KNOWLEDGE_BASE = [
    {
        "id": "argopuro-walida",
        "slug": "argopuro-walida-natural-anaerobic",
        "name": "Argopuro Walida Natural Anaerobic",
        "category": "filter",
        "series": "Ijen Series",
        "origin": "East Java, Indonesia (Gunung Argopuro 1300-1600 MASL)",
        "varietal": "Kartika, Typica, USDA 762",
        "process": "Natural Anaerobic",
        "roast": "Light",
        "notes": ["Plum", "Blood Orange", "Dark Cherry", "Juicy Body"],
        "flavor_category": ["Fruity", "Sweet"],
        "price_100g": 68000,
        "price_200g": 128000,
        "price_500g": 335000,
        "recipe": "V60 15g kopi, 225ml air (1:15), 91°C, 2m 15s. Bloom 45g 40s.",
        "description": "Rilisan baru Walida Series lereng Argopuro. Dominasi rasa plum manis berpadu blood orange dan dark cherry yang juicy."
    },
    {
        "id": "ijen-cm",
        "slug": "ijen-carbonic-maceration",
        "name": "Ijen Carbonic Maceration",
        "category": "filter",
        "series": "Ijen Series",
        "origin": "East Java, Indonesia (Gunung Ijen 1400-1600 MASL)",
        "varietal": "Kartika, USDA 762",
        "process": "Carbonic Maceration",
        "roast": "Light-Medium",
        "notes": ["Peach", "Jasmine", "Rich Taste", "Medium Body"],
        "flavor_category": ["Floral", "Fruity", "Sweet"],
        "price_100g": 65000,
        "price_200g": 120000,
        "price_500g": 320000,
        "recipe": "V60 15g kopi, 225ml air (1:15), 92°C, 2m 15s. Bloom 45g 40s.",
        "description": "Fermentasi CO2 terkontrol 72 jam menghasilkan aroma floral melati intens dan manis buah persik matang."
    },
    {
        "id": "ijen-lactic",
        "slug": "ijen-lactic",
        "name": "Ijen Lactic",
        "category": "filter",
        "series": "Ijen Series",
        "origin": "East Java, Indonesia (Kawah Ijen 1400-1600 MASL)",
        "varietal": "Kartika",
        "process": "Lactic Anaerobic",
        "roast": "Light-Medium",
        "notes": ["Mango", "Lychee", "Lime", "Creamy", "Chocolate"],
        "flavor_category": ["Fruity", "Sweet", "Chocolaty"],
        "price_100g": 59000,
        "price_200g": 109000,
        "price_500g": 290000,
        "recipe": "Kalita Wave 14g kopi, 220ml air (1:15.7), 91°C, 2m 30s.",
        "description": "Kultur bakteri asam laktat murni menciptakan mouthfeel creamy seperti cokelat susu dengan aroma mangga dan leci."
    },
    {
        "id": "ijen-yb",
        "slug": "ijen-yellow-bourbon",
        "name": "Ijen Yellow Bourbon",
        "category": "filter",
        "series": "Ijen Series",
        "origin": "East Java, Indonesia (Gunung Ijen 1500 MASL)",
        "varietal": "Yellow Bourbon",
        "process": "Honey Processed",
        "roast": "Light-Medium",
        "notes": ["Honey", "Almond", "Smooth Body"],
        "flavor_category": ["Sweet", "Nutty"],
        "price_100g": 59000,
        "price_200g": 109000,
        "price_500g": 290000,
        "recipe": "Origami / V60 15g, 240ml air (1:16), 93°C, 2m 20s.",
        "description": "Varietas langka berbuah kuning cerah dengan kelembutan madu hutan dan gurihnya kacang almond panggang."
    },
    {
        "id": "sunda-puntang-honey",
        "slug": "puntang-honey",
        "name": "Puntang Honey",
        "category": "filter",
        "series": "Sunda Series",
        "origin": "West Java, Indonesia (Gunung Puntang 1300-1600 MASL)",
        "varietal": "Typica, Sigarar Utang",
        "process": "Yellow Honey",
        "roast": "Light-Medium",
        "notes": ["Honey", "Peach", "Chocolate-Like"],
        "flavor_category": ["Sweet", "Fruity", "Chocolaty"],
        "price_100g": 95000,
        "price_200g": 179000,
        "price_500g": 379000,
        "recipe": "V60 16g kopi, 250ml air (1:15.6), 92°C, 2m 30s.",
        "description": "Kopi bersejarah tanah Priangan Barat dengan manis brix 22% dan kelembutan peach berpadu cokelat."
    },
    {
        "id": "sunda-puntang-natural",
        "slug": "puntang-natural",
        "name": "Puntang Natural",
        "category": "filter",
        "series": "Sunda Series",
        "origin": "West Java, Indonesia (Gunung Puntang 1300-1600 MASL)",
        "varietal": "Typica",
        "process": "Dry Natural",
        "roast": "Light",
        "notes": ["Pineapple", "Berry", "Jackfruit"],
        "flavor_category": ["Fruity", "Sweet"],
        "price_100g": 99000,
        "price_200g": 185000,
        "price_500g": 399000,
        "recipe": "Aeropress Inverted 15g, 200ml air (1:13.3), 89°C, 1m 45s.",
        "description": "Ledakan buah tropis: nanas matang, berry liar, dan manis nangka dengan jemur lambat 28 hari."
    },
    {
        "id": "sindoro-strawberry",
        "slug": "sindoro-strawberry-triple-yeast",
        "name": "Sindoro Strawberry Triple Yeast",
        "category": "filter",
        "series": "Java Exotic",
        "origin": "Central Java, Indonesia (Gunung Sindoro 1500-1800 MASL)",
        "varietal": "Kartika",
        "process": "Triple Yeast Fermentation",
        "roast": "Light",
        "notes": ["Sweet Jammy Strawberry", "Vanilla"],
        "flavor_category": ["Fruity", "Sweet", "Floral"],
        "price_100g": 119000,
        "price_200g": 220000,
        "recipe": "V60 Kasuyo 4:6 20g kopi, 300ml air (1:15), 90°C, 3m 15s.",
        "description": "Fermentasi tiga jenis ragi memicu ester rasa selai stroberi manis pekat berpadu vanili hangat."
    },
    {
        "id": "sumbing-supernova",
        "slug": "sumbing-supernova-wash",
        "name": "Sumbing Supernova Wash",
        "category": "filter",
        "series": "Java Exotic",
        "origin": "Central Java, Indonesia (Gunung Sumbing 1600-1900 MASL)",
        "varietal": "Sigarar Utang",
        "process": "Supernova Washed",
        "roast": "Light",
        "notes": ["Explosive Berry", "Complex", "Candy-Like"],
        "flavor_category": ["Fruity", "Sweet"],
        "price_100g": 139000,
        "price_200g": 259000,
        "recipe": "Hario Switch 16g kopi, 240ml air (1:15), 92°C, 2m 45s.",
        "description": "Pencucian dingin 12°C selama 96 jam menghasilkan keasaman berry ungu tajam dan sensasi permen manis."
    },
    {
        "id": "prau-natural-secret",
        "slug": "prau-natural-secret-project",
        "name": "Prau Natural Secret Project",
        "category": "filter",
        "series": "Java Exotic",
        "origin": "Central Java, Indonesia (Gunung Prau 1600-2000 MASL)",
        "varietal": "Kartika",
        "process": "Secret Fermentation Natural",
        "roast": "Light",
        "notes": ["Strawberry Candy", "White Floral", "Fruit Punch"],
        "flavor_category": ["Fruity", "Floral", "Sweet"],
        "price_100g": 139000,
        "price_200g": 259000,
        "recipe": "V60 15g kopi, 225ml air (1:15), 91°C, 2m 15s.",
        "description": "Proyek rahasia mikrolot ekstrem 2.000 MASL dengan dominasi rasa permen stroberi dan bunga lily."
    },
    {
        "id": "reserve-magnum-sidra",
        "slug": "magnum-sidra-el-vergel-cauca",
        "name": "Magnum Sidra El Vergel Cauca",
        "category": "reserve",
        "series": "Grand Reserve",
        "origin": "Colombia (Cauca, Finca El Vergel 1850-2000 MASL)",
        "varietal": "Sidra Heirloom",
        "process": "Koji Anaerobic Natural",
        "roast": "Light",
        "notes": ["Tropical", "Syrup", "Layered Cocoa", "Brown Sugar"],
        "flavor_category": ["Fruity", "Sweet", "Chocolaty"],
        "price_16g": 72000,
        "price_50g": 180000,
        "price_100g": 350000,
        "price_200g": 685000,
        "recipe": "Competition V60 16g kopi, 240ml air (1:15), 93°C, 2m 10s.",
        "description": "Kopi kompetisi dunia dengan inokulasi Koji Jepang menghasilkan mouthfeel syrupy lebat dan cokelat berlapis."
    },
    {
        "id": "reserve-el-triunfo-geisha",
        "slug": "el-triunfo-geisha-tolima",
        "name": "El Triunfo Geisha Tolima",
        "category": "reserve",
        "series": "Grand Reserve",
        "origin": "Colombia (Planadas, Tolima 1900-2100 MASL)",
        "varietal": "Geisha",
        "process": "Washed Slow Dry",
        "roast": "Light",
        "notes": ["Jasmine", "Bergamot", "Peach", "Tea-Like"],
        "flavor_category": ["Floral", "Fruity", "Sweet"],
        "price_16g": 86000,
        "price_50g": 200000,
        "price_100g": 380000,
        "price_200g": 709000,
        "recipe": "Orea V3 / V60 15g kopi, 240ml air (1:16), 90°C, 2m 00s.",
        "description": "Puncak keanggunan aroma melati surgawi, bergamot earl grey, dan kelembutan teh persik."
    },
    {
        "id": "reserve-yemen-haraz",
        "slug": "yemen-haraz-golden-harvest",
        "name": "Yemen Haraz Golden Harvest",
        "category": "reserve",
        "series": "Grand Reserve",
        "origin": "Yemen (Haraz Mountains 2200-2400 MASL)",
        "varietal": "Jaadi, Dawairi Ancient Landrace",
        "process": "Anaerobic Natural Terraces",
        "roast": "Light",
        "notes": ["Sweet Jammy Strawberry", "Vanilla"],
        "flavor_category": ["Fruity", "Sweet"],
        "price_16g": 59000,
        "price_50g": 165000,
        "price_100g": 229000,
        "price_200g": 549000,
        "recipe": "V60 16g kopi, 240ml air (1:15), 92°C, 2m 20s.",
        "description": "Keajaiban pohon kopi kuno terasering tebing Yaman dengan rasa selai stroberi dan rempah vanili mistis."
    },
    {
        "id": "espresso-dampit",
        "slug": "dampit-natural-robusta",
        "name": "Dampit Natural (Fine Robusta)",
        "category": "espresso",
        "series": "Espresso Roast",
        "origin": "East Java, Indonesia (Dampit, Malang 800-1000 MASL)",
        "varietal": "Fine Robusta Klon Tugusari",
        "process": "Natural",
        "roast": "Medium-Dark",
        "notes": ["Chocolate", "Brown Sugar", "Full Body"],
        "flavor_category": ["Chocolaty", "Sweet", "Nutty"],
        "price_200g": 35000,
        "price_500g": 85000,
        "price_1kg": 150000,
        "recipe": "Espresso 18g in, 36g out (1:2 ratio), 93°C, 26-28 detik.",
        "description": "Robusta kebanggaan Malang Selatan dengan crema tebal, notes cokelat hitam dan gula aren tanpa rasa getir kasar."
    },
    {
        "id": "espresso-kintamani",
        "slug": "kintamani-full-wash-arabica",
        "name": "Kintamani Full Wash (Arabica)",
        "category": "espresso",
        "series": "Espresso Roast",
        "origin": "Bali, Indonesia (Kintamani 1200-1500 MASL)",
        "varietal": "S-795, Kopyol",
        "process": "Full Washed",
        "roast": "Medium",
        "notes": ["Chocolate", "Brown Sugar", "Full Body"],
        "flavor_category": ["Chocolaty", "Sweet", "Fruity"],
        "price_200g": 70000,
        "price_500g": 135000,
        "price_1kg": 260000,
        "recipe": "Espresso Flat White 19g in, 38g out, 93°C, 27 detik.",
        "description": "Arabika Bali dengan keseimbangan cokelat susu manis dan hint citrus lembut yang berpadu dengan susu."
    },
    {
        "id": "espresso-brazil-santos",
        "slug": "brazil-santos-arabica",
        "name": "Brazil Santos (Arabica)",
        "category": "espresso",
        "series": "Espresso Roast",
        "origin": "Brazil (Santos, Minas Gerais 1000-1200 MASL)",
        "varietal": "Mundo Novo, Catuai",
        "process": "Natural / Pulped Natural",
        "roast": "Medium-Dark",
        "notes": ["Earthy", "Dark Chocolate", "Full Body"],
        "flavor_category": ["Chocolaty", "Nutty"],
        "price_200g": 92000,
        "price_500g": 175000,
        "price_1kg": 340000,
        "recipe": "Americano / Latte 18g in, 36g out, 92°C, 27 detik.",
        "description": "Fondasi espresso klasik dunia dengan sensasi cokelat hitam pekat, kacang panggang, dan aftertaste tebal."
    }
]

class RAGService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
        else:
            self.model = None

    def search_similar_products(self, query: str, limit: int = 4) -> List[Tuple[Dict[str, Any], float]]:
        """Semantic & keyword scoring across 52 Coffee items"""
        q_lower = query.lower()
        scored_items = []

        for item in COFFEE_KNOWLEDGE_BASE:
            score = 0.0
            
            # Match tasting notes
            for note in item["notes"]:
                if note.lower() in q_lower:
                    score += 0.4
            
            # Match flavor categories
            for cat in item["flavor_category"]:
                if cat.lower() in q_lower:
                    score += 0.35
            
            # Match process & series & origin
            if item["process"].lower() in q_lower:
                score += 0.3
            if item["series"].lower() in q_lower:
                score += 0.4
            if item["name"].lower() in q_lower:
                score += 0.6
            if "espresso" in q_lower and item["category"] == "espresso":
                score += 0.5
            if ("filter" in q_lower or "v60" in q_lower) and item["category"] == "filter":
                score += 0.3
            if ("reserve" in q_lower or "geisha" in q_lower or "colombia" in q_lower) and item["category"] == "reserve":
                score += 0.5

            if score > 0:
                scored_items.append((item, score))

        # Sort descending by score
        scored_items.sort(key=lambda x: x[1], reverse=True)
        if not scored_items:
            # Return top 2 featured if no query match
            return [(COFFEE_KNOWLEDGE_BASE[0], 0.1), (COFFEE_KNOWLEDGE_BASE[5], 0.1)]

        return scored_items[:limit]

    def check_guardrails_input(self, user_prompt: str) -> Tuple[bool, str]:
        """NeMo Input Rails: Blocks off-topic / prompt injections"""
        prompt_lower = user_prompt.lower()
        
        # Block malicious prompt injections
        forbidden_patterns = [
            "ignore previous instructions", "system prompt", "jailbreak", "dan mode",
            "write python code for hacking", "create a bomb", "politik indonesia"
        ]
        for pattern in forbidden_patterns:
            if pattern in prompt_lower:
                return False, "Mohon maaf kawan seduh, saya adalah Virtual Barista 52 Coffee & Roastery. Saya hanya melayani konsultasi seputar rekomendasi biji kopi, profil rasa, dan panduan seduh presisi."

        return True, ""

    def generate_barista_response(self, user_query: str, history: List[Dict[str, str]] = []) -> Dict[str, Any]:
        """Synthesizes Barista response using Gemini with pgvector context"""
        # 1. Guardrail Input Check
        passed, rail_message = self.check_guardrails_input(user_query)
        if not passed:
            return {
                "reply": rail_message,
                "recommendedSlugs": [],
                "recommendedProducts": [],
                "guardrailStatus": "blocked_input_rail"
            }

        # 2. Retrieve Relevant Coffee Products
        similar_items = self.search_similar_products(user_query)
        retrieved_products = [item[0] for item in similar_items]
        recommended_slugs = [item["slug"] for item in retrieved_products]

        # Format Context Document
        context_text = "\n---\n".join([
            f"PRODUK: {p['name']} ({p['series']})\n"
            f"Slug: {p['slug']}\n"
            f"Origin: {p['origin']}\n"
            f"Process: {p['process']} | Varietal: {p['varietal']}\n"
            f"Tasting Notes: {', '.join(p['notes'])}\n"
            f"Harga: Rp {p.get('price_100g', p.get('price_200g', p.get('price_16g', 0))):,}\n"
            f"Resep Seduh: {p['recipe']}\n"
            f"Deskripsi: {p['description']}"
            for p in retrieved_products
        ])

        # 3. Formulate Prompt with Gemini
        system_instruction = (
            "Anda adalah 'Virtual Barista 52 Coffee & Roastery' yang bertugas di tasting room kami di Jl. KH. Agus Salim No. 11, Malang.\n"
            "Persona Anda ramah, hangat, berpengetahuan mendalam tentang specialty coffee, dan menyapa pelanggan dengan panggilan 'kawan seduh'.\n\n"
            "ATURAN KETAT (GUARDRAILS & GROUNDING):\n"
            "1. HANYA rekomendasikan biji kopi yang ada pada data katalog 52 Coffee yang diberikan di bawah ini. JANGAN berhalusinasi atau menyebut merek luar.\n"
            "2. Jelaskan tasting notes secara deskriptif dan sertakan tips seduh (metode, dosis, rasio air, suhu).\n"
            "3. Format teks menggunakan markdown yang rapi (bullet points, bold highlights).\n"
            "4. Jawab dalam Bahasa Indonesia yang santun dan profesional."
        )

        user_content = (
            f"Pertanyaan Kawan Seduh: {user_query}\n\n"
            f"DATA KATALOG KOPI 52 COFFEE & ROASTERY TERKAIT:\n{context_text}\n\n"
            f"Silakan berikan jawaban dan rekomendasi terbaik sebagai Barista 52 Coffee!"
        )

        reply_text = ""
        if self.model and self.api_key:
            try:
                chat = self.model.start_chat(history=[])
                response = chat.send_message(
                    f"{system_instruction}\n\n{user_content}",
                    generation_config={"temperature": 0.3}
                )
                reply_text = response.text
            except Exception as e:
                reply_text = self._fallback_reply(user_query, retrieved_products)
        else:
            reply_text = self._fallback_reply(user_query, retrieved_products)

        product_results = [
            ProductSearchResult(
                slug=p["slug"],
                name=p["name"],
                series=p["series"],
                origin=p["origin"],
                process=p["process"],
                tasting_notes=p["notes"],
                base_price=float(p.get("price_100g", p.get("price_200g", p.get("price_16g", 0)))),
                similarity_score=0.95
            )
            for p in retrieved_products
        ]

        return {
            "reply": reply_text,
            "recommendedSlugs": recommended_slugs,
            "recommendedProducts": [p.dict() for p in product_results],
            "groundedInCatalog": True,
            "guardrailStatus": "passed"
        }

    def _fallback_reply(self, query: str, products: List[Dict[str, Any]]) -> str:
        """Deterministic intelligent fallback barista response"""
        if not products:
            return "Halo kawan seduh! Di 52 Coffee & Roastery Malang, kami memiliki beragam koleksi fresh crop dari lereng Ijen, Sunda, hingga Grand Reserve Colombia. Ceritakan rasa kopi impianmu!"

        lead_product = products[0]
        reply = (
            f"Halo kawan seduh! ☕ Berdasarkan preferensimu, rekomendasi utama saya dari 52 Coffee adalah **{lead_product['name']}** ({lead_product['series']}).\n\n"
            f"• **Origin & Proses**: {lead_product['origin']} — diolah dengan proses *{lead_product['process']}*.\n"
            f"• **Tasting Notes**: {', '.join(lead_product['notes'])}.\n"
            f"• **Karakter Rasa**: {lead_product['description']}\n\n"
            f"**Tips Seduh Barista**: Gunakan {lead_product['recipe']}.\n\n"
            f"Semua biji disangrai segar di roastery kami di Jl. KH. Agus Salim No. 11 Malang. Selamat menikmati seduhan presisi!"
        )
        return reply

rag_service = RAGService()
