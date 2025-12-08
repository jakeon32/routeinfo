import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Route } from '../models/Route';

export const getAllRoutes = async (req: Request, res: Response): Promise<void> => {
    try {
        const routeRepository = AppDataSource.getRepository(Route);
        const routes = await routeRepository.find({
            order: { createdAt: 'DESC' }
        });
        res.json(routes);
    } catch (error) {
        console.error('Error fetching routes:', error);
        res.status(500).json({ message: 'Error fetching routes' });
    }
};

export const createRoute = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, groupName, description, isActive } = req.body;
        const routeRepository = AppDataSource.getRepository(Route);

        const newRoute = routeRepository.create({
            name,
            groupName,
            description,
            isActive: isActive !== undefined ? isActive : true
        });

        await routeRepository.save(newRoute);
        res.status(201).json(newRoute);
    } catch (error) {
        console.error('Error creating route:', error);
        res.status(500).json({ message: 'Error creating route' });
    }
};

export const updateRoute = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, groupName, description, isActive } = req.body;
        const routeRepository = AppDataSource.getRepository(Route);

        const route = await routeRepository.findOneBy({ routeId: Number(id) });
        if (!route) {
            res.status(404).json({ message: 'Route not found' });
            return;
        }

        route.name = name;
        route.groupName = groupName;
        route.description = description;
        if (isActive !== undefined) route.isActive = isActive;

        await routeRepository.save(route);
        res.json(route);
    } catch (error) {
        console.error('Error updating route:', error);
        res.status(500).json({ message: 'Error updating route' });
    }
};

export const deleteRoute = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const routeRepository = AppDataSource.getRepository(Route);

        const result = await routeRepository.delete(id);
        if (result.affected === 0) {
            res.status(404).json({ message: 'Route not found' });
            return;
        }

        res.json({ message: 'Route deleted successfully' });
    } catch (error) {
        console.error('Error deleting route:', error);
        res.status(500).json({ message: 'Error deleting route' });
    }
};
