import api from './api';

export const getAllEjercicios = async () => {
  const res = await api.get('/ejercicios?page=0&size=100');
  const data = res.data;
  return data.content || data || [];
};

export const getEjercicioById = async (id) => {
  const res = await api.get(`/ejercicios/${id}`);
  return res.data;
};

export const getEjerciciosByMusculo = async (musculoId) => {
  const res = await api.get(`/ejercicios/porMusculo/${musculoId}`);
  return res.data;
};

export const buscarEjercicios = async (nombre) => {
  const res = await api.get(`/ejercicios/buscar?nombre=${encodeURIComponent(nombre)}`);
  return res.data;
};

export const getAllMusculos = async () => {
  const res = await api.get('/musculos?page=0&size=100');
  const data = res.data;
  return data.content || data || [];
};

// Admin Methods
export const createEjercicio = async (data) => {
  const res = await api.post('/ejercicios', data);
  return res.data;
};

export const updateEjercicio = async (id, data) => {
  const res = await api.put(`/ejercicios/${id}`, data);
  return res.data;
};

export const deleteEjercicio = async (id) => {
  const res = await api.delete(`/ejercicios/${id}`);
  return res.data;
};

export const createMusculo = async (data) => {
  const res = await api.post('/musculos', data);
  return res.data;
};

export const updateMusculo = async (id, data) => {
  const res = await api.put(`/musculos/${id}`, data);
  return res.data;
};

export const deleteMusculo = async (id) => {
  const res = await api.delete(`/musculos/${id}`);
  return res.data;
};
