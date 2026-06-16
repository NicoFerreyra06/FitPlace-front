import api from './api';

export const getProfile = async () => {
  const response = await api.get('/usuarios/me');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put('/usuarios/me', data);
  return response.data;
};

export const getFriends = async () => {
  const response = await api.get('/usuarios/me/amigos');
  return response.data;
};

export const addFriend = async (code) => {
  const response = await api.post(`/usuarios/me/amigos/${code}`);
  return response.data;
};

export const deleteFriend = async (friendId) => {
  const response = await api.delete(`/usuarios/me/amigos/${friendId}`);
  return response.data;
};

export const getTrainer = async () => {
  const response = await api.get('/usuarios/me/entrenador');
  return response.data;
};

export const assignTrainer = async (trainerId) => {
  const response = await api.put(`/usuarios/me/entrenador/${trainerId}`);
  return response.data;
};

export const removeTrainer = async () => {
  const response = await api.delete('/usuarios/me/entrenador');
  return response.data;
};

export const getAlumnos = async () => {
  const response = await api.get('/usuarios/me/alumnos');
  return response.data;
};

/** Cualquier usuario autenticado — GET /usuarios/{id} */
export const getUsuarioById = async (id) => {
  const response = await api.get(`/usuarios/${id}`);
  return response.data;
};

/** Solo rol ADMIN — GET /usuarios?page=&size= */
export const getUsuarios = async (page = 0, size = 20) => {
  const response = await api.get(`/usuarios?page=${page}&size=${size}`);
  return response.data;
};

export const getEntrenadores = async () => {
  const response = await api.get('/usuarios/entrenadores');
  return response.data;
};
