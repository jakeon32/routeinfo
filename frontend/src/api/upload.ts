
import axios from 'axios';

const API_Base_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const uploadFile = async (file: File): Promise<{ url: string; filename: string }> => {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await axios.post(`${API_Base_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
