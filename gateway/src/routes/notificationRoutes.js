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

// Employee notification endpoints
router.get("/employee/:employeeId", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/notifications/employee/${req.params.employeeId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!backendRes.ok) {
      return res.status(backendRes.status).json({ message: "Failed to fetch notifications" });
    }

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Get employee notifications error:", err);
    if (err.code === 'ECONNREFUSED' || err.message?.includes('fetch failed')) {
      return res.status(503).json({ message: "Employee service unavailable" });
    }
    res.status(500).json({ message: "Gateway error" });
  }
});

router.get("/employee/:employeeId/unread", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/notifications/employee/${req.params.employeeId}/unread`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!backendRes.ok) {
      return res.status(backendRes.status).json({ message: "Failed to fetch unread notifications" });
    }

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Get unread employee notifications error:", err);
    if (err.code === 'ECONNREFUSED' || err.message?.includes('fetch failed')) {
      return res.status(503).json({ message: "Employee service unavailable" });
    }
    res.status(500).json({ message: "Gateway error" });
  }
});

// Customer notification endpoints
router.get("/customer/:customerId", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/notifications/customer/${req.params.customerId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!backendRes.ok) {
      return res.status(backendRes.status).json({ message: "Failed to fetch customer notifications" });
    }

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Get customer notifications error:", err);
    if (err.code === 'ECONNREFUSED' || err.message?.includes('fetch failed')) {
      return res.status(503).json({ message: "Employee service unavailable" });
    }
    res.status(500).json({ message: "Gateway error" });
  }
});

router.get("/customer/:customerId/unread", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/notifications/customer/${req.params.customerId}/unread`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!backendRes.ok) {
      return res.status(backendRes.status).json({ message: "Failed to fetch unread customer notifications" });
    }

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Get unread customer notifications error:", err);
    if (err.code === 'ECONNREFUSED' || err.message?.includes('fetch failed')) {
      return res.status(503).json({ message: "Employee service unavailable" });
    }
    res.status(500).json({ message: "Gateway error" });
  }
});

module.exports = router;
