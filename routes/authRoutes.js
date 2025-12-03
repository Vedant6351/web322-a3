const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// -------------------- REGISTER (GET) --------------------
router.get("/register", (req, res) => {
  res.render("auth/register", { error: null });
});

// -------------------- REGISTER (POST) --------------------
router.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  try {
    if (!username || !email || !password || !confirmPassword) {
      return res.render("auth/register", { error: "All fields are required." });
    }

    if (password !== confirmPassword) {
      return res.render("auth/register", { error: "Passwords do not match." });
    }

    // Check for existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.render("auth/register", { error: "Email already registered." });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashed,
    });

    res.redirect("/login");

  } catch (err) {
    console.error(err);
    res.render("auth/register", { error: "Registration failed. Try again." });
  }
});

// -------------------- LOGIN (GET) --------------------
router.get("/login", (req, res) => {
  res.render("auth/login", { error: null });
});

// -------------------- LOGIN (POST) --------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("auth/login", { error: "Invalid credentials." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render("auth/login", { error: "Invalid credentials." });
    }

    req.session.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    };

    res.redirect("/dashboard");

  } catch (err) {
    console.error(err);
    res.render("auth/login", { error: "Login failed. Try again." });
  }
});

// -------------------- LOGOUT --------------------
router.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/login");
});

module.exports = router;
