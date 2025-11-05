const express = require("express");
const fetch = global.fetch;

const router = express.Router();
const EMPLOYEE_SERVICE = process.env.EMPLOYEE_SERVICE || "http://localhost:8082";

// Time tracking endpoints
router.post("/start", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/time-tracking/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Start time tracking error:", err);
    res.status(500).json({ message: "Gateway error" });
  }
});

router.post("/stop/:timeLogId", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/time-tracking/stop/${req.params.timeLogId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Stop time tracking error:", err);
    res.status(500).json({ message: "Gateway error" });
  }
});

router.post("/pause/:timeLogId", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/time-tracking/pause/${req.params.timeLogId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Pause time tracking error:", err);
    res.status(500).json({ message: "Gateway error" });
  }
});

router.post("/resume/:timeLogId", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/time-tracking/resume/${req.params.timeLogId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Resume time tracking error:", err);
    res.status(500).json({ message: "Gateway error" });
  }
});

router.get("/employee/:employeeId", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/time-tracking/employee/${req.params.employeeId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Get employee time logs error:", err);
    res.status(500).json({ message: "Gateway error" });
  }
});

router.get("/active/:employeeId", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/time-tracking/active/${req.params.employeeId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Get active time log error:", err);
    res.status(500).json({ message: "Gateway error" });
  }
});

router.get("/task/:taskId", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/time-tracking/task/${req.params.taskId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Get task time logs error:", err);
    res.status(500).json({ message: "Gateway error" });
  }
});

module.exports = router;
