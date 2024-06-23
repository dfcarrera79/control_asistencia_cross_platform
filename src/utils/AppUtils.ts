import type { ObjectError } from '../components/models';

export function deducirMensajeError(o_error: ObjectError) {
  console.log('[O_ERROR]', JSON.stringify(o_error));
  let mensaje = '';
  let hubo = false;
  if (o_error.message) {
    mensaje =
      o_error.message === 'Network Error'
        ? 'La aplicación no logra conectarse con el servidor, revise si su dispositivo esta con internet o si el servidor esta disponible.'
        : o_error.message;
    hubo = true;
  }
  if (o_error.config) {
    if (o_error.config.url) {
      mensaje =
        mensaje +
        "<br><span style='color:red'>" +
        o_error.config.url +
        '</span>';
      hubo = true;
    }
  }
  if (hubo === false) {
    mensaje = JSON.stringify(o_error);
  }
  return mensaje;
}

export const obtenerDistancia = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const earthRadius = 6371000; // Earth's radius in meters

  const toRadians = (degrees: number) => degrees * (Math.PI / 180);

  const deltaLat = toRadians(lat2 - lat1);
  const deltaLon = toRadians(lon2 - lon1);

  const haversineA =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(deltaLon / 2) ** 2;

  const haversineC =
    2 * Math.atan2(Math.sqrt(haversineA), Math.sqrt(1 - haversineA));

  const distance = earthRadius * haversineC;

  return distance;
};
