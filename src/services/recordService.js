import api from './api';

export const getMyPersonalRecords = async (userId) => {
  const response = await api.get(`/records/usuario/${userId}`);
  return response.data;
};
