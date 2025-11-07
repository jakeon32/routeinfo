import axios from 'axios';
import type { Station, CreateStationRequest, UpdateStationRequest } from '../types/station';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// 모든 정거장 조회
export const getAllStations = async (): Promise<Station[]> => {
  const response = await axios.get(`${API_BASE_URL}/api/stations`);
  return response.data;
};

// 특정 정거장 조회
export const getStationById = async (id: number): Promise<Station> => {
  const response = await axios.get(`${API_BASE_URL}/api/stations/${id}`);
  return response.data;
};

// 정거장 생성
export const createStation = async (data: CreateStationRequest): Promise<Station> => {
  const response = await axios.post(`${API_BASE_URL}/api/stations`, data);
  return response.data;
};

// 정거장 수정
export const updateStation = async (id: number, data: UpdateStationRequest): Promise<Station> => {
  const response = await axios.put(`${API_BASE_URL}/api/stations/${id}`, data);
  return response.data;
};

// 정거장 삭제
export const deleteStation = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/api/stations/${id}`);
};
