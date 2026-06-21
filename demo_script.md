# Live Demo Presentation Script
### Kaggle Evaluation Walkthrough — Interactive Validation Scenarios

Follow this step-by-step presentation flow to showcase the full functionality of the systems during live evaluation or grading workflows.

---

## 🔑 Scenario 1: Setup, Auth, & Rate Limit Controls
This demonstrates the robust authentication, sanitization, and security barriers.

1. **Register a New User**:
   - Go to `/signup`.
   - Attempt to register with a weakly structured password (e.g., `123`). Notice the system alerts you and rejects the creation:
     *`"Register Failure: For safety, password must be at least 8 characters long and contain at least one number or special character."`*
   - Re-enter a valid password (`SecurePass123!`). The registration succeeds seamlessly, returning an encrypted JWT token.

2. **Trigger Limit-Throttling Middleware**:
   - Log out, go to `/login`, and attempt to spam click the "Submit" trigger quickly.
   - On the 11th request within a single minute, the sliding-window memory rate limiter intercepts the request and blocks it:
     *`"Too many authentication requests. Please try again after a minute."`*

---

## 🧬 Scenario 2: The Multi-Agent Pipeline & RAG System
This showcases the orchestrator coordinating specialized agents, RAG, and MCP server tools based on a single resume.

1. **Trigger Comprehensive Diagnosis**:
   - Go to `/resume` (Resume Analyzer).
   - Enter a target role (e.g., `Full Stack Engineer`) and paste or upload a resume.
   - Click the global diagnostic trigger. This calls our orchestrator's linear engine:
     1. **Resume Agent** scans your layout structure, returning an ATS score of 84, spelling checks, and formatting suggestions.
     2. **Skill Gap Agent** dynamically takes your parsed skill set, queries the **MCP Server** for real-time Full Stack tech trends (React, Tailwind CSS v4, Next.js Server Actions), and identifies missing competencies.
     3. **Roadmap Agent** receives the list of gaps, consults the **MCP Server** for verified learning links, and builds an educational curriculum complete with URLs.
     4. **Career Agent** gathers salary guidelines, remote options, and industry projections, summarizing strategic milestones.

2. **Verify Specialized Knowledge (RAG Integration)**:
   - Ask the AI Chat: *"How can I improve my resume for older ATS parsers?"*
   - The system retrieves high-relevance chunks from our internal RAG database and incorporates them into the response:
     *`"ATS resumes should avoid putting key details like contact info in headers or footers, as older parsers ignore these sections."`*

---

## 💬 Scenario 3: Real-Time Interview Coaching
This highlights the adaptive interview coach scoring responses against proven frameworks.

1. **Generate Interview Sessions**:
   - Go to `/interview` (Interview Coach).
   - Select the target role and interview format (e.g., `Behavioral`).
   - Click "Generate Questions". The system presents realistic, tailormade scenarios.

2. **Submit Answers & Score**:
   - Answer of one of the questions (e.g., *"Describe a time you solved a hard technical problem..."*).
   - Answer using the **STAR methodology** (Situation, Task, Action, Result).
   - Click "Submit Answer". The **Interview Coach Agent** compares your response against the STAR guidelines indexed in the vector store and returns a score, constructive feedback, and advice on areas to improve.
