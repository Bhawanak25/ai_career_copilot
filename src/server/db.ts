import fs from "fs";
import path from "path";
import crypto from "crypto";
import { User, Resume, UserSkill, InterviewSession, Task, LearningRoadmap, ChatSession, DashboardStats } from "../types/index.js";
import { secureHashPassword, verifyPassword } from "./security.js";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

interface DatabaseStructure {
  users: User[];
  resumes: Resume[];
  skills: UserSkill[];
  interviews: InterviewSession[];
  tasks: Task[];
  roadmaps: LearningRoadmap[];
  chats: ChatSession[];
}

const DEFAULT_DB: DatabaseStructure = {
  users: [],
  resumes: [],
  skills: [],
  interviews: [],
  tasks: [],
  roadmaps: [],
  chats: []
};

// Initialize DB state
let dbState: DatabaseStructure = { ...DEFAULT_DB };

function loadDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      dbState = JSON.parse(data);
    } else {
      saveDatabase();
    }
  } catch (error) {
    console.error("Failed to load backend DB file, initializing empty:", error);
    dbState = { ...DEFAULT_DB };
  }
}

function saveDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write to database file:", error);
  }
}

// Load database immediately upon start
loadDatabase();

// Helper to hash passwords securely using standard built-in Node crypto (PBKDF2 secured)
export function hashPassword(password: string): string {
  return secureHashPassword(password);
}

