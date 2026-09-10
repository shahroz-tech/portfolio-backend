import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import Project from "../models/Project";

/**
 * Seeds the five projects listed on Muhammad Shahroz Shahzad's resume.
 * No GitHub/live URLs are set because none are listed on the resume —
 * the frontend hides those buttons when a URL is not present.
 */
const projects = [
  {
    title: "E-Commerce Shop Module",
    slug: "ecommerce-shop-module",
    description:
      "Built a Laravel backend and React.js frontend, including an admin dashboard and Stripe-based online payment processing.",
    technologies: ["Laravel", "React.js", "Stripe"],
    category: "Full Stack",
    featured: true,
    published: true,
    order: 1,
  },
  {
    title: "API-Based Systems",
    slug: "api-based-systems",
    description:
      "Designed an API-only multi-tenant system and e-learning platform APIs, with Blade-based admin dashboards.",
    technologies: ["Laravel", "RESTful APIs", "Blade"],
    category: "Backend / API",
    featured: false,
    published: true,
    order: 2,
  },
  {
    title: "Greetings Chat Application",
    slug: "greetings-chat-application",
    description:
      "Built a real-time messaging application with live notifications using Socket.io and Pusher.",
    technologies: ["Laravel", "Socket.io", "Pusher"],
    category: "Real-time",
    featured: false,
    published: true,
    order: 3,
  },
  {
    title: "PakLabor",
    slug: "paklabor",
    description:
      "Developed a full-stack MERN application connecting non-technical construction workers with job opportunities, including NLP-based worker profile ranking and RESTful APIs backed by MongoDB. Final Year Project.",
    technologies: ["React.js", "Node.js", "Express.js", "MongoDB"],
    category: "Final Year Project",
    featured: true,
    published: true,
    order: 4,
  },
  {
    title: "Market Management System",
    slug: "market-management-system",
    description:
      "Built a web-based management system with CRUD operations, billing and invoice printing, and database-driven reporting.",
    technologies: ["ASP.NET", "C#"],
    category: "Desktop / Web",
    featured: false,
    published: true,
    order: 5,
  },
];

const run = async () => {
  await connectDB();

  for (const p of projects) {
    await Project.findOneAndUpdate({ slug: p.slug }, p, { upsert: true, new: true });
    console.log(`Upserted project: ${p.title}`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
