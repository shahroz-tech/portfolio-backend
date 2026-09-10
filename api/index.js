// Vercel serverless wrapper for Express app
const app = require("../dist/index.js").default;

module.exports = (req, res) => {
  if (!process.env.NODE_ENV) process.env.NODE_ENV = "production";
  app(req, res);
};