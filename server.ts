import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { db } from "./src/server/db.js";
import {
  signToken,
  verifyToken,
  rateLimitAuth,
  rateLimitGemini,
  inputValidation,
  secureFileValidation
} from "./src/server/security.js";
import { CareerVectorStore } from "./src/server/vectorStore.js";
import { MCPServer } from "./src/server/mcpServer.js";
import { AgentOrchestrator, getAgentMemory } from "./src/server/agents.js";

const app = express();
const PORT = 3000;

// Set up large JSON body limit to support base64 PDF resumes
app.use(express.json({ limit: "15mb" }));

// Lazy initializer for the Gemini AI client using the modern @google/genai SDK
let aiInstance: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is missing. Please configure it in Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Instantiate core capstone components
const vectorStore = new CareerVectorStore(getAI);
const mcpServer = new MCPServer();
const orchestrator = new AgentOrchestrator(getAI, mcpServer, vectorStore);

// Trigger vector store async indexing on server boot
vectorStore.initialize().catch(err => {
  console.error("Vector store launch failure:", err);
});

// Upgraded Session authentication middleware using JWT with stable direct access fallback.
// This is exceptionally robust for iFrame previews where 3rd-party cookies are blocked.
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const token = authHeader.substring(7);
  let userId: string | null = null;

  // 1. First attempt to verify JWT
  const decoded = verifyToken(token);
  if (decoded && decoded.userId) {
    userId = decoded.userId;
  } else {
    // 2. Backward compatibility fallback: Check if token is a direct legacy user UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token);
    if (isUuid) {
      userId = token;
    }
  }

  if (!userId) {
    res.status(401).json({ error: "Session expired or invalid authentication token" });
    return;
  }

  const user = db.users.getById(userId);
  if (!user) {
    res.status(401).json({ error: "User session not found or deleted" });
    return;
  }

  req.userId = userId; // Extend express Request
  next();
}

// Fallback types for typescript-express matching
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// ==========================================
// API ROUTES
// ==========================================

// Auth Endpoints
app.post("/api/auth/register", rateLimitAuth, (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      res.status(400).json({ error: "Full name, email, and password are required" });
      return;
    }

    // 1. Sanitize string parameters
    const sanitizedName = inputValidation.sanitizeText(fullName);
    const trimmedEmail = email.trim().toLowerCase();

    // 2. Perform security & complexity checks
    if (!inputValidation.isValidName(sanitizedName)) {
      res.status(400).json({ error: "Register Failure: Name must be between 2 and 60 characters long without markup tags." });
      return;
    }
    if (!inputValidation.isValidEmail(trimmedEmail)) {
      res.status(400).json({ error: "Register Failure: Please enter a valid, well-formed email address." });
      return;
    }
    if (!inputValidation.isValidPassword(password)) {
      res.status(400).json({ error: "Register Failure: For safety, password must be at least 8 characters long and contain at least one number or special character." });
      return;
    }

    const user = db.users.create(sanitizedName, trimmedEmail, password);
    const token = signToken(user.id, user.email);
    res.status(201).json({ token, user: { id: user.id, email: user.email, full_name: user.full_name } });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to register" });
  }
});

app.post("/api/auth/login", rateLimitAuth, (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!inputValidation.isValidEmail(trimmedEmail)) {
      res.status(400).json({ error: "Login Failure: Invalid email format." });
      return;
    }

    const user = db.users.authenticate(trimmedEmail, password);
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    
    // Create and return a signed secure JWT authentication token
    const token = signToken(user.id, user.email);
    res.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name } });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to authenticate" });
  }
});

app.get("/api/auth/session", requireAuth, (req, res) => {
  try {
    const user = db.users.getById(req.userId!);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ user: { id: user.id, email: user.email, full_name: user.full_name } });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Session error" });
  }
});

