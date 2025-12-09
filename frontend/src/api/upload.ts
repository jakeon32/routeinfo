
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000');
const UPLOAD_URL = `${API_BASE_URL}/api`;

export const uploadFile = async (file: File): Promise<{ url: string; filename: string }> => {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await axios.post(`${UPLOAD_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
