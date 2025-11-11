const express = require("express");
const fetch = global.fetch;

const router = express.Router();
const EMPLOYEE_SERVICE = process.env.EMPLOYEE_SERVICE || "http://localhost:8083";

// Notification endpoints
router.post("/admin", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/notifications/admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Send admin notification error:", err);
    res.status(500).json({ message: "Gateway error" });
  }
});

router.get("/admin/:adminId", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/notifications/admin/${req.params.adminId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Get admin notifications error:", err);
    res.status(500).json({ message: "Gateway error" });
  }
});

router.get("/admin/:adminId/unread", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/notifications/admin/${req.params.adminId}/unread`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Get unread notifications error:", err);
    res.status(500).json({ message: "Gateway error" });
  }
});

router.put("/:notificationId/read", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/notifications/${req.params.notificationId}/read`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Mark notification as read error:", err);
    res.status(500).json({ message: "Gateway error" });
  }
});

module.exports = router;