app.put("/api/auth/profile", requireAuth, rateLimitAuth, (req, res) => {
  try {
    const { fullName, email } = req.body;
    if (!fullName || !email) {
      res.status(400).json({ error: "Full name and email are required" });
      return;
    }

    const sanitizedName = inputValidation.sanitizeText(fullName);
    const trimmedEmail = email.trim().toLowerCase();

    if (!inputValidation.isValidName(sanitizedName)) {
      res.status(400).json({ error: "Update Failure: Name must be between 2 and 60 characters long." });
      return;
    }
    if (!inputValidation.isValidEmail(trimmedEmail)) {
      res.status(400).json({ error: "Update Failure: Please enter a valid email address." });
      return;
    }

    const user = db.users.updateProfile(req.userId!, sanitizedName, trimmedEmail);
    res.json({ user: { id: user.id, email: user.email, full_name: user.full_name } });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to update profile" });
  }
});

// Dashboard Stats Endpoint
app.get("/api/dashboard/stats", requireAuth, (req, res) => {
  try {
    const stats = db.stats.getStats(req.userId!);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch stats" });
  }
});

// RESUME ANALYZER API (Gemini Powered)
app.post("/api/resume/analyze", requireAuth, rateLimitGemini, async (req, res) => {
  try {
    const { resumeText, fileName, fileBase64, mimeType } = req.body;
    
    // 1. Secure file upload validation and sanitization
    const validationResult = secureFileValidation.validatePayload(fileBase64, mimeType, fileName);
    if (!validationResult.isValid) {
      res.status(400).json({ error: validationResult.error });
      return;
    }

    const sanitizedFileName = secureFileValidation.sanitizeFileName(fileName || "PastedTextResume");
    const sanitizedResumeText = resumeText ? inputValidation.sanitizeText(resumeText) : undefined;

    if (!sanitizedResumeText && !fileBase64) {
      res.status(400).json({ error: "Please enter your resume text or upload a document." });
      return;
    }

    const ai = getAI();
    let analysisPrompt = "";
    let contentsPayload: any[] = [];

    if (fileBase64 && mimeType) {
      // PDF or DOCX file upload analysis directly with Gemini 3.5 Flash!
      contentsPayload = [
        {
          inlineData: {
            mimeType: mimeType,
            data: fileBase64,
          },
        },
        {
          text: "Analyze this uploaded resume document carefully. Identify formatting, missing keywords, grammatical issues, structural gaps, strengths, weaknesses, and simulate an ATS (Applicant Tracking Systems) alignment score out of 100. Structure your feedback in standard JSON format accurately.",
        }
      ];
    } else {
      // Raw text paste analysis
      contentsPayload = [
        `You are a senior professional technical recruiter and ATS algorithms specialist. 
        Analyze the following resume and assess it for layout quality, syntax, grammatical polish, and keywords:
        
        Resume Content:
        "${sanitizedResumeText}"
        
        Evaluate the details and return a complete JSON response explaining the grammar analysis, keyword gaps, and formatting critique.`
      ];
    }

    const geminiRes = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contentsPayload,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are an ATS compliance optimization engine. You MUST output a clean, parsable JSON response that matches the exact responseSchema specified.",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            atsScore: { type: Type.INTEGER, description: "A calculated ATS compatibility score from 0 to 100 based on standard industry filters." },
            feedbackSummary: { type: Type.STRING, description: "Highly engaging resume overview feedback summarizing the critique in 2-3 sentences." },
            grammarAnalysis: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific bulleted sentences highlighting spacing typos, phrasing mistakes, or styling grammar failures." },
            formattingSuggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Direct guidelines on how to rearrange the resume contents, headers, or timeline layout." },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A high-impact list of technical and soft-skill keywords that are missing but highly requested in related roles." },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Action-oriented phrasing strengths, project metrics, or certification callouts present in the resume." },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Core gaps, lack of quantified outcomes, passive verb usages, or missing contact details." }
          },
          required: ["atsScore", "feedbackSummary", "grammarAnalysis", "formattingSuggestions", "missingKeywords", "strengths", "weaknesses"]
        }
      }
    });

    const parsedData = JSON.parse(geminiRes.text?.trim() || "{}");
    
    // Save the resume analysis report under the user's DB
    const savedResume = db.resumes.create(req.userId!, {
      resume_text: sanitizedResumeText || "[Uploaded Resume document]",
      uploaded_file_name: sanitizedFileName,
      ats_score: parsedData.atsScore || 70,
      feedback_summary: parsedData.feedbackSummary || "N/A",
      grammar_analysis: parsedData.grammarAnalysis || [],
      formatting_suggestions: parsedData.formattingSuggestions || [],
      missing_keywords: parsedData.missingKeywords || [],
      strengths: parsedData.strengths || [],
      weaknesses: parsedData.weaknesses || []
    });

    res.json({ report: savedResume });
  } catch (error: any) {
    console.error("Resume Analysis Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze resume" });
  }
});

