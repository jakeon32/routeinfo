import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface UploadResponse {
  message: string;
  url: string;
  filename: string;
  originalname: string;
  size: number;
}

// 파일 업로드
export const uploadPhoto = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await axios.post<UploadResponse>(`${API_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

// 파일 삭제
export const deletePhoto = async (filename: string): Promise<void> => {
  await axios.delete(`${API_URL}/upload/${filename}`);
};

// 파일 URL 생성
export const getPhotoUrl = (url: string): string => {
  if (url.startsWith('http')) {
    return url;
  }
  return `http://localhost:3000${url}`;
};
