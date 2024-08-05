import moment from 'moment';
import type { ObjectError, NuevoHorario } from '../components/models';

export function deducirMensajeError(o_error: ObjectError) {
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

export function formatearFechas(fechas: string[]) {
  if (fechas.length === 0) {
    return '';
  }

  const fechasFormateadas = [];
  let fechaInicial = moment(fechas[0], 'YYYY/MM/DD'); // Especifica el formato
  let fechaFinal = fechaInicial;

  for (let i = 1; i < fechas.length; i++) {
    const fecha = moment(fechas[i], 'YYYY/MM/DD'); // Especifica el formato

    if (
      fecha.diff(fechaFinal, 'days') === 1 &&
      fecha.month() === fechaFinal.month()
    ) {
      fechaFinal = fecha;
    } else {
      fechasFormateadas.push(formatoFechas(fechaInicial, fechaFinal));
      fechaInicial = fecha;
      fechaFinal = fecha;
    }
  }

  fechasFormateadas.push(formatoFechas(fechaInicial, fechaFinal));

  return fechasFormateadas.join(', ');
}

function formatoFechas(
  fechaInicial: moment.Moment,
  fechaFinal: moment.Moment
): string {
  if (fechaInicial.isSame(fechaFinal, 'day')) {
    return fechaInicial.format('DD/MM/YY');
  } else {
    return `${fechaInicial.format('DD')} - ${fechaFinal.format('DD/MM/YY')}`;
  }
}

export function isCurrentTimeGreaterThanTime(
  horario: NuevoHorario,
  currentDate: Date
): number {
  // Obtener la hora actual
  const currentHour = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();

  // Convertir la hora actual en minutos
  const currentTimeInMinutes = currentHour * 60 + currentMinutes;

  // Extraer la hora de "title" en horario
  const horarioTitleTime = horario.title.split(' ')[1];
  const [titleHour, titleMinutes] = horarioTitleTime.split(':').map(Number);
  const titleTimeInMinutes = titleHour * 60 + titleMinutes;
  const horarioEndTime = horario.time.split(' ')[1];
  const [endHour, endMinutes] = horarioEndTime.split(':').map(Number);
  const endTimeInMinutes = endHour * 60 + endMinutes;
  if (
    currentTimeInMinutes > titleTimeInMinutes &&
    currentTimeInMinutes <= endTimeInMinutes
  ) {
    return 1;
  } else if (currentTimeInMinutes > endTimeInMinutes) {
    return 2;
  } else {
    return 0;
  }
}

export function isCurrentTimeGreaterThanTitle(
  horario: NuevoHorario,
  currentDate: Date
): number {
  // Obtener la hora actual
  const currentHour = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();

  // Convertir la hora actual en minutos
  const currentTimeInMinutes = currentHour * 60 + currentMinutes;

  // Extraer la hora de "title" en horario
  const horarioTitleTime = horario.title.split(' ')[1]; // "12:00"
  const [titleHour, titleMinutes] = horarioTitleTime.split(':').map(Number);
  const titleTimeInMinutes = titleHour * 60 + titleMinutes;

  // Verificar si "time" está vacío

  if (currentTimeInMinutes > titleTimeInMinutes) {
    return 2;
  } else {
    return 1;
  }
}

export function determinarNumeroDeJornadas(details: string): number {
  // Verificar si el campo 'details' contiene el carácter '-'
  if (details.includes('-')) {
    return 2; // Dos jornadas
  } else {
    return 1; // Una jornada
  }
}

export const esHorarioNocturno = (details: string): boolean => {
  // Divide las horas de inicio y fin de la cadena 'details'
  const [horaInicio, horaFin] = details.split(' ').map((hora) => {
    // Convertir la hora a formato 24 horas para comparación
    const [hours, minutes] = hora.split(':').map(Number);
    return hours + minutes / 60;
  });

  // Verificar si la jornada es nocturna
  return horaInicio > horaFin;
};

export function getNextDay(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  // Aumentar el día en 1
  date.setDate(date.getDate() + 1);

  // Obtener el año, mes y día del nuevo objeto Date
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
  const nextDay = String(date.getDate()).padStart(2, '0');

  // Formatear la fecha en cadena 'yyyy-MM-dd'
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

export function getPreviousDay(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  // Disminuir el día en 1
  date.setDate(date.getDate() - 1);

  // Obtener el año, mes y día del nuevo objeto Date
  const prevYear = date.getFullYear();
  const prevMonth = String(date.getMonth() + 1).padStart(2, '0');
  const prevDay = String(date.getDate()).padStart(2, '0');

  // Formatear la fecha en cadena 'yyyy-MM-dd'
  return `${prevYear}-${prevMonth}-${prevDay}`;
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
