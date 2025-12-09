import { Request, Response } from 'express';

// Initialize database connection
let isInitialized = false;

export default async function handler(req: Request, res: Response) {
    try {
        // Dynamic import to catch initialization errors (e.g., Env Var missing in Supabase config)
        const { default: app } = await import('../backend/src/server');
        const { AppDataSource } = await import('../backend/src/config/database');

        if (!isInitialized) {
            await AppDataSource.initialize();
            isInitialized = true;
        }

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