app.get("/api/resume/history", requireAuth, (req, res) => {
  try {
    const resumes = db.resumes.getByUserId(req.userId!);
    res.json(resumes);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch resume stories" });
  }
});

app.delete("/api/resume/:id", requireAuth, (req, res) => {
  try {
    const deleted = db.resumes.delete(req.params.id, req.userId!);
    res.json({ success: deleted });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// MULTI-AGENT COMPREHENSIVE PIPELINE DIAGNOSTIC ENDPOINT (RAG + MCP + State Memory Enabled)
app.post("/api/agent/diagnostic", requireAuth, rateLimitGemini, async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;
    if (!resumeText || !targetRole) {
      res.status(400).json({ error: "Both resumeText and targetRole parameters are required for full Multi-Agent pipeline diagnosis." });
      return;
    }
    const result = await orchestrator.executeEndToEndDiagnostic(
      req.userId!,
      resumeText,
      targetRole
    );
    res.json(result);
  } catch (error: any) {
    console.error("Multi-Agent Diagnostic Failure:", error);
    res.status(500).json({ error: error.message || "Failed to execute complete Multi-Agent analysis." });
  }
});

// SKILL GAP ANALYZER API (Gemini Powered)
app.post("/api/skills/gap-analysis", requireAuth, rateLimitGemini, async (req, res) => {
  try {
    const { targetRole, currentSkills } = req.body;
    if (!targetRole) {
      res.status(400).json({ error: "Target job role is required" });
      return;
    }

    const sanitizedRole = inputValidation.sanitizeText(targetRole);
    const ai = getAI();
    const prompt = `Assess gaps for a candidate who wants to apply as a "${sanitizedRole}". 
    Their current state of skills is defined as follows: ${JSON.stringify(currentSkills)}.
    
    Analyze and output a structured JSON plan for their development.`;

    const geminiRes = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are an expert tech-industry career counselor. Compare current skills with the target industry role and return detailed JSON missing-skills matrices.",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            missingSkills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Name of the missing technical or professional skill" },
                  importance: { type: Type.STRING, description: "High, Medium, or Low" },
                  reason: { type: Type.STRING, description: "Brief explanation of why this skill is vital for a " + targetRole }
                },
                required: ["name", "importance", "reason"]
              }
            },
            improvementPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phase: { type: Type.STRING, description: "E.g., Phase 1: Foundations, Phase 2: Building Projects" },
                  steps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Clear, sequential learning action items." }
                },
                required: ["phase", "steps"]
              }
            }
          },
          required: ["missingSkills", "improvementPlan"]
        }
      }
    });

    const parsedData = JSON.parse(geminiRes.text?.trim() || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Skill Gap Analysis Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze skill gaps" });
  }
});

