// import { ref } from 'vue';
// import { useAuthStore } from '../stores/auth';
// import { useAxios } from '../services/useAxios';
// import type { ObjectError } from '../components/models';
// import {
//   deducirMensajeError,
//   determinarNumeroDeJornadas,
//   isCurrentTimeGreaterThanTime,
//   isCurrentTimeGreaterThanTitle,
// } from '../utils/AppUtils';

// const obtenerSalidaRegistrada = async (
//   codigo: number,
//   fecha: string,
//   jornada: number
// ) => {
//   try {
//     const salida: SalidaObject = await get('/obtener_salida_registrada', {
//       codigo,
//       fecha,
//       jornada,
//     });
//     return salida.objetos;
//   } catch (error) {
//     // console.error('Error obteniendo salida registrada:', error);
//     deducirMensajeError(error as ObjectError);
//     return null;
//   }
// };

// import {
//   NuevoHorario,
//   SalidaObject,
//   EntradaObject,
//   RespuestaHorarioEmpleado,
// } from '../components/models';

// const { get } = useAxios();

// const getJornadaForToday = (schedules: NuevoHorario[]) => {
//   // const today = new Date().toISOString().split('T')[0];
//   const today = new Date().toLocaleDateString('en-CA');
//   let nuevoHorario = null;
//   schedules.forEach((schedule) => {
//     if (schedule.start === today) {
//       jornada.value = schedule.time === '' ? 1 : 2;
//       nuevoHorario = schedule;
//     }
//   });
//   return nuevoHorario;
// };

// const obtenerEntradaRegistrada = async (codigo: number, fecha: string) => {
//   try {
//     const entrada: EntradaObject = await get('/obtener_entrada_registrada', {
//       codigo,
//       fecha,
//     });

//     if (entrada.error === 'N') {
//       if (entrada.objetos.length > 0) {
//         numeroJornadas.value = entrada.objetos[0].jornada;
//       }
//     }

//     return entrada.objetos;
//   } catch (error) {
//     deducirMensajeError(error as ObjectError);
//     return null;
//   }
// };

// const obtenerHorarioEmpleado = async (
//   code: number,
//   month: number,
//   year: number
// ) => {
//   const respuesta: RespuestaHorarioEmpleado = await get(
//     '/obtener_horario_empleado',
//     {
//       codigo: code,
//       mes: month,
//       anio: year,
//     }
//   );
//   if (respuesta.error === 'S') {
//     return null;
//   }

//   if (respuesta.error === 'N') {
//     return getJornadaForToday(respuesta.objetos[0].horario);
//   }
// };

// export function useHorario() {
//   const currentMonth = ref(new Date().getMonth() + 1);
//   const currentYear = ref(new Date().getFullYear());
//   const horario = ref({
//     end: '',
//     time: '',
//     start: '',
//     title: '',
//     bgcolor: '',
//     details: '',
//   });
//   const numeroJornadas = ref(1);
//   const registradoFinal = ref(false);
//   const entrada = ref(true);

//   const authStore = useAuthStore();

//   const processHorario = async () => {
//     const currentDate = new Date();
//     await fetchHorario();

//     const ent = await obtenerEntradaRegistrada(authStore.codigo, horario.value.start);
//     const jornadas = determinarNumeroDeJornadas(horario.value.details);

//     if (jornadas === 2) {
//       await handleTwoJornadas(ent, currentDate);
//     } else if (jornadas === 1) {
//       await handleOneJornada(ent, currentDate);
//     }
//   };

//   const handleOneJornada = async (ent: any, currentDate: Date) => {
//     const si_no = isCurrentTimeGreaterThanTitle(horario.value, currentDate);

//     if (ent?.length === 0) {
//       if (si_no === 2) {
//         registradoFinal.value = true;
//         return;
//       }
//     } else if (ent?.length === 1) {
//       const salida = await obtenerSalidaRegistrada(authStore.codigo, horario.value.start, numeroJornadas.value);
//       if (salida?.length === 0) {
//         entrada.value = false;
//       } else if (salida?.length === 1) {
//         registradoFinal.value = true;
//       }
//     }
//   };

//   return {
//     currentMonth,
//     currentYear,
//     horario,
//     numeroJornadas,
//     registradoFinal,
//     entrada,
//     processHorario
//   };
// }
import { useAuthStore } from '../stores/auth';
import { useAxios } from '../services/useAxios';
import type { ObjectError } from '../components/models';
import {
  deducirMensajeError,
  isCurrentTimeGreaterThanTime,
  isCurrentTimeGreaterThanTitle,
} from '../utils/AppUtils';

import {
  NuevoHorario,
  SalidaObject,
  EntradasRegistradas,
  RespuestaHorarioEmpleado,
} from '../components/models';

const { get } = useAxios();
const authStore = useAuthStore();

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
    console.log('[SALIDA]: ', JSON.stringify(salida));
    return salida.objetos;
  } catch (error) {
    deducirMensajeError(error as ObjectError);
    return null;
  }
};

export const obtenerAsistenciasFecha = async (
  codigo: number,
  fecha: string
) => {
  console.log('[FECHA]: ', fecha);
  try {
    const asistencias: EntradasRegistradas = await get(
      '/obtener_asistencias_por_fecha',
      {
        codigo,
        fecha,
      }
    );
    console.log('[ASISTENCIAS]: ', JSON.stringify(asistencias));
    return asistencias.objetos;
  } catch (error) {
    deducirMensajeError(error as ObjectError);
    return null;
  }
};
