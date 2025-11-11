require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// Routes
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const taskRoutes = require("./routes/taskRoutes");
const timeTrackingRoutes = require("./routes/timeTrackingRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
app.use(cors());
app.use(bodyParser.json());

/* ===== CORS (must be before routes) ===== */
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000"];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`Blocked CORS request from origin: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// If you still want an explicit preflight handler, use a valid path (Express 5):
// app.options("/api/*", cors(corsOptions));

/* ===== Body parser ===== */
app.use(bodyParser.json());

/* ===== Mount routes ===== */
app.use("/api/auth", authRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/time-tracking", timeTrackingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", bookingRoutes);
app.use("/api", adminRoutes);

/* ===== Start server ===== */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Gateway running on port ${PORT}`));
// Dev identity header so backend knows "who" you are
app.use((req, res, next) => {
  if (!req.headers["x-user-id"]) req.headers["x-user-id"] = "demo-user";
  next();
});
