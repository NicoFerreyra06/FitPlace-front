import api from './api';

export const createSuscripcion = async (idGimnasio) => {
  const response = await api.post(`/suscripciones/${idGimnasio}`);
  return response.data;
};

export const generatePagoLink = async (idSuscripcion) => {
  // Solicitamos responseType 'text' porque el backend original devuelve un String puro
  const response = await api.post(`/pagos/${idSuscripcion}`, null, { responseType: 'text' });
  // Si la respuesta es texto plano, response.data es el string. Si fuera JSON, intentamos parsearlo.
  let url = response.data;
  try {
    const parsed = JSON.parse(url);
    if (parsed.url) url = parsed.url;
  } catch (e) {
    // Es un string puro, ignoramos el error
  }
  return url;
};

export const getMiSuscripcion = async () => {
  const response = await api.get('/suscripciones/mia');
  return response.data;
};

export const cancelarSuscripcion = async (idSuscripcion) => {
  const response = await api.put(`/suscripciones/${idSuscripcion}/cancelar`);
  return response.data;
};
