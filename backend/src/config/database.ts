import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Station } from "../models/Station";
import { Stop } from "../models/Stop";
import { Route } from "../models/Route";
import { RouteAttribute } from "../models/RouteAttribute";
import { RouteStop } from "../models/RouteStop";

import path from "path";
dotenv.config({ path: path.join(__dirname, "../../.env") });

const dbConfig: any = {
  type: "postgres",
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV === "development",
  entities: [Station, Stop, Route, RouteAttribute, RouteStop],
  migrations: [],
  subscribers: [],
  ssl: { rejectUnauthorized: false },
};

if (process.env.DATABASE_URL) {
  // Supabase 호환성을 위해 DATABASE_URL 파싱 후 포트 강제 조정 (TypeORM + Transaction Pooler 이슈 방지)
  let connectionUrl = process.env.DATABASE_URL;
  if (connectionUrl.includes(":6543")) {
    console.log("Detected Transaction Pooler port (6543). Switching to Session Pooler (5432)...");
    connectionUrl = connectionUrl.replace(":6543", ":5432");
  }

  console.log("Connecting to DB (Masked):", connectionUrl.replace(/:[^:@]*@/, ":****@"));
  Object.assign(dbConfig, { url: connectionUrl });
} else {
  console.log("Using individual DB env vars");
  Object.assign(dbConfig, {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });
}

export const AppDataSource = new DataSource(dbConfig);
