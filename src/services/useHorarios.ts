import { Notify } from 'quasar';
import { useAuthStore } from '../stores/auth';
import { useAxios } from '../services/useAxios';
import { useMensajes } from '../services/useMensajes';
import type {
  EntradasRegistradas,
  ListaEmpleados,
  ObjectError,
} from '../components/models';
import { esHorarioNocturno, deducirMensajeError } from '../utils/AppUtils';
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

const getJornadaForYesterday = (schedules: NuevoHorario[]): NuevoHorario => {
  const today = new Date();
  today.setDate(today.getDate() - 1);
  const yesterday = today.toLocaleDateString('en-CA');

  let nuevoHorario = {
    start: '',
    end: '',
    time: '',
    title: '',
    bgcolor: '',
    details: '',
  };
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

export const meses = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export function obtenerNumeroMes(nombreMes: string): number {
  const indice = meses.indexOf(nombreMes);

  if (indice !== -1) {
    return indice + 1;
  } else {
    return 0;
  }
}

export const generarFechas = (
  mes: number | null,
  anio: number | null
): { desde: string; hasta: string } => {
  if (mes !== null && anio !== null) {
    // Generar fecha "desde" (primer día del mes)
    const desd = new Date(anio, mes - 1, 1);
    const desde = `${desd.getFullYear()}/${String(desd.getMonth() + 1).padStart(
      2,
      '0'
    )}/${String(desd.getDate()).padStart(2, '0')}`;

    // Generar fecha "hasta" (último día del mes)
    const hast = new Date(anio, mes, 0);
    const hasta = `${hast.getFullYear()}/${String(hast.getMonth() + 1).padStart(
      2,
      '0'
    )}/${String(hast.getDate()).padStart(2, '0')}`;

    return { desde, hasta };
  }
  return { desde: '', hasta: '' };
};

export const getCurrentYear = (): number => {
  const currentDate = new Date();
  return currentDate.getFullYear();
};

export function useYearOptions() {
  const yearOptions: number[] = [];
  const currentYear = getCurrentYear();
  const maxYear = currentYear + 1;
  for (let year = currentYear - 1; year <= maxYear; year++) {
    yearOptions.push(year);
  }
  return yearOptions;
}

export const obtenerCodigo = (
  nombreCompleto: string,
  empleados: ListaEmpleados[]
) => {
  const empleado = empleados.find(
    (empleado) => empleado.nombre_completo === nombreCompleto
  );
  return empleado ? empleado.codigo : null;
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
    const jornadaAyer: NuevoHorario = getJornadaForYesterday(
      respuesta.objetos[0].horario
    );
    console.log('[JORNADA AYER]: ', JSON.stringify(jornadaAyer));
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

export const verificarDispositivoMaster = async (
  ide: string,
  codigo: number
) => {
  const respuesta = await get('/validar_dispositivo_master', {
    id: ide,
    usuario_codigo: codigo,
  });
  if (respuesta.error === 'N') {
    return true;
  } else {
    handleDispositivo();
    return false;
  }
};

export const obtenerAsistenciasFecha = async (
  codigo: number,
  fecha: string
) => {
  try {
    const asistencias: EntradasRegistradas = await get(
      '/obtener_asistencias_por_fecha',
      {
        codigo,
        fecha,
      }
    );
    return asistencias.objetos;
  } catch (error) {
    deducirMensajeError(error as ObjectError);
    return [];
  }
};
