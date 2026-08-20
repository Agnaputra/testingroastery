"""
Seed Data Script for 52 Coffee & Roastery PostgreSQL + pgvector Database
"""
import os
import psycopg2
from config import settings
from rag_service import COFFEE_KNOWLEDGE_BASE

def seed_database():
    print(f"Connecting to PostgreSQL database: {settings.DATABASE_URL} ...")
    try:
        conn = psycopg2.connect(settings.DATABASE_URL)
        cur = conn.cursor()

        # Read schema.sql
        schema_path = os.path.join(os.path.dirname(__file__), "..", "schema.sql")
        if os.path.exists(schema_path):
            with open(schema_path, "r", encoding="utf-8") as f:
                schema_sql = f.read()
                cur.execute(schema_sql)
                conn.commit()
                print("✓ Database tables created successfully.")

        # Seed categories
        categories = [
            ("Filter Based", "filter", "Koleksi single origin untuk seduhan manual brew V60, Kalita, Aeropress"),
            ("Espresso Based", "espresso", "Profil sangrai medium-dark untuk espresso machine, moka pot, dan es kopi susu"),
            ("Grand Reserve Micro-Lot", "reserve", "Lini kopi langka kompetisi dunia dalam kemasan tasting dose hingga 200g"),
        ]
        for name, slug, desc in categories:
            cur.execute("""
                INSERT INTO categories (name, slug, description)
                VALUES (%s, %s, %s)
                ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
            """, (name, slug, desc))
        conn.commit()
        print("✓ Categories seeded.")

        # Seed series
        series_data = [
            (1, "Ijen Series", "ijen-series"),
            (1, "Sunda Series", "sunda-series"),
            (1, "Java Exotic", "java-exotic"),
            (3, "Grand Reserve", "grand-reserve"),
            (2, "Espresso Roast", "espresso-roast"),
        ]
        for cat_id, name, slug in series_data:
            cur.execute("""
                INSERT INTO series (category_id, name, slug)
                VALUES (%s, %s, %s)
                ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
            """, (cat_id, name, slug))
        conn.commit()
        print("✓ Series seeded.")

        # Seed products and coffee_knowledge
        for item in COFFEE_KNOWLEDGE_BASE:
            # Map series_id
            series_slug = item["series"].lower().replace(" ", "-")
            cur.execute("SELECT id FROM series WHERE slug = %s LIMIT 1;", (series_slug,))
            res = cur.fetchone()
            series_id = res[0] if res else 1

            cur.execute("""
                INSERT INTO products (
                    name, slug, series_id, origin, process, varietal, roast_profile,
                    tasting_notes, flavor_category, description, story, base_price
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
            """, (
                item["name"],
                item["slug"],
                series_id,
                item["origin"],
                item["process"],
                item.get("varietal", "Kartika / Typica"),
                item.get("roast", "Light-Medium"),
                item["notes"],
                item["flavor_category"],
                item["description"],
                item["description"],
                float(item.get("price_100g", item.get("price_200g", item.get("price_16g", 65000))))
            ))

            # Insert into coffee_knowledge
            chunk = (
                f"Kopi: {item['name']} | Series: {item['series']} | Origin: {item['origin']} | "
                f"Proses: {item['process']} | Tasting Notes: {', '.join(item['notes'])} | "
                f"Resep: {item['recipe']} | Deskripsi: {item['description']}"
            )
            cur.execute("""
                INSERT INTO coffee_knowledge (title, document_chunk, metadata)
                VALUES (%s, %s, %s);
            """, (item["name"], chunk, psycopg2.extras.Json(item)))

        conn.commit()
        cur.close()
        conn.close()
        print("✓ All 52 Coffee & Roastery products & knowledge base successfully seeded!")

    except Exception as e:
        print(f"Note: PostgreSQL connection skipped or not running locally ({e}). In-memory knowledge base is active.")

if __name__ == "__main__":
    seed_database()
