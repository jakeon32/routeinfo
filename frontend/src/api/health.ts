import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
  database: string;
}

export const checkHealth = async (): Promise<HealthResponse> => {
  const response = await axios.get(`${API_BASE_URL}/api/health`);
  return response.data;
};
