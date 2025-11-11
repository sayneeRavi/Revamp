const express = require("express");

const router = express.Router();
const AUTH_SERVICE = process.env.AUTH_SERVICE || "http://localhost:8081";
const EMPLOYEE_SERVICE = process.env.EMPLOYEE_SERVICE || "http://localhost:8083";

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

    // Check if response is JSON
    const contentType = backendRes.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await backendRes.text();
      console.error("Non-JSON response from auth service:", text);
      return res.status(500).json({ 
        message: "Invalid response from auth service",
        error: "Server returned non-JSON response"
      });
    }

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

// ============================
// GOOGLE LOGIN
// ============================
router.post("/google", async (req, res) => {
  try {
    const backendRes = await fetch(`${AUTH_SERVICE}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body), // includes { token: idToken }
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Google login error:", err);
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
    console.log(`[Gateway] Fetching employees from: ${AUTH_SERVICE}/api/auth/employees`);
    const backendRes = await fetch(`${AUTH_SERVICE}/api/auth/employees`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).catch(fetchError => {
      console.error("[Gateway] Network error connecting to auth service:", fetchError);
      throw new Error(`Cannot connect to auth service at ${AUTH_SERVICE}. Make sure the service is running.`);
    });

    if (!backendRes) {
      throw new Error("No response from auth service");
    }

    // Check if response is JSON
    const contentType = backendRes.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await backendRes.text();
      console.error("[Gateway] Non-JSON response from auth service:", text);
      return res.status(500).json({ 
        message: "Invalid response from auth service",
        error: "Server returned non-JSON response",
        details: text
      });
    }

    if (!backendRes.ok) {
      const errorText = await backendRes.text();
      console.error(`[Gateway] Auth service error response (${backendRes.status}):`, errorText);
      try {
        const errorData = JSON.parse(errorText);
        return res.status(backendRes.status).json(errorData);
      } catch (e) {
        return res.status(backendRes.status).json({ 
          message: "Error fetching employees", 
          error: errorText 
        });
      }
    }

    const data = await backendRes.json();
    console.log(`[Gateway] Employees fetched successfully. Count: ${Array.isArray(data) ? data.length : 'N/A'}`);
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("[Gateway] Get employees error:", err);
    console.error("[Gateway] Error stack:", err.stack);
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

// Get employee details (forwards to employee service)
router.get("/employee-details", async (req, res) => {
  try {
    console.log(`[Gateway] Fetching employee details from: ${EMPLOYEE_SERVICE}/api/employee/employee-details`);
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/employee/employee-details`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).catch(fetchError => {
      console.error("[Gateway] Network error connecting to employee service:", fetchError);
      throw new Error(`Cannot connect to employee service at ${EMPLOYEE_SERVICE}. Make sure the service is running.`);
    });

    if (!backendRes) {
      throw new Error("No response from employee service");
    }

    if (!backendRes.ok) {
      const errorText = await backendRes.text();
      console.error(`[Gateway] Employee service error response: ${errorText}`);
      return res.status(backendRes.status).json({ 
        message: "Error fetching employee details", 
        error: errorText 
      });
    }

    const data = await backendRes.json();
    console.log(`[Gateway] Employee details fetched successfully. Count: ${Array.isArray(data) ? data.length : 'N/A'}`);
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("[Gateway] Get employee details error:", err);
    console.error("[Gateway] Error stack:", err.stack);
    res.status(500).json({ message: "Gateway error", error: err.message });
  }
});

module.exports = router;