const express = require("express");

const router = express.Router();
const AUTH_SERVICE = process.env.AUTH_SERVICE || "http://localhost:8081";

// Node.js 18+ has built-in fetch, otherwise use node-fetch
const fetch = globalThis.fetch || require("node-fetch");

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
    res.status(500).json({ message: "Gateway error", error: err.message });
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
    res.status(500).json({ message: "Gateway error", error: err.message });
  }
});

// Admin endpoint to register employees
router.post("/register-employee", async (req, res) => {
  try {
    console.log("Register employee request received:", req.body);
    console.log("Calling AUTH_SERVICE:", AUTH_SERVICE);
    
    if (!AUTH_SERVICE) {
      throw new Error("AUTH_SERVICE environment variable is not set");
    }

    const backendRes = await fetch(`${AUTH_SERVICE}/api/auth/register-employee`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    }).catch(fetchError => {
      console.error("Network error connecting to auth service:", fetchError);
      throw new Error(`Cannot connect to auth service at ${AUTH_SERVICE}. Make sure the service is running.`);
    });

    if (!backendRes) {
      throw new Error("No response from auth service");
    }

    const data = await backendRes.json().catch(parseError => {
      console.error("Failed to parse response:", parseError);
      throw new Error("Invalid response from auth service");
    });

    console.log("Auth service response status:", backendRes.status);
    console.log("Auth service response data:", data);
    
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Register employee error:", err);
    console.error("Error details:", err.message);
    res.status(500).json({ 
      message: "Gateway error: " + err.message,
      error: err.message 
    });
  }
});

// Get all employees
router.get("/employees", async (req, res) => {
  try {
    const backendRes = await fetch(`${AUTH_SERVICE}/api/auth/employees`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Get employees error:", err);
    res.status(500).json({ message: "Gateway error", error: err.message });
  }
});

// Delete employee (deletes User only, employee details handled by employeeservice)
router.delete("/employees/:userId", async (req, res) => {
  try {
    const backendRes = await fetch(`${AUTH_SERVICE}/api/auth/employees/${req.params.userId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Delete employee error:", err);
    res.status(500).json({ message: "Gateway error", error: err.message });
  }
});

// Update employee (User)
router.put("/employees/:userId", async (req, res) => {
  try {
    const backendRes = await fetch(`${AUTH_SERVICE}/api/auth/employees/${req.params.userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Update employee error:", err);
    res.status(500).json({ message: "Gateway error", error: err.message });
  }
});

module.exports = router;