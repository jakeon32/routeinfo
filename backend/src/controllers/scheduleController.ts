import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Schedule } from '../models/Schedule';
import { Route } from '../models/Route';

export const getAllSchedules = async (req: Request, res: Response): Promise<void> => {
    try {
        const scheduleRepository = AppDataSource.getRepository(Schedule);
        const schedules = await scheduleRepository.find({
            relations: ['route'],
            order: { createdAt: 'DESC' }
        });
        res.json(schedules);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ message: 'Error fetching schedules' });
    }
};

export const createSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
        const { routeId, startDate, endDate, scheduleType, daysOfWeek, isActive } = req.body;
        const scheduleRepository = AppDataSource.getRepository(Schedule);

        const newSchedule = scheduleRepository.create({
            routeId,
            startDate,
            endDate,
            scheduleType,
            daysOfWeek,
            isActive: isActive !== undefined ? isActive : true
        });

        await scheduleRepository.save(newSchedule);
        res.status(201).json(newSchedule);
    } catch (error) {
        console.error('Error creating schedule:', error);
        res.status(500).json({ message: 'Error creating schedule' });
    }
};

export const updateSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { routeId, startDate, endDate, scheduleType, daysOfWeek, isActive } = req.body;
        const scheduleRepository = AppDataSource.getRepository(Schedule);

        const schedule = await scheduleRepository.findOneBy({ scheduleId: Number(id) });
        if (!schedule) {
            res.status(404).json({ message: 'Schedule not found' });
            return;
        }

        if (routeId) schedule.routeId = routeId;
        schedule.startDate = startDate;
        schedule.endDate = endDate;
        schedule.scheduleType = scheduleType;
        schedule.daysOfWeek = daysOfWeek;
        if (isActive !== undefined) schedule.isActive = isActive;

        await scheduleRepository.save(schedule);
        res.json(schedule);
    } catch (error) {
        console.error('Error updating schedule:', error);
        res.status(500).json({ message: 'Error updating schedule' });
    }
};

export const deleteSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const scheduleRepository = AppDataSource.getRepository(Schedule);

        const result = await scheduleRepository.delete(id);
        if (result.affected === 0) {
            res.status(404).json({ message: 'Schedule not found' });
            return;
        }

        res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        res.status(500).json({ message: 'Error deleting schedule' });
    }
};
