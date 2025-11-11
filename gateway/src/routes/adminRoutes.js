const express = require("express");
const router = express.Router();

// Node.js 18+ has built-in fetch, otherwise use node-fetch
const fetch = globalThis.fetch || require("node-fetch");

const ADMIN_SERVICE = process.env.ADMIN_SERVICE_URL || "http://localhost:8085";

// Forward all admin routes to admin service
router.use("/admin", async (req, res) => {
	try {
		// req.path is like /modification-services/... after /admin is matched
		// We need to reconstruct: /api/admin/modification-services/...
		const url = `${ADMIN_SERVICE}/api/admin${req.path}`;
		console.log(`[Gateway] Forwarding ${req.method} ${url}`);
		console.log(`[Gateway] Request body:`, JSON.stringify(req.body));

		const fetchOptions = {
			method: req.method,
			headers: {
				"Content-Type": "application/json",
			},
		};

		// Forward Authorization header if present
		if (req.headers["authorization"]) {
			fetchOptions.headers["Authorization"] = req.headers["authorization"];
		}

		// Only add body for methods that support it
		if (req.method !== "GET" && req.method !== "DELETE" && req.body) {
			fetchOptions.body = JSON.stringify(req.body);
		}

		const response = await fetch(url, fetchOptions);

		if (!response.ok) {
			console.error(`[Gateway] Admin service returned error: ${response.status} ${response.statusText}`);
		}

		const data = await response.json().catch(() => {
			console.error("[Gateway] Failed to parse response as JSON");
			return { error: "Invalid response from admin service" };
		});
		
		res.status(response.status).json(data);
	} catch (error) {
		console.error("[Gateway] Admin service error:", error);
		console.error("[Gateway] Error stack:", error.stack);
		res.status(500).json({ message: "Gateway error: " + error.message });
	}
});

module.exports = router;


