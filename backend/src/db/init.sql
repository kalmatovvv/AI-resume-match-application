-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    founded_year INTEGER,
    location VARCHAR(255),
    industry VARCHAR(255),
    latest_funding VARCHAR(255),
    website VARCHAR(500),
    linkedin VARCHAR(500),
    description TEXT,
    embedding_text TEXT,
    embedding vector(1024) NOT NULL, -- Amazon Titan v2 embeddings (1024 dimensions)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS companies_embedding_idx 
ON companies 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_company_name ON companies(company_name);
CREATE INDEX IF NOT EXISTS idx_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_location ON companies(location);

