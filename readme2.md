# AI Resume Match App

An AI-powered job matching web application that matches user resumes with US startups using semantic similarity.

## Project Structure

```
AI-resume-match-app/
├── clean_startup_data.py          # Python script to clean Excel data
├── data/                           # Generated cleaned data files
│   ├── clean_companies.csv
│   ├── clean_companies.json
│   └── companies_for_embeddings.csv
├── backend/                        # Node.js/Express backend
│   ├── src/
│   │   ├── server.js              # Main server file
│   │   ├── routes/
│   │   │   ├── upload.js          # Resume upload endpoint
│   │   │   └── match.js           # Matching endpoint
│   │   ├── services/
│   │   │   ├── extractResume.js   # PDF/DOCX text extraction
│   │   │   ├── embeddings.js      # OpenAI/Bedrock embeddings
│   │   │   └── vectorSearch.js    # pgVector similarity search
│   │   └── db/
│   │       ├── init.sql           # Database schema
│   │       └── seed.js            # Database seeding script
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
└── terraform/                      # Infrastructure as Code
    ├── main.tf
    ├── variables.tf
    └── outputs.tf
```

## Setup Instructions

### Step 1: Clean the Excel Data

1. Install Python dependencies:
```bash
pip install pandas openpyxl numpy
```

2. Run the cleaning script:
```bash
python clean_startup_data.py
```

This will:
- Load and clean the Excel file
- Detect headers automatically
- Remove junk rows and unnamed columns
- Generate `clean_companies.csv` and `clean_companies.json`
- Create `companies_for_embeddings.csv` with embedding-ready text

### Step 2: Set Up Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Database credentials
- OpenAI API key OR AWS Bedrock credentials
- Embedding provider preference

4. Set up PostgreSQL with pgVector:

Using Docker Compose (recommended):
```bash
docker-compose up -d postgres
```

Or manually:
- Install PostgreSQL 16+
- Install pgVector extension
- Create database: `createdb resume_match`

5. Initialize database schema:
```bash
psql -U postgres -d resume_match -f src/db/init.sql
```

6. Seed the database with company data:
```bash
node src/db/seed.js
```

This will:
- Load companies from `data/companies_for_embeddings.csv`
- Generate embeddings for each company
- Insert into PostgreSQL with vector embeddings

### Step 3: Run the Backend

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Or using Docker:
```bash
docker-compose up
```

## API Endpoints

### POST /api/upload
Upload a resume file (PDF or DOCX) and extract text.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `resume` (file)

**Response:**
```json
{
  "success": true,
  "filename": "resume.pdf",
  "text": "Extracted text...",
  "textLength": 1234
}
```

### POST /api/match
Upload a resume and get top 10 matching companies.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `resume` (file)

**Response:**
```json
{
  "success": true,
  "matches": [
    {
      "company_name": "Example Startup",
      "founded_year": 2020,
      "location": "San Francisco, CA",
      "industry": "Technology",
      "latest_funding": "$10M Series A",
      "website": "https://example.com",
      "linkedin": "https://linkedin.com/company/example",
      "description": "Company description...",
      "similarity": 0.95
    }
  ],
  "count": 10
}
```

### POST /api/match/text
Match using plain text (for testing).

**Request:**
```json
{
  "text": "Software engineer with 5 years experience..."
}
```

## Infrastructure (Terraform)

To deploy to AWS:

1. Configure Terraform variables:
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

2. Initialize Terraform:
```bash
terraform init
```

3. Plan deployment:
```bash
terraform plan
```

4. Apply:
```bash
terraform apply
```

This will create:
- VPC with public/private subnets
- RDS PostgreSQL instance with pgVector
- Security groups
- Network configuration

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 3000)
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port (default: 5432)
- `DB_NAME` - Database name (default: resume_match)
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `EMBEDDING_PROVIDER` - `openai` or `bedrock`
- `OPENAI_API_KEY` - OpenAI API key
- `OPENAI_EMBEDDING_MODEL` - Model name (default: text-embedding-3-small)
- `AWS_REGION` - AWS region for Bedrock
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `BEDROCK_EMBEDDING_MODEL` - Bedrock model (default: amazon.titan-embed-text-v1)

## Notes

- The embedding dimension in `init.sql` is set to 1024 (Amazon Titan v2 default). Adjust if using a different model.
- Bedrock Titan v2 embeddings use 1024 dimensions by default (supports 256, 512, 1024).
- OpenAI text-embedding-3-small uses 1536 dimensions (if using OpenAI, update init.sql accordingly).
- The vector search uses cosine similarity via pgVector's `<=>` operator.
- Rate limiting: The seed script includes delays to avoid API rate limits.

