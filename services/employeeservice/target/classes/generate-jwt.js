// generate-jwt.js
const jwt = require("jsonwebtoken");

// Replace this secret with your spring boot jwt.secret
const secret = "your-secret-key-here-make-it-long-and-secure-for-production";

// Sample payload for employee
const payload = {
  employeeId: "EMP001",
  username: "John Employee",
  role: "EMPLOYEE"
};

// Token expiration: 1 day
const token = jwt.sign(payload, secret, { expiresIn: "1d" });

console.log("Generated JWT:", token);
