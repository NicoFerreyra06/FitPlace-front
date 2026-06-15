import api from './api';

export const logTraining = async (data) => {
  const response = await api.post('/entrenamientos', data);
  return response.data;
};

export const getMyTrainingHistory = async (userId, page = 0, size = 10) => {
  // Ajustando a los parámetros de paginación del Pageable de Spring Boot
  const response = await api.get(`/entrenamientos/usuario/${userId}?page=${page}&size=${size}`);
  return response.data;
};
