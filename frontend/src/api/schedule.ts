import axios from 'axios';
import type { Schedule, CreateScheduleRequest, UpdateScheduleRequest } from '../types/schedule';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const scheduleApi = axios.create({
    baseURL: `${API_BASE_URL}/schedules`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getAllSchedules = async (): Promise<Schedule[]> => {
    const response = await scheduleApi.get<Schedule[]>('/');
    return response.data;
};

export const createSchedule = async (data: CreateScheduleRequest): Promise<Schedule> => {
    const response = await scheduleApi.post<Schedule>('/', data);
    return response.data;
};

export const updateSchedule = async (id: number, data: UpdateScheduleRequest): Promise<Schedule> => {
    const response = await scheduleApi.put<Schedule>(`/${id}`, data);
    return response.data;
};

export const deleteSchedule = async (id: number): Promise<void> => {
    await scheduleApi.delete(`/${id}`);
};
