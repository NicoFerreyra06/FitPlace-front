import api from './api';

let ejerciciosCache = null;

export const getAllEjercicios = async (forceRefresh = false) => {
  if (ejerciciosCache && !forceRefresh) return ejerciciosCache;
  const res = await api.get('/ejercicios?page=0&size=100');
  const data = res.data;
  ejerciciosCache = data.content || data || [];
  return ejerciciosCache;
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

let musculosCache = null;

export const getAllMusculos = async (forceRefresh = false) => {
  if (musculosCache && !forceRefresh) return musculosCache;
  const res = await api.get('/musculos?page=0&size=100');
  const data = res.data;
  musculosCache = data.content || data || [];
  return musculosCache;
};

// Admin Methods
export const createEjercicio = async (data) => {
  const res = await api.post('/ejercicios', data);
  ejerciciosCache = null; // Invalidate cache
  return res.data;
};

export const updateEjercicio = async (id, data) => {
  const res = await api.put(`/ejercicios/${id}`, data);
  ejerciciosCache = null; // Invalidate cache
  return res.data;
};

export const deleteEjercicio = async (id) => {
  const res = await api.delete(`/ejercicios/${id}`);
  ejerciciosCache = null; // Invalidate cache
  return res.data;
};

export const createMusculo = async (data) => {
  const res = await api.post('/musculos', data);
  musculosCache = null; // Invalidate cache
  return res.data;
};

export const updateMusculo = async (id, data) => {
  const res = await api.put(`/musculos/${id}`, data);
  musculosCache = null; // Invalidate cache
  return res.data;
};

export const deleteMusculo = async (id) => {
  const res = await api.delete(`/musculos/${id}`);
  musculosCache = null; // Invalidate cache
  return res.data;
};
