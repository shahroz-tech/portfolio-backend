// Vercel serverless wrapper for Express app
// All incoming requests are routed here via vercel.json rewrites

const app = require("../dist/index.js").default;

/**
 * Vercel serverless function entry point.
 * Delegates HTTP requests to the compiled Express app (dist/index.js).
 *
 * Notes:
 * - The app listens on the callback (req/res) directly — no PORT binding.
 * - MongoDB connection is lazy-init'd by the ensureDB middleware in index.ts.
 * - `storage/**` files (resume PDF) are explicitly included via includeFiles.
 */
module.exports = (req, res) => {
  if (!process.env.NODE_ENV) process.env.NODE_ENV = "production";
  app(req, res);
};