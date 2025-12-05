const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const generateEmbedding = require('../services/embeddings');

/**
 * Seed database with company data and generate embeddings
 */
async function seedDatabase() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'resume_match',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    // ---------------------------------------------------------
    // CRITICAL: Drop table to ensure new Vector(1024) is applied
    // ---------------------------------------------------------
    await pool.query('DROP TABLE IF EXISTS companies');
    console.log('Dropped old companies table (if existed)');

    // Read SQL init file
    const initSQL = fs.readFileSync(
      path.join(__dirname, 'init.sql'),
      'utf8'
    );
    
    // Execute init SQL
    await pool.query(initSQL);
    console.log('Database schema initialized');

    // Read CSV file
    const csvPath = path.join(__dirname, '../../data/companies_for_embeddings.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error(`CSV file not found: ${csvPath}`);
      console.log('Please run the Python cleaning script first to generate the CSV file.');
      process.exit(1);
    }

    const companies = [];
    
    // Parse CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          companies.push(row);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`Loaded ${companies.length} companies from CSV`);

    // Insert companies and generate embeddings
    let inserted = 0;
    for (const company of companies) {
      try {
        // ---------------------------------------------------------
        // FIX 1: Parse "2017.0" to integer 2017
        // ---------------------------------------------------------
        let foundedYear = null;
        if (company.founded_year) {
            // parseInt handles "2017.0" correctly by ignoring the decimal
            const parsed = parseInt(company.founded_year);
            if (!isNaN(parsed)) {
                foundedYear = parsed;
            }
        }

        // Generate embedding for embedding_text
        const embeddingText = company.embedding_text || 
          `Company: ${company.company_name} | Industry: ${company.industry} | Location: ${company.location}`;
        
        console.log(`Processing ${inserted + 1}/${companies.length}: ${company.company_name}`);
        
        // CRITICAL: Force Titan v2 and validate dimensions
        // Ensure EMBEDDING_PROVIDER is set to 'bedrock' for Titan v2
        if (process.env.EMBEDDING_PROVIDER && process.env.EMBEDDING_PROVIDER !== 'bedrock') {
          throw new Error(
            `EMBEDDING_PROVIDER must be 'bedrock' for Titan v2. Current: ${process.env.EMBEDDING_PROVIDER}`
          );
        }
        
        // Generate embedding using Titan v2 (1024 dimensions)
        const embedding = await generateEmbedding(embeddingText);
        
        // CRITICAL: Validate embedding dimensions before inserting
        const EXPECTED_DIMENSIONS = 1024;
        if (!embedding || !Array.isArray(embedding)) {
          throw new Error(
            `Invalid embedding for ${company.company_name}: embedding is not an array`
          );
        }
        
        if (embedding.length !== EXPECTED_DIMENSIONS) {
          const errorMsg = `DIMENSION MISMATCH for ${company.company_name}: expected ${EXPECTED_DIMENSIONS}, got ${embedding.length}. Stopping ingestion.`;
          console.error(`❌ ${errorMsg}`);
          throw new Error(errorMsg);
        }
        
        console.log(`✓ Validated embedding dimensions: ${embedding.length} for ${company.company_name}`);
        
        // Convert embedding to PostgreSQL vector format
        const embeddingStr = '[' + embedding.join(',') + ']';
        
        // Insert company
        const query = `
          INSERT INTO companies (
            company_name, founded_year, location, industry,
            latest_funding, website, linkedin, description,
            embedding_text, embedding
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::vector)
          ON CONFLICT DO NOTHING
        `;
        
        await pool.query(query, [
          company.company_name || '',
          foundedYear, // <--- USING THE CLEANED INTEGER HERE
          company.location || '',
          company.industry || '',
          company.latest_funding || '',
          company.website || '',
          company.linkedin || '',
          company.description || '',
          embeddingText,
          embeddingStr
        ]);
        
        inserted++;
        
        // ---------------------------------------------------------
        // FIX 2: Slower loop to prevent hitting API limits instantly
        // ---------------------------------------------------------
        await new Promise(resolve => setTimeout(resolve, 500)); // Increased to 500ms

      } catch (error) {
        const errorMsg = `❌ Error processing ${company.company_name}: ${error.message}`;
        console.error(errorMsg);
        
        // If dimension mismatch, stop immediately
        if (error.message.includes('DIMENSION MISMATCH') || error.message.includes('dimension mismatch')) {
          console.error('🛑 CRITICAL: Dimension mismatch detected. Stopping ingestion.');
          throw error;
        }
        
        // Log other errors but continue (optional: you can also throw here if you want strict mode)
        console.error(`⚠️  Continuing despite error for ${company.company_name}`);
      }
    }

    console.log(`Successfully inserted ${inserted} companies`);
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Database seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;