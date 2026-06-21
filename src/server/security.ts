import crypto from "crypto";
import jwt from "jsonwebtoken";
import express from "express";

// Ensure we have a high-entropy secret for JWT signing.
// If none is provided in process.env, generate one dynamically.
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");

/**
 * JWT Token signing structure
 */
export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Signs a new secure JWT token for a user.
 * Valid for 7 days.
 */
export function signToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verifies and decodes a given JWT token.
 * Returns decoded payload, or null if invalid.
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Advanced PBKDF2 Salt-based Password Hashing.
 * Combines PBKDF2 with 10,000 iterations, a 16-byte random salt, and SHA-512.
 */
export function secureHashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `pbkdf2:10000:${salt}:${hash}`;
}

/**
 * Validates a plaintext password against a stored hash (supports legacy SHA256 fallback).
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  // If stored hash follows PBKDF2 format
  if (storedHash.startsWith("pbkdf2:")) {
    const parts = storedHash.split(":");
    if (parts.length !== 4) return false;
    const [, iterations, salt, hash] = parts;
    const computedHash = crypto.pbkdf2Sync(
      password,
      salt,
      parseInt(iterations, 10),
      64,
      "sha512"
    ).toString("hex");
    return computedHash === hash;
  }

  // Legacy SHA256 fallback (no-salt, for existing DB migrations)
  const legacyHash = crypto.createHash("sha256").update(password).digest("hex");
  return legacyHash === storedHash;
}

/**
 * Advanced sliding-window rate limiter class for memory-efficient tracking
 */
class SlidingRateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(
    private windowMs: number,
    private maxRequests: number
  ) {}

  /**
   * Evaluates if a given key is within rate limits.
   * Cleans up aged timestamps dynamically.
   */
  public isRateLimited(key: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    
    // Filter out expired timestamps outside the sliding window
    const windowStart = now - this.windowMs;
    const activeTimestamps = timestamps.filter(t => t > windowStart);
    
    if (activeTimestamps.length >= this.maxRequests) {
      this.requests.set(key, activeTimestamps);
      return true;
    }
    
    activeTimestamps.push(now);
    this.requests.set(key, activeTimestamps);
    return false;
  }
}

// In-memory rate limiter instances for different API categories
const authLimiter = new SlidingRateLimiter(60 * 1000, 10);      // 10 login/register requests per minute
const geminiLimiter = new SlidingRateLimiter(60 * 1000, 15);    // 15 AI-generation invocations per minute
const uploadLimiter = new SlidingRateLimiter(60 * 1000, 20);    // 20 upload attempts per minute

/**
 * Express middleware to rate limit auth attempts (Login / Register / Profile updates)
 */
export const rateLimitAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "anonymous";
  if (authLimiter.isRateLimited(ip)) {
    res.status(429).json({
      error: "Too many authentication requests. Please try again after a minute."
    });
    return;
  }
  next();
};

/**
 * Express middleware to rate limit AI / Gemini requests
 */
export const rateLimitGemini = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const identifier = req.userId || (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "anonymous";
  if (geminiLimiter.isRateLimited(identifier)) {
    res.status(429).json({
      error: "AI limit reached. Please space out your AI questions to avoid API throttling."
    });
    return;
  }
  next();
};

/**
 * Input sanitization and validation utilities
 */
export const inputValidation = {
  /**
   * Sanitizes text strings to prevent HTML and Script Injection
   */
  sanitizeText: (input: string): string => {
    if (typeof input !== "string") return "";
    return input
      .trim()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  },

  /**
   * Validates email structure using robust regex matches
   */
  isValidEmail: (email: string): boolean => {
    if (!email || email.length > 254) return false;
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  },

  /**
   * Validates password complexity constraints (Min 8 chars, containing numbers or symbols)
   */
  isValidPassword: (password: string): boolean => {
    if (!password || password.length < 8) return false;
    // Basic health check: requires at least one number or special character
    const hasComplexity = /[0-9!@#$%^&*()_+\-=\[\]{};':",\\|.<>\/?]/.test(password);
    return hasComplexity;
  },

  /**
   * Validates user full name parameters
   */
  isValidName: (name: string): boolean => {
    if (!name || name.trim().length < 2 || name.length > 60) return false;
    // Disallow binary payload markers or scripts in name
    return !/[<>{}]/.test(name);
  }
};

/**
 * Validation constraints for secure file uploads
 */
export const secureFileValidation = {
  // Allowed document/text mime types for Resume Analyze
  ALLOWED_MIME_TYPES: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain"
  ],

  // Max payload file size (10 Megabytes)
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,

  /**
   * Validates document names to protect against directory traversal or execution threats
   */
  sanitizeFileName: (fileName: string): string => {
    if (!fileName) return "unnamed_document";
    // Strip parent directory notation, non-printable characters or script tags
    return fileName
      .replace(/[\/\\]/g, "") // Remove slashes
      .replace(/\.\.+/g, ".") // Block double dots traversal
      .replace(/[^a-zA-Z0-9_\-\.\s]/g, "") // Drop all strange symbols
      .trim();
  },

  /**
   * Robust validator for uploaded Resume base64 payload & details
   */
  validatePayload: (
    fileBase64: string | undefined,
    mimeType: string | undefined,
    fileName: string | undefined
  ): { isValid: boolean; error?: string } => {
    // If no document attachment, skip file validation (text analysis will apply)
    if (!fileBase64) {
      return { isValid: true };
    }

    // 1. Verify MIME type security
    if (!mimeType || !secureFileValidation.ALLOWED_MIME_TYPES.includes(mimeType)) {
      return {
        isValid: false,
        error: `Security Error: Unsupported file format [${mimeType || "unknown"}]. Only PDF, DOC, DOCX and TXT files are accepted.`
      };
    }

    // 2. Estimate original binary size from Base64 string length
    // Base64 padding adds padding chars, binary size is roughly (length * 0.75)
    const base64CleanLength = fileBase64.replace(/=+$/, "").length;
    const approximateSizeBytes = Math.floor(base64CleanLength * 0.75);

    if (approximateSizeBytes > secureFileValidation.MAX_FILE_SIZE_BYTES) {
      return {
        isValid: false,
        error: `Security Error: File is too large. Max allowed document file size is 10 MB.`
      };
    }

    // 3. Prevent executable shell headers in fileBase64 if uploaded as txt (defense-in-depth)
    if (mimeType === "text/plain") {
      try {
        const decodedText = Buffer.from(fileBase64, "base64").toString("utf-8");
        if (decodedText.startsWith("#!") || decodedText.includes("<?php") || decodedText.includes("<script>")) {
          return {
            isValid: false,
            error: "Security Check Triggered: Document content contains suspicious code expressions."
          };
        }
      } catch (e) {
        // Carry on if not a plain string representation
      }
    }

    return { isValid: true };
  }
};