export const db = {
  // --- USERS operations ---
  users: {
    create: (fullName: string, email: string, passwordPlain: string): User => {
      const existing = dbState.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        throw new Error("User with this email already exists");
      }
      const newUser: User = {
        id: crypto.randomUUID(),
        full_name: fullName,
        email: email.toLowerCase(),
        password_hash: secureHashPassword(passwordPlain),
        created_at: new Date().toISOString()
      };
      dbState.users.push(newUser);
      
      // Auto-seed some initial items for a beautiful dashboard out of the box
      db.skills.create(newUser.id, "Communication Skills", "Intermediate");
      db.skills.create(newUser.id, "Problem Solving", "Advanced");
      db.tasks.create(newUser.id, "Complete modern resume draft & upload it to Copilot", "High", "2026-06-20");
      db.tasks.create(newUser.id, "Practice 3 behavioral questions in AI Interview Coach", "Medium", "2026-06-22");
      db.tasks.create(newUser.id, "Generate a learning roadmap for target Software Engineer position", "High", "2026-06-25");

      saveDatabase();
      return newUser;
    },
    authenticate: (email: string, passwordPlain: string): User | null => {
      const found = dbState.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!found) return null;
      if (verifyPassword(passwordPlain, found.password_hash)) {
        return found;
      }
      return null;
    },
    getById: (id: string): User | null => {
      return dbState.users.find(u => u.id === id) || null;
    },
    updateProfile: (id: string, fullName: string, email: string): User => {
      const user = dbState.users.find(u => u.id === id);
      if (!user) throw new Error("User not found");
      
      const emailLower = email.toLowerCase();
      const existing = dbState.users.find(u => u.email.toLowerCase() === emailLower && u.id !== id);
      if (existing) throw new Error("Email is already in use by another user");
      
      user.full_name = fullName;
      user.email = emailLower;
      saveDatabase();
      return user;
    }
  },

  // --- RESUMES operations ---
  resumes: {
    create: (userId: string, data: Omit<Resume, "id" | "user_id" | "created_at">): Resume => {
      const newResume: Resume = {
        ...data,
        id: crypto.randomUUID(),
        user_id: userId,
        created_at: new Date().toISOString()
      };
      dbState.resumes.push(newResume);
      saveDatabase();
      return newResume;
    },
    getByUserId: (userId: string): Resume[] => {
      return dbState.resumes.filter(r => r.user_id === userId);
    },
    getById: (resumeId: string): Resume | null => {
      return dbState.resumes.find(r => r.id === resumeId) || null;
    },
    delete: (resumeId: string, userId: string): boolean => {
      const initialLength = dbState.resumes.length;
      dbState.resumes = dbState.resumes.filter(r => !(r.id === resumeId && r.user_id === userId));
      if (dbState.resumes.length !== initialLength) {
        saveDatabase();
        return true;
      }
      return false;
    }
  },

  // --- SKILLS operations ---
  skills: {
    create: (userId: string, skillName: string, level: "Beginner" | "Intermediate" | "Advanced"): UserSkill => {
      const existing = dbState.skills.find(s => s.user_id === userId && s.skill_name.toLowerCase() === skillName.toLowerCase());
      if (existing) {
        existing.proficiency_level = level;
        saveDatabase();
        return existing;
      }
      const newSkill: UserSkill = {
        id: crypto.randomUUID(),
        user_id: userId,
        skill_name: skillName,
        proficiency_level: level
      };
      dbState.skills.push(newSkill);
      saveDatabase();
      return newSkill;
    },
    getByUserId: (userId: string): UserSkill[] => {
      return dbState.skills.filter(s => s.user_id === userId);
    },
    delete: (skillId: string, userId: string): boolean => {
      const initLen = dbState.skills.length;
      dbState.skills = dbState.skills.filter(s => !(s.id === skillId && s.user_id === userId));
      if (dbState.skills.length !== initLen) {
        saveDatabase();
        return true;
      }
      return false;
    }
  },

  // --- INTERVIEWS operations ---
  interviews: {
    create: (userId: string, data: Omit<InterviewSession, "id" | "user_id" | "created_at">): InterviewSession => {
      const newSession: InterviewSession = {
        ...data,
        id: crypto.randomUUID(),
        user_id: userId,
        created_at: new Date().toISOString()
      };
      dbState.interviews.push(newSession);
      saveDatabase();
      return newSession;
    },
    getByUserId: (userId: string): InterviewSession[] => {
      return dbState.interviews.filter(i => i.user_id === userId);
    },
    clearSessions: (userId: string): void => {
      dbState.interviews = dbState.interviews.filter(i => i.user_id !== userId);
      saveDatabase();
    }
  },

  // --- TASKS operations ---
  tasks: {
    create: (userId: string, taskName: string, priority: "High" | "Medium" | "Low", dueDate: string): Task => {
      const newTask: Task = {
        id: crypto.randomUUID(),
        user_id: userId,
        task_name: taskName,
        priority,
        due_date: dueDate || new Date().toISOString().split('T')[0],
        status: "Pending",
        created_at: new Date().toISOString()
      };
      dbState.tasks.push(newTask);
      saveDatabase();
      return newTask;
    },
    getByUserId: (userId: string): Task[] => {
      return dbState.tasks.filter(t => t.user_id === userId);
    },
    update: (taskId: string, userId: string, updates: Partial<Omit<Task, "id" | "user_id" | "created_at">>): Task => {
      const task = dbState.tasks.find(t => t.id === taskId && t.user_id === userId);
      if (!task) throw new Error("Task not found");
      Object.assign(task, updates);
      saveDatabase();
      return task;
    },
    delete: (taskId: string, userId: string): boolean => {
      const initLen = dbState.tasks.length;
      dbState.tasks = dbState.tasks.filter(t => !(t.id === taskId && t.user_id === userId));
      if (dbState.tasks.length !== initLen) {
        saveDatabase();
        return true;
      }
      return false;
    }
  },

  // --- ROADMAPS operations ---
  roadmaps: {
    create: (userId: string, roadmap: Omit<LearningRoadmap, "id" | "user_id" | "created_at">): LearningRoadmap => {
      // Remove any prior roadmap for this role to avoid cluttering
      dbState.roadmaps = dbState.roadmaps.filter(r => !(r.user_id === userId && r.target_role.toLowerCase() === roadmap.target_role.toLowerCase()));

      const newRoadmap: LearningRoadmap = {
        ...roadmap,
        id: crypto.randomUUID(),
        user_id: userId,
        created_at: new Date().toISOString()
      };
      dbState.roadmaps.push(newRoadmap);
      saveDatabase();
      return newRoadmap;
    },
    getByUserId: (userId: string): LearningRoadmap[] => {
      return dbState.roadmaps.filter(r => r.user_id === userId);
    },
    getLatestByUserId: (userId: string): LearningRoadmap | null => {
      const userRoadmaps = dbState.roadmaps.filter(r => r.user_id === userId);
      if (userRoadmaps.length === 0) return null;
      return userRoadmaps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    },
    delete: (roadmapId: string, userId: string): boolean => {
      const initLen = dbState.roadmaps.length;
      dbState.roadmaps = dbState.roadmaps.filter(r => !(r.id === roadmapId && r.user_id === userId));
      if (dbState.roadmaps.length !== initLen) {
        saveDatabase();
        return true;
      }
      return false;
    }
  },

  // --- CHATS operations ---
  chats: {
    createSession: (userId: string, title: string): ChatSession => {
      const newSession: ChatSession = {
        id: crypto.randomUUID(),
        user_id: userId,
        title,
        messages: [{
          id: crypto.randomUUID(),
          role: "model",
          content: "Hello! I am your AI Career Copilot Chatbot. I'm here to give you expert resume advice, placement interview preparation tips, target industry analysis, or learning path recommendations. What would you like to plan today?",
          timestamp: new Date().toISOString()
        }],
        updated_at: new Date().toISOString()
      };
      dbState.chats.push(newSession);
      saveDatabase();
      return newSession;
    },
    getByUserId: (userId: string): ChatSession[] => {
      return dbState.chats.filter(c => c.user_id === userId).sort((a,b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    },
    addMessage: (sessionId: string, userId: string, role: "user" | "model", content: string): ChatSession => {
      const session = dbState.chats.find(c => c.id === sessionId && c.user_id === userId);
      if (!session) throw new Error("Chat session not found");
      session.messages.push({
        id: crypto.randomUUID(),
        role,
        content,
        timestamp: new Date().toISOString()
      });
      session.updated_at = new Date().toISOString();
      saveDatabase();
      return session;
    },
    deleteSession: (sessionId: string, userId: string): boolean => {
      const initLen = dbState.chats.length;
      dbState.chats = dbState.chats.filter(c => !(c.id === sessionId && c.user_id === userId));
      if (dbState.chats.length !== initLen) {
        saveDatabase();
        return true;
      }
      return false;
    }
  },

  // --- STATS Aggregator ---
  stats: {
    getStats: (userId: string): DashboardStats => {
      const userResumes = db.resumes.getByUserId(userId);
      const userSkills = db.skills.getByUserId(userId);
      const userInterviews = db.interviews.getByUserId(userId);
      const userTasks = db.tasks.getByUserId(userId);
      const latestRoadmap = db.roadmaps.getLatestByUserId(userId);

      const totalResumesAnalyzed = userResumes.length;
      const avgScore = totalResumesAnalyzed > 0 
        ? Math.round(userResumes.reduce((acc, curr) => acc + curr.ats_score, 0) / totalResumesAnalyzed)
        : 0;

      const skillsCompleted = userSkills.filter(s => s.proficiency_level === "Advanced" || s.proficiency_level === "Intermediate").length;

      const totalInt = userInterviews.length;
      const avgIntScore = totalInt > 0
        ? Math.round(userInterviews.reduce((acc, curr) => acc + curr.score, 0) / totalInt)
        : 0;

      const totalTasksCount = userTasks.length;
      const tasksCompleted = userTasks.filter(t => t.status === "Completed").length;

      // Simple roadmap progress mock (weekly milestones completed)
      let learningProgress = 0;
      if (latestRoadmap && latestRoadmap.roadmap_data.length > 0) {
        // Mock a progress based on roadmap age or completed tasks percentage
        const taskRatio = totalTasksCount > 0 ? (tasksCompleted / totalTasksCount) * 40 : 15;
        const skillsFactor = Math.min(userSkills.length * 8, 40);
        learningProgress = Math.min(Math.round(20 + taskRatio + skillsFactor), 100);
      } else {
        learningProgress = totalTasksCount > 0 ? Math.round((tasksCompleted / totalTasksCount) * 100) : 0;
      }

      return {
        totalResumesAnalyzed,
        averageAtsScore: avgScore,
        skillsCompleted,
        interviewPerformance: avgIntScore,
        tasksCompleted,
        learningProgress
      };
    }
  }
};
