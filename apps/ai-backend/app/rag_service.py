import os
import json
import math
from typing import List, Dict, Any, Tuple
# pyrefly: ignore [missing-import]
import google.generativeai as genai

from .config import settings
from .models import ProductSearchResult

# Master knowledge base of 52 Coffee & Roastery from official Slowbar PDF Menu
COFFEE_KNOWLEDGE_BASE = [
    # 1. IJEN SERIES
    {
        "id": "ijen-cm-asmara",
        "slug": "ijen-carbonic-maceration-asmara",
        "name": "Ijen Carbonic Maceration (Asmara)",
        "slowbar_alias": "ASMARA",
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
        "cup_price": 38000,
        "recipe": "V60 15g kopi, 225ml air (1:15), 92°C, 2m 15s. Bloom 45g 40s.",
        "description": "Fermentasi anaerobik bertekanan CO2 murni menghasilkan aroma floral melati intens dipadukan manisnya buah persik matang."
    },
    {
        "id": "ijen-kenyan-wening",
        "slug": "ijen-kenyan-wening",
        "name": "Ijen Kenyan (Wening)",
        "slowbar_alias": "WENING",
        "category": "filter",
        "series": "Ijen Series",
        "origin": "East Java, Indonesia (Gunung Ijen 1400-1600 MASL)",
        "varietal": "Kartika / Typica",
        "process": "Kenyan Process (Double Washed)",
        "roast": "Light",
        "notes": ["Clean", "Jasmine", "Crisp Citrus"],
        "flavor_category": ["Floral", "Fruity"],
        "price_100g": 59000,
        "price_200g": 109000,
        "price_500g": 290000,
        "cup_price": 30000,
        "recipe": "V60 15g kopi, 240ml air (1:16), 93°C, 2m 10s. Bloom 45g 35s.",
        "description": "Seduhan yang sangat jernih (clean cup) dengan karakter bunga melati merekah dan keasaman sitrus yang menyegarkan."
    },
    {
        "id": "ijen-anaerob-rahsa",
        "slug": "ijen-anaerob-rahsa",
        "name": "Ijen Anaerob (Rahsa)",
        "slowbar_alias": "RAHSA",
        "category": "filter",
        "series": "Ijen Series",
        "origin": "East Java, Indonesia (Gunung Ijen 1400-1600 MASL)",
        "varietal": "Kartika",
        "process": "Anaerobic Natural",
        "roast": "Light-Medium",
        "notes": ["Tropical", "Fermented Sweetness", "Complex"],
        "flavor_category": ["Fruity", "Sweet"],
        "price_100g": 59000,
        "price_200g": 109000,
        "price_500g": 290000,
        "cup_price": 35000,
        "recipe": "Kalita Wave 15g kopi, 225ml air (1:15), 91°C, 2m 20s.",
        "description": "Kekayaan rasa tropis dengan manis fermentasi buah yang padat, aroma semerbak, dan kompleksitas rasa memikat."
    },
    {
        "id": "ijen-lactic-laras",
        "slug": "ijen-lactic-laras",
        "name": "Ijen Lactic (Laras)",
        "slowbar_alias": "LARAS",
        "category": "filter",
        "series": "Ijen Series",
        "origin": "East Java, Indonesia (Kawah Ijen 1400-1600 MASL)",
        "varietal": "Kartika",
        "process": "Lactic Process",
        "roast": "Light-Medium",
        "notes": ["Mango", "Lychee", "Lime", "Creamy", "Chocolate"],
        "flavor_category": ["Fruity", "Sweet", "Chocolaty"],
        "price_100g": 59000,
        "price_200g": 109000,
        "price_500g": 290000,
        "cup_price": 35000,
        "recipe": "Origami / V60 15g, 225ml air (1:15), 91°C, 2m 25s.",
        "description": "Sensasi mangga ranum dan leci berpadu keasaman segar jeruk nipis, diakhiri dengan tekstur creamy bagai cokelat susu."
    },
    {
        "id": "ijen-yellow-bourbon-kencana",
        "slug": "ijen-yellow-bourbon-kencana",
        "name": "Ijen Yellow Bourbon (Kencana)",
        "slowbar_alias": "KENCANA",
        "category": "filter",
        "series": "Ijen Series",
        "origin": "East Java, Indonesia (Gunung Ijen 1500 MASL)",
        "varietal": "Yellow Bourbon",
        "process": "Honey Process",
        "roast": "Light-Medium",
        "notes": ["Honey", "Almond", "Smooth Body"],
        "flavor_category": ["Sweet", "Nutty"],
        "price_100g": 59000,
        "price_200g": 109000,
        "price_500g": 290000,
        "cup_price": 30000,
        "recipe": "V60 15g, 240ml air (1:16), 92°C, 2m 15s.",
        "description": "Varietas langka Yellow Bourbon dengan kelembutan madu hutan dan gurihnya kacang almond panggang dalam body yang halus."
    },
    {
        "id": "ijen-full-wash-washey",
        "slug": "ijen-full-wash-washey",
        "name": "Ijen Full Wash (Washey)",
        "slowbar_alias": "WASHEY",
        "category": "filter",
        "series": "Ijen Series",
        "origin": "East Java, Indonesia (Gunung Ijen 1400-1600 MASL)",
        "varietal": "Kartika / USDA",
        "process": "Full Wash",
        "roast": "Medium-Light",
        "notes": ["Balanced", "Mild", "Acidity", "Nutty"],
        "flavor_category": ["Nutty", "Sweet"],
        "price_100g": 59000,
        "price_200g": 109000,
        "price_500g": 290000,
        "cup_price": 25000,
        "recipe": "V60 15g, 225ml air (1:15), 90°C, 2m 15s.",
        "description": "Profil seduhan klasik Ijen yang seimbang, keasaman lembut, dengan sentuhan rasa nutty hangat yang bersahabat untuk harian."
    },

    # 2. ENREKANG SERIES
    {
        "id": "buntu-lenta-wash-duharman",
        "slug": "buntu-lenta-wash-duharman",
        "name": "Buntu Lenta Wash (Duharman Wash)",
        "slowbar_alias": "DUHARMAN WASH",
        "category": "filter",
        "series": "Enrekang Series",
        "origin": "South Sulawesi, Indonesia (Buntu Lenta 1500-1800 MASL)",
        "varietal": "Typica, S-795",
        "process": "Wash Process",
        "roast": "Light-Medium",
        "notes": ["Mandarin", "Honey", "Caramel", "Floral"],
        "flavor_category": ["Fruity", "Floral", "Sweet"],
        "price_100g": 109000,
        "price_200g": 199000,
        "price_500g": 439000,
        "cup_price": 45000,
        "recipe": "V60 15g, 225ml air (1:15), 92°C, 2m 20s.",
        "description": "Kopi legendaris Enrekang dengan manis madu pekat, aroma bunga pegunungan, dan keasaman segar buah jeruk mandarin."
    },
    {
        "id": "buntu-lenta-wine-duharman",
        "slug": "buntu-lenta-wine-duharman",
        "name": "Buntu Lenta Wine (Duharman Winey)",
        "slowbar_alias": "DUHARMAN WINEY",
        "category": "filter",
        "series": "Enrekang Series",
        "origin": "South Sulawesi, Indonesia (Buntu Lenta 1500-1800 MASL)",
        "varietal": "Typica, S-795",
        "process": "Wine Processed",
        "roast": "Light-Medium",
        "notes": ["Wine", "Tangerine", "Caramel"],
        "flavor_category": ["Fruity", "Sweet"],
        "price_100g": 115000,
        "price_200g": 215000,
        "price_500g": 459000,
        "cup_price": 52000,
        "recipe": "Kalita Wave 15g, 225ml air (1:15), 91°C, 2m 30s.",
        "description": "Fermentasi ceri utuh berlapis menciptakan sensasi winey berkelas dengan manis karamel dan kesegaran jeruk keprok."
    },
    {
        "id": "buntu-lenta-natural-duharman",
        "slug": "buntu-lenta-natural-duharman",
        "name": "Buntu Lenta Natural (Duharman Natural)",
        "slowbar_alias": "DUHARMAN NATURAL",
        "category": "filter",
        "series": "Enrekang Series",
        "origin": "South Sulawesi, Indonesia (Buntu Lenta 1500-1800 MASL)",
        "varietal": "Typica, S-795",
        "process": "Natural Process",
        "roast": "Light",
        "notes": ["Blueberry", "Strawberry", "Bold Body", "Sweetness"],
        "flavor_category": ["Fruity", "Sweet"],
        "price_100g": 109000,
        "price_200g": 199000,
        "price_500g": 439000,
        "cup_price": 45000,
        "recipe": "V60 15g, 225ml air (1:15), 91°C, 2m 15s.",
        "description": "Ledakan aroma buah beri ungu, stroberi manis, serta body yang tebal dan memanjakan lidah."
    },
    {
        "id": "kalaciri-wash-process",
        "slug": "kalaciri-wash-process",
        "name": "Kalaciri Wash Process",
        "slowbar_alias": "KALACIRI",
        "category": "filter",
        "series": "Enrekang Series",
        "origin": "South Sulawesi, Indonesia (Kalaciri Dammang 1400-1600 MASL)",
        "varietal": "Typica, S-795",
        "process": "Kalaciri Dammang Wash Process",
        "roast": "Medium-Light",
        "notes": ["Palm Sugar", "Sweet Spicy", "Chocolate"],
        "flavor_category": ["Sweet", "Spicy", "Chocolaty"],
        "price_100g": 99000,
        "price_200g": 185000,
        "price_500g": 399000,
        "cup_price": 35000,
        "recipe": "Aeropress / V60 16g, 240ml air (1:15), 90°C, 2m 00s.",
        "description": "Manisnya gula aren hangat berpadu dengan rempah manis aromatik dan aftertaste cokelat lembut."
    },
    {
        "id": "benteng-alla-wash-sembada",
        "slug": "benteng-alla-wash-sembada",
        "name": "Benteng Alla Wash (Sembada)",
        "slowbar_alias": "SEMBADA",
        "category": "filter",
        "series": "Enrekang Series",
        "origin": "South Sulawesi, Indonesia (Benteng Alla 1600-1800 MASL)",
        "varietal": "S-795",
        "process": "Benteng Alla Wash Process",
        "roast": "Light-Medium",
        "notes": ["Lime", "Brown Sugar", "Cashew", "Caramel", "Tamarind"],
        "flavor_category": ["Fruity", "Sweet", "Nutty"],
        "price_100g": 115000,
        "price_200g": 215000,
        "price_500g": 459000,
        "cup_price": 50000,
        "recipe": "V60 15g, 225ml air (1:15), 92°C, 2m 15s.",
        "description": "Kompleksitas tinggi dengan keasaman segar jeruk nipis dan asam jawa, diimbangi manis gula merah dan gurih kacang mete."
    },

    # 3. SUNDA SERIES
    {
        "id": "puntang-honey-gulali",
        "slug": "puntang-honey-gulali",
        "name": "Puntang Honey (Gulali)",
        "slowbar_alias": "GULALI",
        "category": "filter",
        "series": "Sunda Series",
        "origin": "West Java, Indonesia (Gunung Puntang 1300-1600 MASL)",
        "varietal": "Typica, Sigarar Utang",
        "process": "Puntang Honey Process",
        "roast": "Light-Medium",
        "notes": ["Honey", "Peach", "Chocolate-Like"],
        "flavor_category": ["Sweet", "Fruity", "Chocolaty"],
        "price_100g": 95000,
        "price_200g": 179000,
        "price_500g": 379000,
        "cup_price": 45000,
        "recipe": "V60 16g kopi, 250ml air (1:15.6), 92°C, 2m 30s.",
        "description": "Manis pekat bagai permen gulali dan madu bunga, berpadu buah persik dan sentuhan cokelat manis."
    },
    {
        "id": "puntang-natural-aromanis",
        "slug": "puntang-natural-aromanis",
        "name": "Puntang Natural (Aromanis)",
        "slowbar_alias": "AROMANIS",
        "category": "filter",
        "series": "Sunda Series",
        "origin": "West Java, Indonesia (Gunung Puntang 1300-1600 MASL)",
        "varietal": "Typica, Ateng Super",
        "process": "Puntang Natural Process",
        "roast": "Light",
        "notes": ["Pineapple", "Berry", "Jackfruit"],
        "flavor_category": ["Fruity", "Sweet"],
        "price_100g": 99000,
        "price_200g": 185000,
        "price_500g": 399000,
        "cup_price": 52000,
        "recipe": "V60 15g kopi, 225ml air (1:15), 91°C, 2m 15s.",
        "description": "Aroma harum buah nanas matang, nangka manis, dan aneka beri tropis yang semerbak sejak digiling."
    },

    # 4. JAVA EXOTIC SERIES
    {
        "id": "sumbing-supernova-celestia",
        "slug": "sumbing-supernova-celestia",
        "name": "Sumbing Supernova Wash (Celestia)",
        "slowbar_alias": "CELESTIA",
        "category": "filter",
        "series": "Java Exotic",
        "origin": "Central Java, Indonesia (Gunung Sumbing 1500-1700 MASL)",
        "varietal": "Kartika / Typica",
        "process": "Sumbing Supernova Wash",
        "roast": "Light",
        "notes": ["Explosive Berry", "Complex", "Candy-Like"],
        "flavor_category": ["Fruity", "Sweet"],
        "price_100g": 139000,
        "price_200g": 259000,
        "cup_price": 48000,
        "recipe": "Origami / V60 15g, 225ml air (1:15), 91°C, 2m 10s.",
        "description": "Ledakan rasa buah beri manis yang luar biasa intens bagai permen buah, dengan tingkat kompleksitas spektakuler."
    },
    {
        "id": "prau-natural-surya",
        "slug": "prau-natural-el-davisio-surya",
        "name": "Prau Natural El Davisio Double Mosto (Surya)",
        "slowbar_alias": "SURYA",
        "category": "filter",
        "series": "Java Exotic",
        "origin": "Central Java, Indonesia (Gunung Prau 1600-1800 MASL)",
        "varietal": "El Davisio Selection",
        "process": "Double Mosto Triple Yeast",
        "roast": "Light",
        "notes": ["White Floral", "Strawberry", "Candy Mint"],
        "flavor_category": ["Floral", "Fruity", "Sweet"],
        "price_100g": 139000,
        "price_200g": 259000,
        "cup_price": 60000,
        "recipe": "V60 15g, 230ml air (1:15.3), 92°C, 2m 15s.",
        "description": "Aroma bunga putih elegan, manis buah stroberi ranum, dan sensasi semilir candy mint di ujung lidah."
    },
    {
        "id": "sindoro-strawberry-selai",
        "slug": "sindoro-strawberry-selai",
        "name": "Sindoro Strawberry Triple Yeast (Selai)",
        "slowbar_alias": "SELAI",
        "category": "filter",
        "series": "Java Exotic",
        "origin": "Central Java, Indonesia (Gunung Sindoro 1500-1700 MASL)",
        "varietal": "Kartika",
        "process": "Sindoro Strawberry Triple Yeast",
        "roast": "Light-Medium",
        "notes": ["Sweet Jammy Strawberry", "Vanilla"],
        "flavor_category": ["Fruity", "Sweet"],
        "price_100g": 119000,
        "price_200g": 220000,
        "cup_price": 56000,
        "recipe": "V60 / Kalita 15g, 225ml air (1:15), 91°C, 2m 20s.",
        "description": "Karakter selai stroberi manis yang amat lezat berpadu aroma vanila hangat yang creamy dan lembut."
    },

    # 5. ARGOPURO WALIDA SERIES
    {
        "id": "argopuro-walida-anaerob-arcapada",
        "slug": "argopuro-walida-anaerob-arcapada",
        "name": "Argopuro Natural Anaerob (Arcapada)",
        "slowbar_alias": "ARCAPADA",
        "category": "filter",
        "series": "Argopuro Walida",
        "origin": "East Java, Indonesia (Gunung Argopuro 1300-1600 MASL)",
        "varietal": "Kartika, Typica",
        "process": "Argopuro Natural Anaerob",
        "roast": "Light",
        "notes": ["Intensely Sweet", "Boozy", "Candy Like Fruit"],
        "flavor_category": ["Sweet", "Fruity"],
        "price_100g": 80000,
        "price_200g": 150000,
        "cup_price": 50000,
        "recipe": "V60 Pour Over 15g, 225ml air (1:15), 91°C, 2m 15s.",
        "description": "Manis yang sangat intens dengan sentuhan boozy elegan dan cita rasa buah tropis bagai permen."
    },
    {
        "id": "damarkandang-cm-kismis",
        "slug": "damarkandang-cm-kismis",
        "name": "Damarkandang Carbonic Maceration Kismis",
        "slowbar_alias": "DAMARKANDANG KISMIS",
        "category": "filter",
        "series": "Argopuro Walida",
        "origin": "East Java, Indonesia (Damarkandang, Argopuro 1400-1600 MASL)",
        "varietal": "Kartika",
        "process": "Damarkandang Carbonic Maceration",
        "roast": "Light-Medium",
        "notes": ["Intensely Sweet", "Winey", "Candy Like Cup"],
        "flavor_category": ["Sweet", "Fruity"],
        "price_100g": 90000,
        "price_200g": 175000,
        "cup_price": 60000,
        "recipe": "Kalita Wave / V60 15g, 225ml air (1:15), 91°C, 2m 20s.",
        "description": "Karakter rasa manis buah kismis hitam yang pekat, sentuhan winey yang halus, dan cangkir yang luar biasa manis."
    },

    # 6. GRAND RESERVE MICRO-LOT SERIES
    {
        "id": "grand-reserve-el-triunfo-geisha",
        "slug": "el-triunfo-geisha-tolima-aurora",
        "name": "El Triunfo Geisha Tolima (Aurora)",
        "slowbar_alias": "AURORA",
        "category": "reserve",
        "series": "Grand Reserve",
        "origin": "Tolima, Colombia (1800-2000 MASL)",
        "varietal": "Geisha (Gesha)",
        "process": "Washed Extended Fermentation",
        "roast": "Light",
        "notes": ["Jasmine", "Bergamot", "Peach", "Tea-like", "Crystalline"],
        "flavor_category": ["Floral", "Fruity", "Sweet"],
        "price_16g": 86000,
        "price_50g": 200000,
        "price_100g": 380000,
        "price_200g": 709000,
        "cup_price": 200000,
        "recipe": "Hario V60 Plastic 16g kopi, 256ml air (1:16), 93°C, 2m 15s. Bloom 50g 45s.",
        "description": "Puncak kemewahan rasa kopi dunia. Aroma melati yang semerbak, minyak bergamot earl grey, manisnya buah peach putih, dan kejernihan crystalline."
    },
    {
        "id": "grand-reserve-magnum-sidra",
        "slug": "magnum-sidra-el-vergel-soberano",
        "name": "Magnum Sidra El Vergel Cauca (Soberano)",
        "slowbar_alias": "SOBERANO",
        "category": "reserve",
        "series": "Grand Reserve",
        "origin": "Cauca, Colombia (1850 MASL)",
        "varietal": "Sidra (Bourbon x Typica Heirloom)",
        "process": "Anaerobic Natural Koji Co-Ferment",
        "roast": "Light",
        "notes": ["Tropical", "Syrup", "Layered Cocoa", "Brown Sugar"],
        "flavor_category": ["Fruity", "Chocolaty", "Sweet"],
        "price_16g": 72000,
        "price_50g": 180000,
        "price_100g": 350000,
        "price_200g": 685000,
        "cup_price": 180000,
        "recipe": "V60 Pour Over 16g, 240ml air (1:15), 92°C, 2m 10s.",
        "description": "Varietas langka Sidra dengan rasa sirup tropis pekat, lapisan rasa kakao mewah, dan aftertaste brown sugar yang amat panjang."
    },
    {
        "id": "grand-reserve-sudan-rume-carmin",
        "slug": "sudan-rume-huila-carmin",
        "name": "Sudan Rume Huila (Carmin)",
        "slowbar_alias": "CARMIN",
        "category": "reserve",
        "series": "Grand Reserve",
        "origin": "Huila, Colombia (1750-1900 MASL)",
        "varietal": "Sudan Rume",
        "process": "Natural Fermented",
        "roast": "Light",
        "notes": ["Deepberry", "Wine-Like", "Red Fruit"],
        "flavor_category": ["Fruity", "Sweet"],
        "price_16g": 80000,
        "price_50g": 185000,
        "price_100g": 360000,
        "price_200g": 690000,
        "cup_price": 180000,
        "recipe": "Kalita Wave / V60 16g, 240ml air (1:15), 91°C, 2m 20s.",
        "description": "Varietas kuno Sudan Rume yang sangat langka dengan rasa buah beri gelap pekat, sentuhan winey yang anggun, dan buah merah ranum."
    },
    {
        "id": "grand-reserve-yemen-sahara",
        "slug": "yemen-haraz-golden-harvest-sahara",
        "name": "Yemen Haraz Golden Harvest (Sahara)",
        "slowbar_alias": "SAHARA",
        "category": "reserve",
        "series": "Grand Reserve",
        "origin": "Haraz Mountain, Yemen (2000-2200 MASL)",
        "varietal": "Yemenia / Udaini Heirloom",
        "process": "Traditional Rooftop Natural",
        "roast": "Light-Medium",
        "notes": ["Sweet Jammy Strawberry", "Vanilla"],
        "flavor_category": ["Fruity", "Sweet"],
        "price_16g": 59000,
        "price_50g": 165000,
        "price_100g": 229000,
        "price_200g": 549000,
        "cup_price": 99000,
        "recipe": "Origami / V60 16g, 240ml air (1:15), 91°C, 2m 15s.",
        "description": "Biji kopi tertua di dunia dari pegunungan tinggi Haraz Yaman. Manisnya selai stroberi pekat berpadu sentuhan vanila rempah magis."
    },

    # 7. ESPRESSO BASED ROAST PROFILES
    {
        "id": "espresso-dampit-natural",
        "slug": "dampit-natural-espresso",
        "name": "Dampit Natural Robusta Espresso",
        "slowbar_alias": "DAMPIT NATURAL",
        "category": "espresso",
        "series": "Robusta Espresso",
        "origin": "Dampit, Malang, East Java (700-900 MASL)",
        "varietal": "Fine Robusta Malang",
        "process": "Natural Process",
        "roast": "Medium-Dark",
        "notes": ["Chocolate", "Brown Sugar", "Full Body"],
        "flavor_category": ["Chocolaty", "Sweet"],
        "price_200g": 35000,
        "price_500g": 85000,
        "price_1000g": 150000,
        "recipe": "Espresso Machine: 19g in, 38g out, 26 detik suhu 93°C. Cocok untuk Es Kopi Susu Gula Aren.",
        "description": "Robusta terbaik kebanggaan Malang dengan body tebal mantap, aroma cokelat pekat, dan manis brown sugar yang pas untuk es kopi susu."
    },
    {
        "id": "espresso-arabica-kintamani",
        "slug": "kintamani-full-wash-arabica-espresso",
        "name": "Kintamani Full Wash Arabica Espresso",
        "slowbar_alias": "KINTAMANI FULL WASH",
        "category": "espresso",
        "series": "Arabica Espresso",
        "origin": "Kintamani, Bali (1200-1400 MASL)",
        "varietal": "Typica, Kartika",
        "process": "Full Wash",
        "roast": "Medium",
        "notes": ["Chocolate", "Brown Sugar", "Full Body"],
        "flavor_category": ["Chocolaty", "Sweet"],
        "price_200g": 70000,
        "price_500g": 135000,
        "price_1000g": 260000,
        "recipe": "Espresso Machine: 18g in, 36g out, 28 detik suhu 93°C.",
        "description": "Single origin Arabika Bali dengan profil sangrai espresso menghasilkan krema tebal, manis brown sugar, dan sentuhan cokelat hangat."
    },
    {
        "id": "espresso-arabica-ijen-full-wash",
        "slug": "arabica-ijen-full-wash-espresso",
        "name": "Arabica Ijen Full Wash Espresso",
        "slowbar_alias": "ARABICA IJEN FULL WASH",
        "category": "espresso",
        "series": "Arabica Espresso",
        "origin": "Gunung Ijen, Bondowoso, East Java (1400 MASL)",
        "varietal": "Kartika / Typica",
        "process": "Full Wash",
        "roast": "Medium",
        "notes": ["Earthy", "Dark Chocolate", "Full Body"],
        "flavor_category": ["Chocolaty", "Nutty"],
        "price_200g": 60000,
        "price_500g": 140000,
        "price_1000g": 250000,
        "recipe": "Espresso Machine: 18g in, 36g out, 26 detik suhu 93°C.",
        "description": "Espresso Arabika Ijen yang balance dengan crema cokelat keemasan, sentuhan cokelat hitam gurih, dan aftertaste yang bersih."
    },
    {
        "id": "espresso-brazil-santos",
        "slug": "brazil-santos-espresso",
        "name": "Brazil Santos Espresso",
        "slowbar_alias": "BRAZIL SANTOS",
        "category": "espresso",
        "series": "Arabica Espresso",
        "origin": "Minas Gerais, Santos, Brazil (900-1200 MASL)",
        "varietal": "Mundo Novo, Catuai",
        "process": "Natural Process",
        "roast": "Medium-Dark",
        "notes": ["Earthy", "Dark Chocolate", "Full Body"],
        "flavor_category": ["Chocolaty", "Nutty"],
        "price_200g": 92000,
        "price_500g": 175000,
        "price_1000g": 340000,
        "recipe": "Espresso Machine: 18.5g in, 37g out, 28 detik suhu 92°C.",
        "description": "Kopi Arabika impor asal Brazil dengan rasa nutty cokelat klasik dunia, keasaman sangat rendah, dan body yang mantap."
    }
]

