import "reflect-metadata";
import dotenv from "dotenv";
import path from "path";

// Load env vars before anything else
dotenv.config({ path: path.join(__dirname, "../.env") });

import express, { Express, Request, Response } from "express";
import cors from "cors";
import { AppDataSource } from "./config/database";
import stationRoutes from "./routes/stationRoutes";
import stopRoutes from "./routes/stopRoutes";
import routeRoutes from "./routes/routeRoutes";
import scheduleRoutes from "./routes/scheduleRoutes";
import uploadRoutes from "./routes/uploadRoutes";

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://routeinfo.vercel.app",
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : [])
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (업로드된 파일 서빙)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    message: "Route Info API Server is running",
    timestamp: new Date().toISOString(),
    database: AppDataSource.isInitialized ? "Connected" : "Disconnected"
  });
});

// API Routes
app.use("/api/stations", stationRoutes);
app.use("/api/stops", stopRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/upload", uploadRoutes);

// Initialize database connection and start server only if running directly
if (require.main === module) {
  AppDataSource.initialize()
    .then(() => {
      console.log("✅ Database connection established");

      app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
        console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
      });
    })
    .catch((error) => {
      console.error("❌ Database connection failed:", error);
      process.exit(1);
    });
}

export default app;
