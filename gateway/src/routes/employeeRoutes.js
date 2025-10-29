const express = require("express");
const fetch = global.fetch;

const router = express.Router();
const EMPLOYEE_SERVICE = process.env.EMPLOYEE_SERVICE || "http://localhost:8082";

// Employee endpoints
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
    res.status(500).json({ message: "Gateway error" });
  }
});

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
    res.status(500).json({ message: "Gateway error" });
  }
});

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
    res.status(500).json({ message: "Gateway error" });
  }
});

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
    res.status(500).json({ message: "Gateway error" });
  }
});

module.exports = router;
