const express = require("express");

const router = express.Router();

const EMPLOYEE_SERVICE = process.env.EMPLOYEE_SERVICE || "http://localhost:8083";

// Node.js 18+ has built-in fetch, otherwise use node-fetch
const fetch = globalThis.fetch || require("node-fetch");

// Helper function to build headers with Authorization forwarding
function buildHeaders(req) {
  const headers = {
    "Content-Type": "application/json",
  };
  
  // Forward Authorization header if present
  if (req.headers["authorization"]) {
    headers["Authorization"] = req.headers["authorization"];
  }
  
  return headers;
}

// Add employee details
router.post("/employee-details", async (req, res) => {
  try {
    console.log(`[Gateway] POST /employee-details - Request body:`, JSON.stringify(req.body, null, 2));
    console.log(`[Gateway] Calling employee service: ${EMPLOYEE_SERVICE}/api/employee/employee-details`);
    
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/employee/employee-details`, {
      method: "POST",
      headers: buildHeaders(req),
      body: JSON.stringify(req.body),
    });

    console.log(`[Gateway] Employee service response status: ${backendRes.status}`);
    
    // Get response text first to handle both success and error cases
    const responseText = await backendRes.text();
    console.log(`[Gateway] Employee service response body:`, responseText);
    
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error(`[Gateway] Failed to parse response as JSON:`, parseError);
      console.error(`[Gateway] Response text was:`, responseText);
      // If response is not valid JSON, create a proper error response
      return res.status(backendRes.status || 500).json({ 
        message: "Invalid response from employee service",
        error: responseText || "Empty response",
        status: backendRes.status
      });
    }
    
    // If backend returned an error status, ensure we have a proper error message
    if (!backendRes.ok) {
      console.error(`[Gateway] Employee service returned error:`, data);
      return res.status(backendRes.status).json({
        message: data.message || "Error saving employee details",
        error: data.error || data,
        status: backendRes.status
      });
    }
    
    console.log(`[Gateway] Employee details saved successfully:`, data);
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("[Gateway] Add employee details error:", err);
    console.error("[Gateway] Error stack:", err.stack);
    res.status(500).json({ 
      message: "Gateway error", 
      error: err.message,
      details: err.toString()
    });
  }
});

// Get all employee details
router.get("/employee-details", async (req, res) => {
  try {
    const url = `${EMPLOYEE_SERVICE}/api/employee/employee-details`;
    console.log(`[Gateway] Fetching employee details from: ${url}`);
    console.log(`[Gateway] Employee service URL: ${EMPLOYEE_SERVICE}`);
    
    const backendRes = await fetch(url, {
      method: "GET",
      headers: buildHeaders(req),
    });

    console.log(`[Gateway] Employee details response status: ${backendRes.status}`);
    
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

// Get employee details by userId
router.get("/employee-details/:userId", async (req, res) => {
  try {
    const backendRes = await fetch(`${EMPLOYEE_SERVICE}/api/employee/employee-details/${req.params.userId}`, {
      method: "GET",
      headers: buildHeaders(req),
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
      headers: buildHeaders(req),
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
      headers: buildHeaders(req),
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
      headers: buildHeaders(req),
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
      headers: buildHeaders(req),
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
      headers: buildHeaders(req),
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
      headers: buildHeaders(req),
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Get work history error:", err);
    res.status(500).json({ message: "Gateway error", error: err.message });
  }
});

module.exports = router;