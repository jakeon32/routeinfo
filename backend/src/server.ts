import "reflect-metadata";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { AppDataSource } from "./config/database";
import stationRoutes from "./routes/stationRoutes";
import stopRoutes from "./routes/stopRoutes";
import uploadRoutes from "./routes/uploadRoutes";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173"
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
app.use("/api/upload", uploadRoutes);

// Initialize database connection and start server
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

export default app;
