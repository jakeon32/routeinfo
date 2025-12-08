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
  synchronize: true, // 개발 초기 단계이므로 true로 설정 (프로덕션 배포 시 주의)
  logging: process.env.NODE_ENV === "development",
  entities: [Station, Stop, Route, RouteAttribute, RouteStop],
  migrations: [], // Vercel 환경에서 마이그레이션 파일 경로 문제 방지 위해 빈 배열로 설정 (Supabase SQL Editor 사용 권장)
  subscribers: [],
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});
