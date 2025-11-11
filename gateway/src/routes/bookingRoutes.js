const express = require("express");
const router = express.Router();

// Node.js 18+ has built-in fetch, otherwise use node-fetch
const fetch = globalThis.fetch || require("node-fetch");

const BOOKING_SERVICE = process.env.BOOKING_SERVICE_URL || "http://localhost:8084";

// Forward all booking routes to booking service
router.use("/bookings", async (req, res) => {
	try {
		// req.path will be like /appointments or /{id} or /appointments/... after /bookings is matched
		// We need to forward to /api/bookings/appointments/v1 or /api/bookings/{id} or /api/bookings/appointments/v1/...
		let targetPath = req.path || "";
		// Remove leading slash if present
		if (targetPath.startsWith("/")) {
			targetPath = targetPath.substring(1);
		}
		
		// Check if this is an appointments endpoint - if so, add /v1
		let url;
		if (targetPath.startsWith("appointments")) {
			// Forward to /api/bookings/appointments/v1/...
			url = `${BOOKING_SERVICE}/api/bookings/${targetPath.replace(/^appointments/, "appointments/v1")}`;
		} else {
			// For other booking routes, forward as-is
			url = targetPath 
				? `${BOOKING_SERVICE}/api/bookings/${targetPath}`
				: `${BOOKING_SERVICE}/api/bookings`;
		}
		
		console.log(`[Gateway] Forwarding ${req.method} ${req.originalUrl} -> ${url}`);
		console.log(`[Gateway] Request body:`, JSON.stringify(req.body));

		const fetchOptions = {
			method: req.method,
			headers: {
				"Content-Type": "application/json",
			},
		};

		// Forward Authorization header if present (check both lowercase and uppercase)
		const authHeader = req.headers["authorization"] || req.headers["Authorization"];
		if (authHeader) {
			fetchOptions.headers["Authorization"] = authHeader;
			console.log(`[Gateway] Forwarding Authorization header (length: ${authHeader.length})`);
			console.log(`[Gateway] Authorization header starts with Bearer: ${authHeader.startsWith("Bearer ")}`);
			console.log(`[Gateway] Authorization header (first 50 chars): ${authHeader.substring(0, Math.min(50, authHeader.length))}...`);
		} else {
			console.log(`[Gateway] WARNING: No Authorization header in request!`);
			console.log(`[Gateway] Available headers:`, Object.keys(req.headers));
			console.log(`[Gateway] All header values:`, JSON.stringify(req.headers, null, 2));
		}

		// Only add body for methods that support it
		if (req.method !== "GET" && req.method !== "DELETE" && req.body) {
			fetchOptions.body = JSON.stringify(req.body);
		}

		let response;
		try {
			response = await fetch(url, fetchOptions);
		} catch (fetchError) {
			console.error("[Gateway] Fetch error:", fetchError);
			console.error("[Gateway] Fetch error details:", {
				name: fetchError.name,
				message: fetchError.message,
				code: fetchError.code,
				cause: fetchError.cause
			});
			throw fetchError;
		}

		console.log(`[Gateway] Booking service response status: ${response.status}`);
		
		// Get response text first to handle both success and error cases
		const responseText = await response.text();
		console.log(`[Gateway] Booking service response body:`, responseText);
		
		let data;
		try {
			data = responseText ? JSON.parse(responseText) : {};
		} catch (parseError) {
			console.error(`[Gateway] Failed to parse response as JSON:`, parseError);
			console.error(`[Gateway] Response text was:`, responseText);
			// If response is not valid JSON, create a proper error response
			if (!response.ok) {
				return res.status(response.status || 500).json({ 
					message: "Invalid response from booking service",
					error: responseText || "Empty response",
					status: response.status
				});
			}
			data = {};
		}
		
		// If backend returned an error status, ensure we have a proper error message
		if (!response.ok) {
			console.error(`[Gateway] Booking service returned error:`, data);
			return res.status(response.status).json({
				message: data.message || data.error || `HTTP ${response.status} error`,
				error: data.error || "BookingServiceError",
				status: response.status,
				details: data
			});
		}
		
		console.log(`[Gateway] Booking service request successful`);
		res.status(response.status).json(data);
	} catch (error) {
		console.error("[Gateway] Booking service error:", error);
		console.error("[Gateway] Error stack:", error.stack);
		
		// Provide more specific error messages
		let statusCode = 500;
		let errorMessage = "Internal server error";
		
		if (error.code === 'ECONNREFUSED') {
			statusCode = 503; // Service Unavailable
			errorMessage = "Booking service is currently unavailable. Please ensure the booking service is running on port 8084.";
			console.error(`[Gateway] Connection refused to booking service at ${BOOKING_SERVICE}. Is the service running?`);
		} else if (error.name === 'AbortError' || error.name === 'TimeoutError') {
			statusCode = 504; // Gateway Timeout
			errorMessage = "Booking service request timed out. The service may be overloaded or not responding.";
		} else if (error.message) {
			errorMessage = error.message;
		}
		
		res.status(statusCode).json({ 
			message: errorMessage,
			error: "BookingServiceUnavailable",
			service: "booking-service",
			serviceUrl: BOOKING_SERVICE
		});
	}
});

module.exports = router;