// SKILLS CRUD
app.get("/api/skills", requireAuth, (req, res) => {
  try {
    const skills = db.skills.getByUserId(req.userId!);
    res.json(skills);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/skills", requireAuth, (req, res) => {
  try {
    const { skillName, proficiencyLevel } = req.body;
    if (!skillName || !proficiencyLevel) {
      res.status(400).json({ error: "Skill name and proficiency level required" });
      return;
    }
    const skill = db.skills.create(req.userId!, skillName, proficiencyLevel);
    res.json(skill);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/skills/:id", requireAuth, (req, res) => {
  try {
    const deleted = db.skills.delete(req.params.id, req.userId!);
    res.json({ success: deleted });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// INTERVIEW COACH API (Gemini Powered)
app.post("/api/interview/generate", requireAuth, rateLimitGemini, async (req, res) => {
  try {
    const { category, targetRole } = req.body; // Technical, Behavioral, HR
    if (!category || !targetRole) {
      res.status(400).json({ error: "Category (Technical/Behavioral/HR) and Target Role are required" });
      return;
    }

    const sanitizedCategory = inputValidation.sanitizeText(category);
    const sanitizedRole = inputValidation.sanitizeText(targetRole);
    const ai = getAI();
    const prompt = `Generate 4 realistic and professional interview questions for the candidate targeting a "${sanitizedRole}" role, specifically of type "${sanitizedCategory}". Focus on core concepts, scenarios, and soft skills respectively.`;

    const geminiRes = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are an elite corporate interviewer. Generate appropriate interview questions for technical, behavioral, or general HR streams.",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  category: { type: Type.STRING, description: "Technical, Behavioral, or HR" }
                },
                required: ["question", "category"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const parsedData = JSON.parse(geminiRes.text?.trim() || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Interview Question Generation Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate interview questions" });
  }
});

app.post("/api/interview/evaluate", requireAuth, rateLimitGemini, async (req, res) => {
  try {
    const { question, answer, category } = req.body;
    if (!question || !answer) {
      res.status(400).json({ error: "Question and Answer are required for evaluation" });
      return;
    }

    const sanitizedQuestion = inputValidation.sanitizeText(question);
    const sanitizedAnswer = inputValidation.sanitizeText(answer);
    const sanitizedCategory = category ? inputValidation.sanitizeText(category) : "Technical";

    const ai = getAI();
    const prompt = `Evaluate our candidate's response to the interview question below:
    
    Question: "${sanitizedQuestion}"
    Candidate Answer: "${sanitizedAnswer}"
    Category: "${sanitizedCategory}"

    Analyze the technical correctness, structure, phrasing, and assign a score out of 100. Write constructive feedback.`;

    const geminiRes = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are an AI Interview Coach. Grade the user's verbal or written answer, highlight missed terms or STAR method frameworks, and render a confidence/quality score out of 100.",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Numeric score from 0 to 100." },
            feedback: { type: Type.STRING, description: "Constructive feedback on what was mentioned well and what was left out." },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific suggestions on keywords, concepts, or STAR layouts to speak of." }
          },
          required: ["score", "feedback", "suggestions"]
        }
      }
    });

    const parsedData = JSON.parse(geminiRes.text?.trim() || "{}");

    // Save evaluation to db
    const savedSession = db.interviews.create(req.userId!, {
      question,
      answer,
      feedback: parsedData.feedback + " | Recommendations: " + (parsedData.suggestions || []).join(", "),
      score: parsedData.score || 50,
      category: category || "Technical"
    });

    res.json({ result: savedSession });
  } catch (error: any) {
    console.error("Interview Evaluation Error:", error);
    res.status(500).json({ error: error.message || "Failed to evaluate response" });
  }
});

app.get("/api/interview/history", requireAuth, (req, res) => {
  try {
    const history = db.interviews.getByUserId(req.userId!);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/interview/history", requireAuth, (req, res) => {
  try {
    db.interviews.clearSessions(req.userId!);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// LEARNING ROADMAP API (Gemini Powered)
app.post("/api/roadmap/generate", requireAuth, rateLimitGemini, async (req, res) => {
  try {
    const { targetRole, currentSkills, durationWeeks } = req.body;
    if (!targetRole) {
      res.status(400).json({ error: "Target job role is required" });
      return;
    }

    const sanitizedRole = inputValidation.sanitizeText(targetRole);
    const sanitizedSkills = Array.isArray(currentSkills) 
      ? currentSkills.map(s => typeof s === "string" ? inputValidation.sanitizeText(s) : "") 
      : [];

    const weeks = durationWeeks ? parseInt(durationWeeks) : 6;
    const ai = getAI();
    const prompt = `Generate a customized ${weeks}-week training roadmap for a student aspiring to be a "${sanitizedRole}". 
    Their starting skills are: ${JSON.stringify(sanitizedSkills)}. 
    Provide real-world topics, milestone achievements, a daily routine, and authentic, highly recommended educational resource URLs.`;

    const geminiRes = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are a professional technical training architect. Design bespoke visual learning roadmaps structured weekly.",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roadmapData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  week: { type: Type.INTEGER, description: "Week number starting at 1" },
                  title: { type: Type.STRING, description: "Thematic title of this week, e.g. Mastering Asynchronous JS" },
                  description: { type: Type.STRING, description: "A summary explaining this week's technical focus." },
                  milestones: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific goals the student should complete by Sunday." },
                  daily_schedule: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Structured daily tasks (Monday through Friday)." },
                  resources: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING, description: "Name of the resource, website, or course, e.g., freeCodeCamp, MDN Docs" },
                        url: { type: Type.STRING, description: "Valid documentation or guide url, defaults to general resource websites if specific is uncertain" },
                        type: { type: Type.STRING, description: "Video, Article, Book, or Course" }
                      },
                      required: ["name", "url", "type"]
                    }
                  }
                },
                required: ["week", "title", "description", "milestones", "resources", "daily_schedule"]
              }
            }
          },
          required: ["roadmapData"]
        }
      }
    });

    const parsedData = JSON.parse(geminiRes.text?.trim() || "{}");
    
    // Save to user DB
    const savedRoadmap = db.roadmaps.create(req.userId!, {
      target_role: targetRole,
      current_skills: currentSkills || [],
      duration_weeks: weeks,
      roadmap_data: parsedData.roadmapData || []
    });

    res.json(savedRoadmap);
  } catch (error: any) {
    console.error("Roadmap Generation Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate learning roadmap" });
  }
});

