# AI Resume Matcher

An intelligent application that analyzes resumes and matches them with the most suitable startup companies using advanced vector similarity search.

<img width="1914" height="942" alt="Screenshot 2025-12-12 154811" src="https://github.com/user-attachments/assets/cf43b78d-128c-4fe8-9c94-8729d0114c38" />

**Video Demonstration**
    
https://github.com/user-attachments/assets/659bc10c-b3fc-43c0-a0bf-43652252f812

## 🚀 Features

-   **Resume Analysis**: Upload PDF/DOCX resumes or paste text directly.
-   **Semantic Matching**: Uses AWS Bedrock (Titan v2) embeddings to understand the *meaning* of the resume, not just keywords.
-   **Vector Search**: High-performance similarity search using PostgreSQL `pgvector`.
-   **Tiered Access**:
    -   **Guest Mode**: View top 3 matching companies.
    -   **Authenticated Mode**: Sign in to unlock the top 100 matches.
-   **Secure Authentication**: Fully integrated with AWS Cognito using a modern Client-Side SPA (PKCE) flow.

## 🛠️ Technology Stack

### Frontend
-   **Framework**: React (Vite)
-   **Styling**: Tailwind CSS, Vanilla CSS variables
-   **Authentication**: `react-oidc-context` (AWS Cognito Wrapper)
-   **State Management**: `@tanstack/react-query`
-   **Routing**: `react-router-dom`

### Backend
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Authentication**: `aws-jwt-verify` (Stateless Token Verification)
-   **File Handling**: `multer`, `pdf-parse`, `mammoth` (for DOCX)
-   
  <img width="1004" height="826" alt="Screenshot 2025-12-12 160305" src="https://github.com/user-attachments/assets/91435d50-5220-4d4e-99e8-f46e1860ccc2" />


### Database & AI
-   **Database**: PostgreSQL
-   **Extension**: `pgvector` (Vector Similarity Search)
-   **AI Model**: AWS Bedrock - Titan Text Embeddings v2 (`amazon.titan-embed-text-v2:0`)
-   
  <img width="1018" height="599" alt="Screenshot 2025-12-12 160414" src="https://github.com/user-attachments/assets/d9440c89-ea94-4a14-ae8f-078c3d68ae7d" />


### Infrastructure
-   **Containerization**: Docker & Docker Compose
-   **Cloud Provider**: AWS (Cognito, Bedrock, RDS, Lightsail)

## 📦 Getting Started

### Prerequisites
-   Node.js & npm
-   Docker Desktop
-   AWS Account (Bedrock access enabled)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/ai-resume-match.git
    ```

2.  **Environment Setup**
    -   Create `frontend/.env` with Cognito Client ID, Domain, and Region.
    -   Create `backend/.env` with Database credentials or AWS keys.

3.  **Run with Docker (Backend & DB)**
    ```bash
    cd backend
    docker compose up --build
    ```

4.  **Run Frontend**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
