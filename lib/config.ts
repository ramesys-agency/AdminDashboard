/**
 * Centralized Configuration
 * 
 * Retrieve all environment variables from this file to ensure type-safety
 * and single-source-of-truth validation instead of scattering process.env
 * calls throughout the codebase.
 */

export const config = {
  databaseUrl: process.env.DATABASE_URL || "",
  authSecret: process.env.AUTH_SECRET || "fallback_secret", // Add a strong fallback for local dev if missing
  nodeEnv: process.env.NODE_ENV || "development",
};

// You can optionally add run-time validation logic here to immediately 
// throw an error at startup if a critical variable is missing:
if (!process.env.AUTH_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("CRITICAL: AUTH_SECRET environment variable is missing.");
}
