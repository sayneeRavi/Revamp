const express = require("express");
const fetch = global.fetch;

const router = express.Router();
const EMPLOYEE_SERVICE = process.env.EMPLOYEE_SERVICE || "http://localhost:8083";

// Task endpoints
router.get("/employee/:employeeId", async (req, res) => {
  try {
    let backendRes;
    try {
      backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/tasks/employee/${req.params.employeeId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
    } catch (fetchError) {
      console.error("[Gateway] Fetch error connecting to employee service:", fetchError);
      if (fetchError.code === 'ECONNREFUSED' || fetchError.message?.includes('ECONNREFUSED') || fetchError.message?.includes('fetch failed')) {
        return res.status(503).json({
          message: "Employee service is currently unavailable. Please ensure the employee service is running on port 8083.",
          error: "EmployeeServiceUnavailable",
          service: "employee-service",
          serviceUrl: EMPLOYEE_SERVICE,
          details: "The employee service could not be reached. Please check if the service is running.",
          employeeId: req.params.employeeId
        });
      }
      return res.status(503).json({
        message: `Failed to connect to employee service: ${fetchError.message || 'Unknown error'}`,
        error: "EmployeeServiceConnectionError",
        service: "employee-service",
        serviceUrl: EMPLOYEE_SERVICE,
        details: fetchError.message
      });
    }

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("[Gateway] Get employee tasks error:", err);
    res.status(500).json({ 
      message: "Gateway error",
      error: err.message,
      employeeId: req.params.employeeId
    });
  }
});

router.get("/employee/:employeeId/status/:status", async (req, res) => {
  try {
    let backendRes;
    try {
      backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/tasks/employee/${req.params.employeeId}/status/${req.params.status}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
    } catch (fetchError) {
      console.error("[Gateway] Fetch error connecting to employee service:", fetchError);
      if (fetchError.code === 'ECONNREFUSED' || fetchError.message?.includes('ECONNREFUSED') || fetchError.message?.includes('fetch failed')) {
        return res.status(503).json({
          message: "Employee service is currently unavailable. Please ensure the employee service is running on port 8083.",
          error: "EmployeeServiceUnavailable",
          service: "employee-service",
          serviceUrl: EMPLOYEE_SERVICE
        });
      }
      return res.status(503).json({
        message: `Failed to connect to employee service: ${fetchError.message || 'Unknown error'}`,
        error: "EmployeeServiceConnectionError",
        service: "employee-service",
        serviceUrl: EMPLOYEE_SERVICE
      });
    }

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("[Gateway] Get tasks by status error:", err);
    res.status(500).json({ message: "Gateway error", error: err.message });
  }
});

router.get("/:taskId/employee/:employeeId", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/tasks/${req.params.taskId}/employee/${req.params.employeeId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Get task by ID error:", err);
    res.status(500).json({ message: "Gateway error" });
  }
});

router.post("/:taskId/accept", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/tasks/${req.params.taskId}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Accept task error:", err);
    res.status(500).json({ message: "Gateway error" });
  }
});

router.post("/:taskId/reject", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/tasks/${req.params.taskId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Reject task error:", err);
    res.status(500).json({ message: "Gateway error" });
  }
});

router.post("/:taskId/start", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/tasks/${req.params.taskId}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Start task error:", err);
    res.status(500).json({ message: "Gateway error" });
  }
});

router.post("/:taskId/complete", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/tasks/${req.params.taskId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Complete task error:", err);
    res.status(500).json({ message: "Gateway error" });
  }
});

router.post("/:taskId/deliver", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/tasks/${req.params.taskId}/deliver`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Deliver task error:", err);
    res.status(500).json({ message: "Gateway error" });
  }
});

module.exports = router;
