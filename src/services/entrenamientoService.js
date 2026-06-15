import api from './api';

export const registrarEntrenamiento = async (data) => {
  const res = await api.post('/entrenamientos', data);
  return res.data;
};

export const getEntrenamientos = async (userId, page = 0, desde, hasta) => {
  let url = `/entrenamientos/usuario/${userId}?page=${page}&size=10`;
  if (desde) url += `&desde=${desde}`;
  if (hasta) url += `&hasta=${hasta}`;
  const res = await api.get(url);
  return res.data;
};

export const getHistorialEjercicio = async (userId, ejercicioId) => {
  const res = await api.get(`/entrenamientos/usuario/${userId}/ejercicio/${ejercicioId}`);
  return res.data;
};

export const getRecordsPersonales = async (userId) => {
  const res = await api.get(`/records/usuario/${userId}`);
  return res.data;
};

export const getRanking = async (ejercicioId, page = 0) => {
  const res = await api.get(`/records/ranking/${ejercicioId}?page=${page}&size=10`);
  return res.data;
};
