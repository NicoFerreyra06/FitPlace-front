import api from './api';

export const getAmigos = async () => {
  const res = await api.get('/usuarios/me/amigos');
  return res.data;
};

export const agregarAmigo = async (codigo) => {
  const res = await api.post(`/usuarios/me/amigos/${codigo}`);
  return res.data;
};

export const eliminarAmigo = async (amigoId) => {
  const res = await api.delete(`/usuarios/me/amigos/${amigoId}`);
  return res.data;
};

export const getPerfilAmigo = async (amigoId) => {
  try {
    const res = await api.get(`/usuarios/${amigoId}`);
    return res.data;
  } catch (err) {
    return null;
  }
};

export const asignarEntrenador = async (entrenadorId) => {
  const res = await api.put(`/usuarios/me/entrenador/${entrenadorId}`);
  return res.data;
};

export const eliminarEntrenador = async () => {
  const res = await api.delete('/usuarios/me/entrenador');
  return res.data;
};

export const getMiEntrenador = async () => {
  const res = await api.get('/usuarios/me/entrenador');
  return res.data;
};

export const getAlumnos = async () => {
  const res = await api.get('/usuarios/me/alumnos');
  return res.data;
};

export const getUsuarios = async (page = 0) => {
  const res = await api.get(`/usuarios?page=${page}&size=20`);
  return res.data;
};

export const cambiarRol = async (userId, nuevoRol) => {
  const res = await api.put(`/usuarios/${userId}/rol?nuevoRol=${nuevoRol}`);
  return res.data;
};

export const editarPerfil = async (data) => {
  const res = await api.put('/usuarios/me', data);
  return res.data;
};
