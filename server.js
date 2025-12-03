/********************************************************************************
* WEB322 – Assignment 03
* 
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Vedant Kalpit Pandit  Student ID: 162915235  Date: 2025-12-02
********************************************************************************/

require("dotenv").config();
require("pg"); // IMPORTANT: ensures Vercel bundles pg for Sequelize

const express = require("express");
const session = require("client-sessions");
const path = require("path");

// Database connections
const connectMongo = require("./config/mongo");
const { sequelize, connectPostgres } = require("./config/postgres");

// Middleware & Routes
const { ensureLogin } = require("./middleware/authMiddleware");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

/* -----------------------------------------------------------
   VIEW ENGINE
----------------------------------------------------------- */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* -----------------------------------------------------------
   STATIC FILES & BODY PARSER
----------------------------------------------------------- */
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

/* -----------------------------------------------------------
   SESSION CONFIG
----------------------------------------------------------- */
app.use(
  session({
    cookieName: "session",
    secret: process.env.SESSION_SECRET || "supersecret",
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
  })
);

/* -----------------------------------------------------------
   LAZY DATABASE CONNECT (VERCEL FRIENDLY)
----------------------------------------------------------- */
let dbConnected = false;

async function ensureDatabases() {
  if (dbConnected) return;

  console.log("🔄 Initializing database connections...");

  try {
    await connectMongo();          // MongoDB (Atlas)
    await connectPostgres();       // Sequelize Postgres
    await sequelize.sync();        // Sync models

    console.log("✅ All databases connected successfully.");
    dbConnected = true;
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
}

// Ensure DB connection BEFORE processing any request
app.use(async (req, res, next) => {
  await ensureDatabases();
  next();
});

/* -----------------------------------------------------------
   ROUTES
----------------------------------------------------------- */
app.get("/", (req, res) => res.redirect("/login"));

app.use("/", authRoutes);
app.use("/", ensureLogin, taskRoutes);

/* -----------------------------------------------------------
   404 PAGE
----------------------------------------------------------- */
app.use((req, res) => {
  res.status(404).render("404", { message: "Page not found" });
});

/* -----------------------------------------------------------
   EXPORT FOR VERCEL (NO PORT LISTEN HERE)
----------------------------------------------------------- */
module.exports = app;