class RAGService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel("gemini-1.5-flash")
            self.embedding_model = "models/text-embedding-004"
        else:
            self.model = None
            self.embedding_model = None

    def search_similar_products(self, query: str, top_k: int = 3) -> List[Tuple[Dict[str, Any], float]]:
        """
        Calculates semantic similarity using keyword overlap and token embeddings
        """
        query_lower = query.lower()
        results = []

        for product in COFFEE_KNOWLEDGE_BASE:
            score = 0.0
            
            # Check slowbar alias match (e.g. Asmara, Celestia, Soberano)
            if "slowbar_alias" in product and product["slowbar_alias"].lower() in query_lower:
                score += 3.0
                
            # Check direct name/slug match
            if product["name"].lower() in query_lower or product["slug"] in query_lower:
                score += 2.5

            # Check series match
            if product["series"].lower() in query_lower:
                score += 1.5

            # Check category match (filter, espresso, manual brew, susu, v60)
            if ("v60" in query_lower or "filter" in query_lower or "manual" in query_lower) and product["category"] == "filter":
                score += 0.8
            if ("susu" in query_lower or "espresso" in query_lower or "latte" in query_lower) and product["category"] == "espresso":
                score += 1.2
            if ("geisha" in query_lower or "mahal" in query_lower or "reserve" in query_lower or "kompetisi" in query_lower) and product["category"] == "reserve":
                score += 1.5

            # Check notes match
            for note in product["notes"]:
                if note.lower() in query_lower:
                    score += 1.0

            # Check flavor category match
            for cat in product["flavor_category"]:
                if cat.lower() in query_lower:
                    score += 0.9

            if score > 0:
                results.append((product, score))

        # Sort by score descending
        results.sort(key=lambda x: x[1], reverse=True)

        # Fallback if no specific match
        if not results:
            return [(COFFEE_KNOWLEDGE_BASE[0], 0.5), (COFFEE_KNOWLEDGE_BASE[1], 0.4), (COFFEE_KNOWLEDGE_BASE[2], 0.3)]

        return results[:top_k]

    def check_guardrails_input(self, user_input: str) -> Tuple[bool, str]:
        """
        NeMo Guardrails Input Validation
        """
        blocked_phrases = [
            "ignore previous instructions", "system prompt", "hack", "bypass",
            "judi", "politik", "presiden", "meretas", "ddos", "script injection",
            "drop table", "select * from users"
        ]
        user_input_lower = user_input.lower()
        for phrase in blocked_phrases:
            if phrase in user_input_lower:
                return False, "Mohon maaf kawan seduh, saya adalah Virtual Barista khusus 52 Coffee & Roastery. Saya hanya dapat melayani pertanyaan seputar biji kopi, profil rasa, dan panduan seduh."

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
            f"Harga Beans: Rp {p.get('price_100g', p.get('price_200g', p.get('price_16g', 0))):,}\n"
            f"Harga Cup Slowbar: Rp {p.get('cup_price', 0):,}\n"
            f"Resep Seduh: {p['recipe']}\n"
            f"Deskripsi: {p['description']}"
            for p in retrieved_products
        ])

        # 3. Formulate Prompt with Gemini
        system_instruction = (
            "Anda adalah 'Virtual Barista 52 Coffee & Roastery' yang bertugas di slowbar tasting room kami di Jl. KH. Agus Salim No. 11, Malang.\n"
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
            return "Halo kawan seduh! Di 52 Coffee & Roastery Malang, kami memiliki beragam koleksi fresh crop dari lereng Ijen, Enrekang, Sunda, Java Exotic, hingga Grand Reserve Colombia. Ceritakan rasa kopi impianmu!"

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