app.get("/api/roadmap/latest", requireAuth, (req, res) => {
  try {
    const roadmap = db.roadmaps.getLatestByUserId(req.userId!);
    res.json(roadmap);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// SMART TASKS CRUD
app.get("/api/tasks", requireAuth, (req, res) => {
  try {
    const tasks = db.tasks.getByUserId(req.userId!);
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/tasks", requireAuth, (req, res) => {
  try {
    const { taskName, priority, dueDate } = req.body;
    if (!taskName) {
      res.status(400).json({ error: "Task name is required" });
      return;
    }
    const task = db.tasks.create(req.userId!, taskName, priority || "Medium", dueDate);
    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/tasks/:id", requireAuth, (req, res) => {
  try {
    const { task_name, priority, due_date, status } = req.body;
    const updated = db.tasks.update(req.params.id, req.userId!, {
      task_name,
      priority,
      due_date,
      status
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/tasks/:id", requireAuth, (req, res) => {
  try {
    const deleted = db.tasks.delete(req.params.id, req.userId!);
    res.json({ success: deleted });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// AI Tasks Prioritizer and recommendations!
app.post("/api/tasks/ai-prioritize", requireAuth, rateLimitGemini, async (req, res) => {
  try {
    const tasks = db.tasks.getByUserId(req.userId!);
    if (tasks.length === 0) {
      res.status(400).json({ error: "You don't have any tasks to prioritize. Please create some tasks first!" });
      return;
    }

    const ai = getAI();
    const prompt = `Review the following task lists of a job-seeker and prioritize them smartly based on urgency and core career-advancement impact:
    ${JSON.stringify(tasks)}.
    
    Return a prioritized re-ordering with explicit reasoning, along with high-value personalized productivity recommendations.`;

    const geminiRes = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are an elite productivity mentor and Agile master. Prioritize tasks and give sharp, short career recommendations.",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prioritizedTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  taskName: { type: Type.STRING },
                  suggestedPriority: { type: Type.STRING, description: "High, Medium, or Low" },
                  reason: { type: Type.STRING, description: "1-sentence why this priority is suggested" }
                },
                required: ["id", "taskName", "suggestedPriority", "reason"]
              }
            },
            productivityAdvice: { type: Type.STRING, description: "2-3 sentences of advice on smart study tactics, time blocks, or focus tools." }
          },
          required: ["prioritizedTasks", "productivityAdvice"]
        }
      }
    });

    const parsedData = JSON.parse(geminiRes.text?.trim() || "{}");

    // Apply the suggested priorities back to our persistence engine!
    interface SugTask { id: string; suggestedPriority: "High" | "Medium" | "Low"; }
    const suggested: SugTask[] = parsedData.prioritizedTasks || [];
    for (const sug of suggested) {
      try {
        db.tasks.update(sug.id, req.userId!, { priority: sug.suggestedPriority });
      } catch (err) {
        // Safe check for tasks that might get out of sync or were deleted
      }
    }

    res.json({
      advice: parsedData.productivityAdvice,
      taskPriorities: parsedData.prioritizedTasks
    });
  } catch (error: any) {
    console.error("AI Prioritize Error:", error);
    res.status(500).json({ error: error.message || "Failed to run AI priorizer" });
  }
});

// CAREER ADVISOR CHATBOT API (Gemini Powered)
app.get("/api/chat/history", requireAuth, (req, res) => {
  try {
    const sessions = db.chats.getByUserId(req.userId!);
    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/chat/session", requireAuth, (req, res) => {
  try {
    const { title } = req.body;
    const newSession = db.chats.createSession(req.userId!, title || "New Career Inquiry");
    res.json(newSession);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/chat/session/:id", requireAuth, (req, res) => {
  try {
    const deleted = db.chats.deleteSession(req.params.id, req.userId!);
    res.json({ success: deleted });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/chat/message", requireAuth, rateLimitGemini, async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    if (!sessionId || !message) {
      res.status(400).json({ error: "Session identification and message text are required" });
      return;
    }

    // Sanitize user message to avoid XSS injections
    const sanitizedMsg = inputValidation.sanitizeText(message);

    // Append user message immediately to keep the database in sync
    db.chats.addMessage(sessionId, req.userId!, "user", sanitizedMsg);

    const historySessions = db.chats.getByUserId(req.userId!);
    const currentSession = historySessions.find(s => s.id === sessionId);
    if (!currentSession) {
      res.status(404).json({ error: "Chat thread not found" });
      return;
    }

    // Format chat thread context for Gemini
    const chatHistory = currentSession.messages.map(m => ({
      role: m.role || "user",
      parts: [{ text: m.content }]
    }));

    const ai = getAI();
    const systemPrompt = `You are "AI Career Copilot", an expert personal career advisor, university placement counselor, and recruitment strategist. 
    Provide highly encouraging, concrete, professional tips for resumes, placement tests, skill acquisitions, networking, and interviews.
    Keep answers very structured (short paragraphs, elegant list bullets) and highly tailored to college students or juniors.`;

    const geminiRes = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      // Map history back to standard structures. Note that contents should be mapped cleanly.
      contents: chatHistory,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7
      }
    });

    const reply = geminiRes.text || "I apologize, but I am facing difficulty organizing career thoughts. Could you repeat that?";
    
    // Save AI response to DB
    const updatedSession = db.chats.addMessage(sessionId, req.userId!, "model", reply);
    res.json({ reply, session: updatedSession });
  } catch (error: any) {
    console.error("Chat message error:", error);
    res.status(500).json({ error: error.message || "Advisor chatbot is currently out of office." });
  }
});

// ==========================================
// VITE / DEVELOPMENT INTEGRATION
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Mount Vite dev server static-serving middlewares!
    app.use(vite.middlewares);
  } else {
    console.log("Starting in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Career Copilot full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
