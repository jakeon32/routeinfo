import axios from 'axios';
import type { Stop, CreateStopRequest, UpdateStopRequest } from '../types/station';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// 모든 승하차장 조회 (옵션: 특정 정거장 필터링)
export const getAllStops = async (stationId?: number): Promise<Stop[]> => {
  const params = stationId ? { stationId } : {};
  const response = await axios.get(`${API_BASE_URL}/api/stops`, { params });
  return response.data;
};

// 특정 승하차장 조회
export const getStopById = async (id: number): Promise<Stop> => {
  const response = await axios.get(`${API_BASE_URL}/api/stops/${id}`);
  return response.data;
};

// 승하차장 생성
export const createStop = async (data: CreateStopRequest): Promise<Stop> => {
  const response = await axios.post(`${API_BASE_URL}/api/stops`, data);
  return response.data;
};

// 승하차장 수정
export const updateStop = async (id: number, data: UpdateStopRequest): Promise<Stop> => {
  const response = await axios.put(`${API_BASE_URL}/api/stops/${id}`, data);
  return response.data;
};

// 승하차장 삭제
export const deleteStop = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/api/stops/${id}`);
};
