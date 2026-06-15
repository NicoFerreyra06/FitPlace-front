import api from './api';

export const getTodayRoutine = async () => {
  const res = await api.get('/rutinas/me/hoy');
  return res.data;
};

export const getMyRoutines = async () => {
  const res = await api.get('/rutinas/me');
  return res.data;
};

export const getAllRoutines = async (page = 0, size = 50) => {
  const res = await api.get(`/rutinas?page=${page}&size=${size}`);
  return res.data;
};

export const createRutina = async (rutinaData) => {
  const res = await api.post('/rutinas', rutinaData);
  return res.data;
};

export const updateRutina = async (id, rutinaData) => {
  const res = await api.put(`/rutinas/${id}`, rutinaData);
  return res.data;
};

export const deleteRutina = async (id) => {
  await api.delete(`/rutinas/${id}`);
};

export const activarRutina = async (id) => {
  const res = await api.put(`/usuarios/me/rutina-activa/${id}`);
  return res.data;
};

export const asignarRutinaAAlumno = async (alumnoId, rutinaId) => {
  const res = await api.put(`/usuarios/${alumnoId}/rutina-activa/${rutinaId}`);
  return res.data;
};

export const getRutinaById = async (id) => {
  const res = await api.get(`/rutinas/${id}`);
  return res.data;
};
