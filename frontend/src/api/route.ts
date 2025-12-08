import axios from 'axios';
import type { Route, CreateRouteRequest, UpdateRouteRequest } from '../types/route';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const routeApi = axios.create({
    baseURL: `${API_BASE_URL}/routes`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getAllRoutes = async (): Promise<Route[]> => {
    const response = await routeApi.get<Route[]>('/');
    return response.data;
};

export const createRoute = async (data: CreateRouteRequest): Promise<Route> => {
    const response = await routeApi.post<Route>('/', data);
    return response.data;
};

export const updateRoute = async (id: number, data: UpdateRouteRequest): Promise<Route> => {
    const response = await routeApi.put<Route>(`/${id}`, data);
    return response.data;
};

export const deleteRoute = async (id: number): Promise<void> => {
    await routeApi.delete(`/${id}`);
};
