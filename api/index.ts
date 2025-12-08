import { Request, Response } from 'express';
import app from '../backend/src/server';
import { AppDataSource } from '../backend/src/config/database';

// Initialize database connection
const initialize = async () => {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
};

export default async function handler(req: Request, res: Response) {
    try {
        await initialize();
        app(req, res);
    } catch (error: any) {
        console.error("Critical Server Error:", error);
        res.status(500).json({
            error: "Internal Server Error",
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
}
