/********************************************************************************
* WEB322 – Assignment 03
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Vedant Kalpit Pandit Student ID: 162915235 Date: 2025-12-02
*
********************************************************************************/

require("dotenv").config();
console.log("Loaded MONGO_URL:", process.env.MONGO_URL);
console.log("Loaded PGHOST:", process.env.PGHOST);

const express = require("express");
const session = require("client-sessions");
const path = require("path");

// Database connections
const connectMongo = require("./config/mongo");
const { sequelize, connectPostgres } = require("./config/postgres");

// Routes
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

// Middleware
const { ensureLogin } = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 8080;

// ---------------------- VIEW ENGINE ----------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ---------------------- STATIC FILES ----------------------
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// ---------------------- SESSIONS ----------------------
app.use(
  session({
    cookieName: "session",
    secret: process.env.SESSION_SECRET || "supersecret",
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
  })
);

// ---------------------- ROUTES ----------------------
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.use("/", authRoutes);
app.use("/", ensureLogin, taskRoutes);

// ---------------------- 404 PAGE ----------------------
app.use((req, res) => {
  res.status(404).render("404", { message: "Page not found" });
});

// ---------------------- STARTUP FUNCTION ----------------------
async function start() {
  try {
    console.log("Connecting to MongoDB...");
    await connectMongo();

    console.log("Connecting to PostgreSQL...");
    await connectPostgres();

    console.log("Syncing PostgreSQL models...");
    sequelize.sync({ force: true })


    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Startup error:", err);
  }
}

start();
