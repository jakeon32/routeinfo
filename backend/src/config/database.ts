import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Station } from "../models/Station";
import { Stop } from "../models/Stop";
import { Route } from "../models/Route";
import { RouteAttribute } from "../models/RouteAttribute";
import { RouteStop } from "../models/RouteStop";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: process.env.NODE_ENV !== "production", // 프로덕션에서는 false (SQL로 스키마 관리)
  logging: process.env.NODE_ENV === "development",
  entities: [Station, Stop, Route, RouteAttribute, RouteStop],
  migrations: [],
  subscribers: [],
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});
