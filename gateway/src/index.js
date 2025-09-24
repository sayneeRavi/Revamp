/*const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const AUTH_SERVICE = "http://localhost:8081";

// Register endpoint
app.post("/api/auth/register", async (req, res) => {
  try {
    const backendRes = await fetch(`${AUTH_SERVICE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gateway error" });
  }
});

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const backendRes = await fetch(`${AUTH_SERVICE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gateway error" });
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log("🚀 Gateway running on port", PORT));
*/

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// Import routes
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Gateway running on port ${PORT}`));
