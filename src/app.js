const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const config = require("./config");
const routes = require("./routes");
const { errorHandler } = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const swaggerSpec = require("./config/swagger");

const app = express();

app.use(helmet());
// Explicit CORS policy for browser clients.
// Configure via env var: CORS_ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000" or "*".
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "*")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (no Origin header).
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes("*")) return callback(null, true);
    return callback(null, allowedOrigins.includes(origin));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (req, res) => {
  res.json(swaggerSpec);
});
app.get("/health", healthHandler);
app.get("/health/ready", readinessHandler);
app.use("/api", routes);
app.use(errorHandler);

function healthHandler(req, res) {
  res
    .status(200)
    .json({
      status: "UP",
      service: "booking-service",
      timestamp: new Date().toISOString(),
    });
}

async function readinessHandler(req, res) {
  const { pool } = require("./models/db");
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    res.status(200).json({ status: "UP", database: "connected" });
  } catch (err) {
    res
      .status(503)
      .json({ status: "DOWN", database: "disconnected", error: err.message });
  }
}

app.listen(config.port, () => {
  logger.info("Server listening", {
    port: config.port,
    nodeEnv: config.nodeEnv,
  });
});

module.exports = app;
