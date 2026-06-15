import api from './api';

export const getAllGimnasios = async (page = 0, size = 50) => {
  const res = await api.get(`/gimnasios?page=${page}&size=${size}`);
  return res.data;
};

export const getGimnasioById = async (id) => {
  const res = await api.get(`/gimnasios/${id}`);
  return res.data;
};

export const createSuscripcion = async (gimnasioId) => {
  const res = await api.post(`/suscripciones/${gimnasioId}`);
  return res.data;
};

export const getMiSuscripcion = async () => {
  const res = await api.get('/suscripciones/mia');
  return res.data;
};

export const cancelarSuscripcion = async (id) => {
  const res = await api.put(`/suscripciones/${id}/cancelar`);
  return res.data;
};

export const generatePagoLink = async (suscripcionId) => {
  const res = await api.post(`/pagos/${suscripcionId}`, null, { responseType: 'text' });
  // Backend returns a plain string URL
  return typeof res.data === 'string' ? res.data : res.data.toString();
};
