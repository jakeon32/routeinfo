export interface Route {
    routeId: number;
    name: string;
    groupName?: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateRouteRequest {
    name: string;
    groupName?: string;
    description?: string;
    isActive?: boolean;
}

export interface UpdateRouteRequest {
    name?: string;
    groupName?: string;
    description?: string;
    isActive?: boolean;
}
