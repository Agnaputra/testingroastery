-- ==========================================================
-- 52 COFFEE & ROASTERY - DATABASE SCHEMA DDL
-- PostgreSQL 15+ with pgvector extension
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Categories Table (Filter Based vs Espresso Based vs Grand Reserve)
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Series Table (Ijen, Sunda, Java Exotic, Grand Reserve, Espresso Roast)
CREATE TABLE IF NOT EXISTS series (
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    series_id INT NOT NULL REFERENCES series(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    origin VARCHAR(100) NOT NULL,
    region VARCHAR(150),
    altitude VARCHAR(100),
    varietal VARCHAR(150),
    process VARCHAR(100),
    roast_profile VARCHAR(50),
    tasting_notes TEXT[] NOT NULL,
    flavor_category TEXT[] NOT NULL,
    description TEXT,
    story TEXT,
    image_url TEXT,
    base_price DECIMAL(12, 2) NOT NULL,
    default_weight VARCHAR(20) NOT NULL DEFAULT '100g',
    is_active BOOLEAN DEFAULT TRUE,
    is_fresh_crop BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Product Variants Table (16g, 50g, 100g, 200g, 500g, 1kg)
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    weight_grams INT NOT NULL,
    weight_label VARCHAR(30) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 25,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Coffee Knowledge Base for Vector RAG (Embedding 768-dim)
CREATE TABLE IF NOT EXISTS coffee_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    document_chunk TEXT NOT NULL,
    metadata JSONB,
    embedding vector(768),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. HNSW Cosine Distance Index for Lightning-Fast Similarity Search
CREATE INDEX IF NOT EXISTS idx_coffee_knowledge_embedding 
ON coffee_knowledge USING hnsw (embedding vector_cosine_ops);

-- Index on product slugs
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_series_slug ON series(slug);
