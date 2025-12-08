import { Route } from './route';

export interface Schedule {
    scheduleId: number;
    routeId: number;
    startDate: string;
    endDate: string;
    scheduleType: 'REGULAR' | 'ONCE';
    daysOfWeek?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    route?: Route;
}

export interface CreateScheduleRequest {
    routeId: number;
    startDate: string;
    endDate: string;
    scheduleType: 'REGULAR' | 'ONCE';
    daysOfWeek?: string;
    isActive?: boolean;
}

export interface UpdateScheduleRequest {
    routeId?: number;
    startDate?: string;
    endDate?: string;
    scheduleType?: 'REGULAR' | 'ONCE';
    daysOfWeek?: string;
    isActive?: boolean;
}
