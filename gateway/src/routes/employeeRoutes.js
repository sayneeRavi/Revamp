const express = require("express");

const router = express.Router();
const EMPLOYEE_SERVICE = process.env.EMPLOYEE_SERVICE || "http://localhost:8082";

// Node.js 18+ has built-in fetch, otherwise use node-fetch
const fetch = globalThis.fetch || require("node-fetch");

// Add employee details
router.post("/employee-details", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/employee/employee-details`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Add employee details error:", err);
    res.status(500).json({ message: "Gateway error", error: err.message });
  }
});

// Get all employee details
router.get("/employee-details", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/employee/employee-details`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Get employee details error:", err);
    res.status(500).json({ message: "Gateway error", error: err.message });
  }
});

// Get employee details by userId
router.get("/employee-details/:userId", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/employee/employee-details/${req.params.userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Get employee details by userId error:", err);
    res.status(500).json({ message: "Gateway error", error: err.message });
  }
});

// Delete employee details by userId
router.delete("/employee-details/:userId", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/employee/employee-details/${req.params.userId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Delete employee details error:", err);
    res.status(500).json({ message: "Gateway error", error: err.message });
  }
});

// Update employee details by userId
router.put("/employee-details/:userId", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/employee/employee-details/${req.params.userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Update employee details error:", err);
    res.status(500).json({ message: "Gateway error", error: err.message });
  }
});

// Get employee profile by employeeId
router.get("/profile/:employeeId", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/employees/profile/${req.params.employeeId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Get employee profile error:", err);
    res.status(500).json({ message: "Gateway error", error: err.message });
  }
});

// Update employee profile by employeeId
router.put("/profile/:employeeId", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/employees/profile/${req.params.employeeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Update employee profile error:", err);
    res.status(500).json({ message: "Gateway error", error: err.message });
  }
});

// Update employee availability by employeeId
router.put("/availability/:employeeId", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/employees/availability/${req.params.employeeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Update availability error:", err);
    res.status(500).json({ message: "Gateway error", error: err.message });
  }
});

// Get employee work history by employeeId
router.get("/history/:employeeId", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/employees/history/${req.params.employeeId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Get work history error:", err);
    res.status(500).json({ message: "Gateway error", error: err.message });
  }
});

module.exports = router;