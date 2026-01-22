const cors = require("cors");

/**
 * ============================================================
 * CORS CONFIGURATION (PRODUCTION READY)
 * ============================================================
 */

// Dynamic Replit URL detection
const getReplitUrl = () => {
  // Replit provides these environment variables
  const replitUrl = process.env.REPL_SLUG 
    ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER || 'replit'}.repl.co`
    : null;
  const replitDevUrl = process.env.REPL_DEV_URL || null;
  const replitAppUrl = process.env.REPLIT_APP_URL || null;
  
  return [replitUrl, replitDevUrl, replitAppUrl].filter(Boolean);
};

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173", // Vite Dev
  "http://localhost:4173", // Vite Preview
  "http://localhost:5000", // Backend Local
  "http://127.0.0.1:5173",
  "http://127.0.0.1:4173",
  "https://souk-boudouaou.vercel.app", // Vercel Frontend
  "https://soukboudouaou.com",
  "https://www.soukboudouaou.com",
  "https://server.soukboudouaou.com",
  // Add dynamic Replit URLs
  ...getReplitUrl(),
  // Common Replit patterns (will be matched dynamically)
  /^https:\/\/.*\.replit\.dev$/,
  /^https:\/\/.*\.replit\.app$/,
  /^https:\/\/.*\.repl\.co$/,
];

// Load from environment or use defaults
let RAW_ORIGINS;
if (process.env.CORS_ORIGIN) {
  // If CORS_ORIGIN is set, split it and use those (plus Replit patterns)
  RAW_ORIGINS = [
    ...process.env.CORS_ORIGIN.split(","),
    // Always include Replit patterns even when CORS_ORIGIN is set
    /^https:\/\/.*\.replit\.dev$/,
    /^https:\/\/.*\.replit\.app$/,
    /^https:\/\/.*\.repl\.co$/,
  ];
} else {
  RAW_ORIGINS = DEFAULT_ALLOWED_ORIGINS;
}

/**
 * Normalizes origins by:
 * 1. Stripping quotes (common in .env files)
 * 2. Trimming whitespace
 * 3. Removing trailing slashes
 */
const normalizeOrigin = (origin) => {
  if (!origin) return "";
  return String(origin)
    .trim()
    .replace(/^["']|["']$/g, "") // Remove wrapping quotes
    .replace(/\/+$/, ""); // Remove trailing slashes
};

// Process origins: strings are normalized, regex patterns are kept as-is
const allowedOrigins = RAW_ORIGINS.map(origin => {
  if (origin instanceof RegExp) return origin;
  return normalizeOrigin(origin);
}).filter(Boolean);

/**
 * Validation logic for incoming Origin header
 */
const isAllowedOrigin = (origin) => {
  // Allow requests with no origin (mobile apps, Postman, server-to-server)
  if (!origin) return true;

  const normalized = normalizeOrigin(origin);
  if (!normalized) return false;

  // Check exact matches
  if (allowedOrigins.includes(normalized)) return true;

  // Check regex patterns (for Replit dynamic URLs)
  return allowedOrigins.some(allowed => {
    if (allowed instanceof RegExp) {
      return allowed.test(normalized);
    }
    return false;
  });
};

const corsOptions = {
  origin: (origin, callback) => {
    // Use our custom validation function
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
  allowedHeaders: ["*"],
  exposedHeaders: ["*"],
  optionsSuccessStatus: 204,
  maxAge: 86400,
  preflightContinue: false,
};

const corsMiddleware = cors(corsOptions);

module.exports = {
  corsMiddleware,
  corsOptions,
  allowedOrigins,
  isAllowedOrigin,
};
