export interface User {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  resume_text: string;
  uploaded_file_name: string;
  ats_score: number;
  feedback_summary: string;
  grammar_analysis: string[];
  formatting_suggestions: string[];
  missing_keywords: string[];
  strengths: string[];
  weaknesses: string[];
  created_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_name: string;
  proficiency_level: "Beginner" | "Intermediate" | "Advanced";
}

export interface InterviewSession {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  feedback: string;
  score: number; // score from 0-100 or 1-10
  category: "Technical" | "Behavioral" | "HR";
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  task_name: string;
  priority: "High" | "Medium" | "Low";
  due_date: string;
  status: "Pending" | "Completed";
  created_at: string;
}

export interface LearningRoadmap {
  id: string;
  user_id: string;
  target_role: string;
  current_skills: string[];
  duration_weeks: number;
  roadmap_data: {
    week: number;
    title: string;
    description: string;
    milestones: string[];
    resources: Array<{ name: string; url: string; type: "Video" | "Article" | "Book" | "Course" }>;
    daily_schedule: string[];
  }[];
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  messages: ChatMessage[];
  updated_at: string;
}

export interface DashboardStats {
  totalResumesAnalyzed: number;
  averageAtsScore: number;
  skillsCompleted: number; // advanced or intermediate skills counts
  interviewPerformance: number; // average interview score
  tasksCompleted: number;
  learningProgress: number; // overall percentage (mock or calculated)
}
