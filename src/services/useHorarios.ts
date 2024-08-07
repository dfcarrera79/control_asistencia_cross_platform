import { Notify } from 'quasar';
import { useAuthStore } from '../stores/auth';
import { useAxios } from '../services/useAxios';
import type { ObjectError } from '../components/models';
import { useMensajes } from '../services/useMensajes';
import { esHorarioNocturno, deducirMensajeError } from '../utils/AppUtils';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import {
  NuevoHorario,
  SalidaObject,
  RespuestaHorarioEmpleado,
} from '../components/models';

const { get, post } = useAxios();
const authStore = useAuthStore();
const { mostrarMensaje } = useMensajes();

export const fetchHorario = async () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const horario: NuevoHorario | null =
    (await obtenerHorarioEmpleado(
      authStore.codigo,
      currentMonth,
      currentYear
    )) || null;
  return horario;
};

export const fetchHorarioYesterday = async () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const horario: NuevoHorario | null =
    (await obtenerHorarioEmpleadoAyer(
      authStore.codigo,
      currentMonth,
      currentYear
    )) || null;
  return horario;
};

const getJornadaForToday = (schedules: NuevoHorario[]) => {
  const today = new Date().toLocaleDateString('en-CA');
  let nuevoHorario = null;
  schedules.forEach((schedule) => {
    if (schedule.start === today) {
      nuevoHorario = schedule;
    }
  });
  return nuevoHorario;
};

const getJornadaForYesterday = (schedules: NuevoHorario[]) => {
  const today = new Date();
  today.setDate(today.getDate() - 1);
  const yesterday = today.toLocaleDateString('en-CA');

  let nuevoHorario = null;
  schedules.forEach((schedule) => {
    if (schedule.start === yesterday) {
      nuevoHorario = schedule;
    }
  });

  return nuevoHorario;
};

export const obtenerHorarioEmpleado = async (
  code: number,
  month: number,
  year: number
): Promise<NuevoHorario | null> => {
  const respuesta: RespuestaHorarioEmpleado = await get(
    '/obtener_horario_empleado',
    {
      codigo: code,
      mes: month,
      anio: year,
    }
  );
  if (respuesta.error === 'S') {
    return null;
  }

  if (respuesta.error === 'N') {
    const jornada = getJornadaForToday(respuesta.objetos[0].horario);
    return jornada;
  }
  return null;
};

export const obtenerHorarioEmpleadoAyer = async (
  code: number,
  month: number,
  year: number
): Promise<NuevoHorario | null> => {
  const respuesta: RespuestaHorarioEmpleado = await get(
    '/obtener_horario_empleado',
    {
      codigo: code,
      mes: month,
      anio: year,
    }
  );
  if (respuesta.error === 'S') {
    return null;
  }

  if (respuesta.error === 'N') {
    const jornadaAyer = getJornadaForYesterday(respuesta.objetos[0].horario);
    let esNocturno;
    if (jornadaAyer) {
      esNocturno = esHorarioNocturno(jornadaAyer.details);
      if (esNocturno) {
        return jornadaAyer;
      } else {
        return null;
      }
    }
  }
  return null;
};

export const obtenerSalidaRegistrada = async (
  codigo: number,
  fecha: string,
  jornada: number
) => {
  try {
    const salida: SalidaObject = await get('/obtener_salida_registrada', {
      codigo,
      fecha,
      jornada,
    });
    return salida.objetos;
  } catch (error) {
    deducirMensajeError(error as ObjectError);
    return null;
  }
};

export function verificarHorarios(
  horario: NuevoHorario | null,
  horarioAyer: NuevoHorario | null
): boolean {
  if (horario == null && horarioAyer == null) {
    return true;
  }
  return false;
}

export function mostrarNotificacion({
  color = 'red-5',
  textColor = 'white',
  icon = 'warning',
  message = 'Mensaje de notificación',
  timeout = 2000,
}) {
  Notify.create({
    color,
    textColor,
    icon,
    message,
    timeout,
  });
}

export function handleDispositivo() {
  mostrarNotificacion({
    message: '¡No se encuentra el dispositivo registrado en el sistema!',
  });
}

export function handleGpsPermission() {
  mostrarNotificacion({
    message: '¡Debe chequear los permisos de gps en las configuraciones!',
  });
}

interface Response {
  error: string;
  mensaje: string;
}

export function handleResponse(response: Response) {
  mostrarNotificacion({
    color: response.error === 'N' ? 'green-4' : 'red-5',
    icon: response.error === 'N' ? 'cloud_done' : 'warning',
    message: response.mensaje,
  });
}

export function handleDistanceCheck(distance: number, maxDistance: number) {
  mostrarNotificacion({
    color: distance <= maxDistance ? 'green-4' : 'red-5',
    icon: distance <= maxDistance ? 'cloud_done' : 'warning',
    message:
      distance <= maxDistance
        ? 'El dispositivo está dentro del rango especificado.'
        : 'El dispositivo está fuera del rango especificado.',
  });
}

export const subirFoto = async (file: File, code: number) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const newQuery = `/comparar_fotos/${code}`;
    const respt = await post(newQuery, {}, formData);
    handleResponse(respt);
    return respt;
  } catch (error) {
    mostrarMensaje('Error al subir la foto:', error as string);
  }
};

export const verificarDispositivo = async (ide: string) => {
  const respuesta = await get('/validar_dispositivo', {
    id: ide,
  });
  if (respuesta.error === 'N') {
    return true;
  } else {
    handleDispositivo();
    return false;
  }
};

export const checkPermission = async () => {
  const status = await BarcodeScanner.checkPermission();

  if (status.denied) {
    // the user denied permission for good
    // redirect user to app settings if they want to grant it anyway
    const c = confirm(
      'Si desea otorgar permiso para usar su cámara, habilítelo en la configuración de la aplicación.'
    );
    if (c) {
      BarcodeScanner.openAppSettings();
    }
    return false;
  } else {
    return true;
  }
};
