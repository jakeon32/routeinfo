export interface Station {
  stationId: number;
  name: string;
  primaryStopId: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stops?: Stop[];
  primaryStop?: Stop | null;
}

export interface Stop {
  stopId: number;
  stationId: number;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  description?: string;
  photoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  station?: Station;
}

export interface CreateStationRequest {
  name: string;
  primaryStopId?: number;
}

export interface UpdateStationRequest {
  name?: string;
  primaryStopId?: number;
  isActive?: boolean;
}

export interface CreateStopRequest {
  stationId: number;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  description?: string;
  photoUrl?: string;
}

export interface UpdateStopRequest {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  photoUrl?: string;
  isActive?: boolean;
}
