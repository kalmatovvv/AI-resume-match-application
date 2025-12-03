-- ============================================================
-- RESET COMPANIES TABLE FOR TITAN V2 (1536 DIMENSIONS)
-- ============================================================
-- Run this SQL script to:
-- 1. Truncate the companies table
-- 2. Drop and recreate the IVFFlat index with correct dimensions
-- ============================================================

-- Step 1: Truncate the companies table (removes all data, resets ID sequence)
TRUNCATE TABLE companies RESTART IDENTITY;

-- Step 2: Drop the existing index
DROP INDEX IF EXISTS companies_embedding_idx;

-- Step 3: Recreate the IVFFlat index for 1536-dimensional vectors
-- Note: lists parameter should be ~sqrt(total_rows) for optimal performance
-- Adjust lists value based on your expected data size
CREATE INDEX companies_embedding_idx 
ON companies 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Verify the index was created
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'companies' AND indexname = 'companies_embedding_idx';

