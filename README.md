# Next-Gen AI Career Copilot & Strategy Engine
### Kaggle Capstone Competition Submission — Elite Tier Architecture

Welcome to the **Next-Gen AI Career Copilot**, a highly robust, multi-agent full-stack career development assistant. This system integrates state-of-the-art Generative AI with structured system architecture to provide resumes parsing, real-time job market indexing, skills mapping, personalized weekly training curricula, and interactive interview simulations.

---

## 🚀 Key Architectural Pillars

### 1. Robust Security, Authentication, & Validation (Phase 1)
- **JWT Key-Authenticated Security**: Seamless session-based JWT authentication paired with secure PBKDF2 hash structures and automatic multi-layered fallback channels to guarantee robust operations in sandbox iFrame sandboxes.
- **Sliding-Window Memory Rate Limiting**: Intelligent sliding-window rate limiters safeguarding critical endpoints (Authentication, Gemini, and File Uploads) to prevent API throttling and malicious resource consumption.
- **Strict Input Validation**: Advanced parameter validation (RFC-compliant email checks, strict password complexity thresholds, name sanitization) to guard against cross-site scripting (XSS) and injection vectors.
- **Secure Sandbox Uploads**: High-integrity file verification rejecting arbitrary payloads, restricting sizes to 10 MB, and scrubbing names against directory traversal attempts.

### 2. High-Precision Hybrid RAG Vector Store & MCP Server (Phase 2)
- **High-Dimension Embeddings**: Standardized integration with official Gemini `text-embedding-004` to index knowledge articles, guides, and trends with cosine similarity matching.
- **Fallback Keyword Engine**: Robust TF-IDF word frequency fallbacks ensuring seamless recovery when APIs run dry.
- **Model Context Protocol (MCP)**: Custom MCP server implementation providing real-time career guides, structural salary benchmarks, validated educational URLs, and hiring velocity metrics.

### 3. Statefully Synchronized Multi-Agent System (Phase 3)
- **Agent Orchestrator**: Handles multi-layered sequential loops. Translates raw resume texts cleanly across:
  `Resume Evaluation -> Skill Mapping -> Training Scheduling -> Market Strategic Advisory`
- **Cognitive Agents**: Specialized agents running bespoke micro-prompts:
  - `Career Strategy Agent`: Senior path architect with salary metrics awareness.
  - `Resume Parser Agent`: Analyzes layout gaps and parses text formatting records.
  - `Skill Gap Analyzer Agent`: Maps local abilities to global tech trends.
  - `Interview Coach Agent`: Evaluates conversational rounds using structured rubrics.
  - `Roadmap & Curriculum Agent`: Creates weekly courses utilizing authentic external URLs.
  - `Task Productivity Specialist Agent`: Prioritizes agile project backlogs.

---

## 🛠️ Tech Stack & Directory Structure

- **Client**: React 18, Vite, Tailwind CSS v4, Lucide Icons, Recharts, Motion (Animations)
- **Server**: Express, Node.js (TypeScript type-stripping), `esbuild` for CJS bundling, `@google/genai` (SDK)
- **Database**: Local high-speed persistent state compiler stored securely at `/data/db.json`.

```
/
├── server.ts                 # Upgraded Express controller and API server
├── Dockerfile                # Production multi-stage docker compiler instructions
├── docker-compose.yml        # Orchestration specs for container launch
├── README.md                 # Project Overview & Quick Start
├── deployment.md             # Production cloud deployment guide
├── demo_script.md            # Interactive walkthrough scenario scripts
└── src/
    ├── server/
    │   ├── security.ts       # Authentication, Token Verification, & Rate Limit middleware
    │   ├── vectorStore.ts    # Hybrid Cosine RAG Vector Database
    │   ├── mcpServer.ts      # Model Context Protocol service emulator
    │   └── agents.ts         # Multi-Agent orchestrators & specialized worker agents
```

---

## ⚡ Quick Start: Running with Docker (Recommended)

1. **Verify Sandbox Prerequisites**: Make sure you have Docker and Docker Compose installed.
2. **Apply API Keys**: Set up your private developer variables inside your workspace environment file:
   ```env
   # .env
   GEMINI_API_KEY=your_gemini_api_key_here
   JWT_SECRET=your_custom_secure_salt_string_or_leave_empty
   ```
3. **Execute Spinup Command**:
   ```bash
   docker-compose up --build
   ```
4. **Access UI Sandbox**: Open `http://localhost:3000` in your browser.

---

## 🧪 Alternative Manual Launch

For rapid local testing and development workflow loops:

1. **Install required packages**:
   ```bash
   npm install
   ```
2. **Build and package application**:
   ```bash
   npm run build
   ```
3. **Boot operational production environments**:
   ```bash
   npm run start
   ```
