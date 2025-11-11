// gateway/src/routes/customerRoutes.js
const express = require("express");
const proxy = require("express-http-proxy");
const jwt = require("jsonwebtoken");

const router = express.Router();
const target = process.env.CUSTOMER_SERVICE || "http://localhost:8082";

/**
 * Extract user id (sub) from a verified JWT.
 * Only for logging / internal tracing.
 */
function extractUserIdFromJwt(authHeader) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const decoded = jwt.decode(authHeader.substring(7));
    return decoded?.sub || decoded?.userId || decoded?.id || null;
  } catch {
    return null;
  }
}

const customerProxy = proxy(target, {
  proxyReqPathResolver: (req) => `/api${req.url}`,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    // Forward original Authorization header (JWT)
    const auth = srcReq.headers["authorization"];
    if (auth) proxyReqOpts.headers["authorization"] = auth;

    // 🔒 Strip any user header coming from the client
    delete proxyReqOpts.headers["x-user-id"];

    // Inject user id for tracing (not for auth decisions)
    const uid = extractUserIdFromJwt(auth);
    if (uid) proxyReqOpts.headers["x-user-id"] = uid;

    proxyReqOpts.headers["content-type"] =
      srcReq.headers["content-type"] || "application/json";

    console.debug(`[GW→CS] ${srcReq.method} ${srcReq.url}  user=${uid || "?"}`);
    return proxyReqOpts;
  },
});

router.use("/", customerProxy);
module.exports = router;
