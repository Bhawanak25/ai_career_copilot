/**
 * Model Context Protocol (MCP) Server emulation.
 * Provides advanced system and market intelligence tools that agents can invoke dynamically
 * to retrieve real-time external knowledge, telemetry, and platform services.
 */
export class MCPServer {
  /**
   * Tool: Query trending skills by business domain/technology
   */
  public get_trending_skills(domain: string): { domain: string; skills: string[]; demandGrowthPercent: number } {
    const domainLower = (domain || "").toLowerCase();
    
    if (domainLower.includes("web") || domainLower.includes("front") || domainLower.includes("react")) {
      return {
        domain: "Web Development",
        skills: ["React 19", "Tailwind CSS v4", "TypeScript", "Next.js 15 Server Actions", "Qwik", "Vite"],
        demandGrowthPercent: 32
      };
    }
    
    if (domainLower.includes("ai") || domainLower.includes("agent") || domainLower.includes("ml")) {
      return {
        domain: "AI Agents & Systems",
        skills: ["Gemini @google/genai SDK", "LangChain/LangGraph", "Vector DBs (Chroma, VectorIndex)", "PyTorch", "Model Context Protocol (MCP)", "AutoGPT Systems"],
        demandGrowthPercent: 148
      };
    }

    if (domainLower.includes("cloud") || domainLower.includes("devops") || domainLower.includes("infra")) {
      return {
        domain: "Cloud & Platform Infrastructure",
        skills: ["Kubernetes", "Docker", "Terraform", "GitHub Actions CI/CD", "AWS CloudFormation", "Serverless Functions"],
        demandGrowthPercent: 44
      };
    }

    // Default general industry skills
    return {
      domain: domain || "Unified Engineering Core",
      skills: ["Typescript/Javascript", "Python", "SQL Data Architecture", "Docker Containers", "Git Branching Models", "REST & GraphQL APIs"],
      demandGrowthPercent: 18
    };
  }

  /**
   * Tool: Retrieves robust current salary projections and insights
   */
  public get_salary_insights(role: string, region = "US/Remote"): {
    role: string;
    region: string;
    baseMedian: number;
    topPercentile: number;
    benefitsBonus: string;
    marketOutlook: "High Demand" | "Moderate Growth" | "Saturating";
  } {
    const rLower = (role || "").toLowerCase();
    
    if (rLower.includes("agent") || rLower.includes("ai") || rLower.includes("ml")) {
      return {
        role: role || "AI Solutions Engineer",
        region,
        baseMedian: 165000,
        topPercentile: 220000,
        benefitsBonus: "Stock Options + 15% annual performance bonus",
        marketOutlook: "High Demand"
      };
    }

    if (rLower.includes("architect") || rLower.includes("principal")) {
      return {
        role: role || "Principal Software Architect",
        region,
        baseMedian: 185000,
        topPercentile: 250000,
        benefitsBonus: "Generous equity grant + 20% annual performance bonus",
        marketOutlook: "High Demand"
      };
    }

    if (rLower.includes("full") || rLower.includes("backend") || rLower.includes("dev")) {
      return {
        role: role || "Full-Stack Engineer",
        region,
        baseMedian: 125000,
        topPercentile: 175000,
        benefitsBonus: "Incentive stock units + health allowances",
        marketOutlook: "High Demand"
      };
    }

    // Baseline stats
    return {
      role: role || "Software Engineer",
      region,
      baseMedian: 110000,
      topPercentile: 150000,
      benefitsBonus: "Standard comprehensive healthcare coverage",
      marketOutlook: "Moderate Growth"
    };
  }

  /**
   * Tool: Gathers verified learning resources, links, and preparation duration
   */
  public get_learning_resources(skill: string): {
    skill: string;
    resources: Array<{ title: string; type: "course" | "doc" | "project"; cost: "Free" | "Paid"; url: string }>;
    recommendedWeeks: number;
  } {
    const sLower = (skill || "").toLowerCase();

    if (sLower.includes("typescript") || sLower.includes("js")) {
      return {
        skill,
        resources: [
          { title: "TypeScript Deep Dive Guide", type: "doc", cost: "Free", url: "https://basarat.gitbook.io/typescript" },
          { title: "Advanced React with TypeScript on Frontend Masters", type: "course", cost: "Paid", url: "https://frontendmasters.com" },
          { title: "Node.js & TS Backend Server Blueprint", type: "project", cost: "Free", url: "https://github.com/microsoft/TypeScript-Node-Starter" }
        ],
        recommendedWeeks: 3
      };
    }

    if (sLower.includes("ai") || sLower.includes("mcp") || sLower.includes("gemini")) {
      return {
        skill,
        resources: [
          { title: "Google GenAI SDK Documentation", type: "doc", cost: "Free", url: "https://github.com/google/generative-ai-js" },
          { title: "Model Context Protocol (MCP) Official Spec", type: "doc", cost: "Free", url: "https://modelcontextprotocol.io" },
          { title: "DeepLearning.AI: Multi-Agent Systems", type: "course", cost: "Free", url: "https://www.deeplearning.ai" }
        ],
        recommendedWeeks: 4
      };
    }

    // Default general learning stack
    return {
      skill,
      resources: [
        { title: "MDN Web Docs: General Mastery", type: "doc", cost: "Free", url: "https://developer.mozilla.org" },
        { title: "Build Full Stack Projects - freeCodeCamp", type: "course", cost: "Free", url: "https://www.freecodecamp.org" }
      ],
      recommendedWeeks: 2
    };
  }

  /**
   * Tool: Dynamic Job Market intelligence tracker
   */
  public get_job_market_data(title: string): {
    jobTitle: string;
    remoteAvailabilityPercent: number;
    hiringVelocity: "Aggressive" | "Steady" | "Slowing";
    topSectors: string[];
    averageInterviewStepCount: number;
  } {
    const tLower = (title || "").toLowerCase();

    if (tLower.includes("ai") || tLower.includes("agent") || tLower.includes("data")) {
      return {
        jobTitle: title || "AI Agent Developer",
        remoteAvailabilityPercent: 88,
        hiringVelocity: "Aggressive",
        topSectors: ["Enterprise SaaS", "Autonomous Agents Consulting", "Medical Tech", "Fintech Innovations"],
        averageInterviewStepCount: 3
      };
    }

    if (tLower.includes("front") || tLower.includes("react") || tLower.includes("engineer")) {
      return {
        jobTitle: title || "Software Engineer (Web/React)",
        remoteAvailabilityPercent: 72,
        hiringVelocity: "Steady",
        topSectors: ["E-Commerce Platforms", "Social Computing Solutions", "Edtech Management Systems"],
        averageInterviewStepCount: 4
      };
    }

    // Default telemetry values
    return {
      jobTitle: title || "General Technologist",
      remoteAvailabilityPercent: 65,
      hiringVelocity: "Steady",
      topSectors: ["High Technology", "Financial Consulting Services", "Public Sector Digitalization"],
      averageInterviewStepCount: 4
    };
  }
}
