const express = require("express");
const fetch = global.fetch;

const router = express.Router();
const AUTH_SERVICE = process.env.AUTH_SERVICE || "http://localhost:8081";

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    const backendRes = await fetch(`${AUTH_SERVICE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Gateway error" });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const backendRes = await fetch(`${AUTH_SERVICE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Gateway error" });
  }
});

module.exports = router;
