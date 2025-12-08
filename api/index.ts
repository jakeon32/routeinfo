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
    await initialize();
    app(req, res);
}
