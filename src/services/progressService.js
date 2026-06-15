import api from './api';

export const getRecordsPersonales = async (usuarioId) => {
  const res = await api.get(`/records/usuario/${usuarioId}`);
  return res.data;
};

export const getHistorialEntrenamientos = async (usuarioId, page = 0, size = 10) => {
  const res = await api.get(`/entrenamientos/usuario/${usuarioId}?page=${page}&size=${size}`);
  return res.data;
};

export const getEvolucionEjercicio = async (usuarioId, ejercicioId) => {
  const res = await api.get(`/entrenamientos/usuario/${usuarioId}/ejercicio/${ejercicioId}`);
  return res.data;
};
