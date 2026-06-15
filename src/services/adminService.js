import api from './api';

export const createGimnasio = async (gimnasioData) => {
  const response = await api.post('/gimnasios', gimnasioData);
  return response.data;
};

export const deleteGimnasio = async (id) => {
  const response = await api.delete(`/gimnasios/${id}`);
  return response.data;
};

export const getMisGimnasios = async () => {
  const response = await api.get('/gimnasios/me');
  return response.data;
};

export const updateGimnasio = async (id, gimnasioData) => {
  const response = await api.put(`/gimnasios/me/${id}`, gimnasioData);
  return response.data;
};

export const activarSuscripcion = async (idSuscripcion) => {
  const response = await api.put(`/suscripciones/${idSuscripcion}/activar`);
  return response.data;
};

export const getMiembrosGimnasio = async (gimnasioId) => {
  const response = await api.get(`/gimnasios/me/suscripciones/${gimnasioId}`);
  return response.data;
};
