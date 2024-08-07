<script setup lang="ts">
import {
  Camera,
  CameraSource,
  CameraDirection,
  CameraResultType,
} from '@capacitor/camera';
import { Device } from '@capacitor/device';
import { useAuthStore } from '../stores/auth';
import { useAxios } from '../services/useAxios';
import { DeviceId } from '../components/models';
import { LocalStorage } from 'quasar';
import {
  subirFoto,
  fetchHorario,
  handleResponse,
  checkPermission,
  verificarHorarios,
  handleDistanceCheck,
  handleGpsPermission,
  verificarDispositivo,
  fetchHorarioYesterday,
  obtenerSalidaRegistrada,
} from '../services/useHorarios';
import { Geolocation } from '@capacitor/geolocation';
import { useMensajes } from '../services/useMensajes';
import type { NuevoHorario, ObjectError } from '../components/models';
import { columnasAsistencias } from '../components/columns';
import {
  formatDate,
  getNextDay,
  getPreviousDay,
  formatoNocturno,
  obtenerDistancia,
  esHorarioNocturno,
  deducirMensajeError,
  determinarNumeroDeJornadas,
  isCurrentTimeGreaterThanTime,
  isCurrentTimeGreaterThanTitle,
} from '../utils/AppUtils';
import {
  Session,
  EntradaObject,
  EntradasRegistradas,
  RespuestaCoordenadas,
  ObjetoEntradasRegistradas,
} from '../components/models';
import {
  computed,
  onDeactivated,
  onBeforeUnmount,
  ref,
  onMounted,
  watch,
} from 'vue';
import {
  BarcodeScanner,
  ScanResult,
} from '@capacitor-community/barcode-scanner';

// Data
const id = ref('');
const foto = ref();
const hora = ref('');
const text = ref('');
const codigo = ref(0);
const sinHorarios = ref(false);
const esNocturno = ref<boolean>(false);
const filas = ref<ObjetoEntradasRegistradas[]>([]);
const check = ref(false);
const resultado = ref('');
const registrado = ref(false);
const showCamera = ref(false);
const checkSelfie = ref(false);
const checkRegistro = ref(false);
const authStore = useAuthStore();
const columnas = columnasAsistencias;
const { get, post, put } = useAxios();
const { mostrarMensaje } = useMensajes();
let currentTime = new Date().toLocaleTimeString();
const newPos = ref({
  latitude: 0,
  longitude: 0,
  timestamp: 0,
});
const mostrarRegistros = ref(false);
const registradoFinal = ref(false);

const numeroJornadas = ref(0);
const currentMonth = ref(0);
const currentYear = ref(0);
const entrada = ref(false);
const horario = ref<NuevoHorario | null>(null);
const horarioAyer = ref<NuevoHorario | null>(null);

const updateButton = async () => {
  registrado.value = false;
  horario.value = await fetchHorario();
  location.reload();
};

const obtenerAsistenciasFecha = async (codigo: number, fecha: string) => {
  try {
    const asistencias: EntradasRegistradas = await get(
      '/obtener_asistencias_por_fecha',
      {
        codigo,
        fecha,
      }
    );
    filas.value = asistencias.objetos;
  } catch (error) {
    deducirMensajeError(error as ObjectError);
    return null;
  }
};

const obtenerEntradaRegistrada = async (codigo: number, fecha: string) => {
  try {
    const entrada: EntradaObject = await get('/obtener_entrada_registrada', {
      codigo,
      fecha,
    });

    if (entrada.error === 'N') {
      if (entrada.objetos.length > 0) {
        numeroJornadas.value = entrada.objetos[0].jornada;
      }
    }

    return entrada.objetos;
  } catch (error) {
    deducirMensajeError(error as ObjectError);
    return null;
  }
};

onMounted(async () => {
  const currentDate = new Date();
  currentMonth.value = currentDate.getMonth() + 1;
  currentYear.value = currentDate.getFullYear();
  horario.value = await fetchHorario();
  horarioAyer.value = await fetchHorarioYesterday();

  console.log('[HORARIO]: ', JSON.stringify(horario.value));
  console.log('[HORARIO AYER]: ', JSON.stringify(horarioAyer.value));

  // let que = verificarHorarios(horario.value, horarioAyer.value);
  // console.log('[QUE]: ', que);

  if (horario.value) {
    const ent = await obtenerEntradaRegistrada(
      authStore.codigo,
      horario.value.start
    );

    const jornadas = determinarNumeroDeJornadas(horario.value.details);

    if (jornadas == 2) {
      let si_no = isCurrentTimeGreaterThanTime(horario.value, currentDate);
      if (ent?.length == 0) {
        numeroJornadas.value = 1;

        if (si_no == 1) {
          numeroJornadas.value = 2;
        }

        if (si_no == 2) {
          registradoFinal.value = true;
          return;
        }

        entrada.value = true;
      } else if (ent?.length == 1) {
        const salida = await obtenerSalidaRegistrada(
          authStore.codigo,
          horario.value.start,
          numeroJornadas.value
        );

        if (salida?.length == 0) {
          // numeroJornadas.value = 1;
          entrada.value = false;
        } else if (salida?.length == 1) {
          numeroJornadas.value = 2;
          entrada.value = true;

          if (ent[0].jornada == 2) {
            numeroJornadas.value = 2;
            registradoFinal.value = true;
          }
        }
      } else if (ent?.length == 2) {
        const salida = await obtenerSalidaRegistrada(
          authStore.codigo,
          horario.value.start,
          2
        );
        if (salida?.length == 0) {
          entrada.value = false;
          numeroJornadas.value = 2;
          registradoFinal.value = true;
        }
      }
    }

    if (jornadas == 1) {
      esNocturno.value = esHorarioNocturno(horario.value.details);
      let previousDay = getPreviousDay(horario.value.start);

      if (esNocturno.value) {
        numeroJornadas.value = 1;
        const entAnterior = await obtenerEntradaRegistrada(
          authStore.codigo,
          previousDay
        );
        const salidaToday = await obtenerSalidaRegistrada(
          authStore.codigo,
          horario.value.start,
          numeroJornadas.value
        );

        if (
          (entAnterior?.length == 1 &&
            ent?.length == 0 &&
            salidaToday?.length == 1) ||
          (entAnterior?.length == 0 && ent?.length == 0)
        ) {
          entrada.value = true;
          return;
        }

        if (ent?.length == 1 && salidaToday?.length == 1) {
          registradoFinal.value = true;
          return;
        }

        if (
          entAnterior?.length == 1 &&
          salidaToday?.length == 0 &&
          ent?.length == 0
        ) {
          entrada.value = false;
          return;
        }

        if (
          formatDate(currentDate) == horario.value.start &&
          ent?.length == 0 &&
          entAnterior?.length == 0
        ) {
          entrada.value = true;
          return;
        }
      } else {
        let si_no = isCurrentTimeGreaterThanTitle(horario.value, currentDate);
        if (ent?.length == 0) {
          numeroJornadas.value = 1;
          if (si_no == 1) {
            numeroJornadas.value = 1;
          }

          if (si_no == 2) {
            registradoFinal.value = true;
            return;
          }
        }

        const salida = await obtenerSalidaRegistrada(
          authStore.codigo,
          horario.value.start,
          numeroJornadas.value
        );

        if (ent?.length == 0 && salida?.length == 0) {
          entrada.value = true;
        }

        if (ent?.length == 1) {
          const salida = await obtenerSalidaRegistrada(
            authStore.codigo,
            horario.value.start,
            numeroJornadas.value
          );

          if (salida?.length == 0) {
            entrada.value = false;
          } else if (salida?.length == 1) {
            registradoFinal.value = true;
            return;
          }
        }
      }
    }
  }

  if (!horario.value && horarioAyer.value) {
    let nextDay = getNextDay(horarioAyer.value.start);

    const entAnterior = await obtenerEntradaRegistrada(
      authStore.codigo,
      horarioAyer.value.start
    );

    const salidaToday = await obtenerSalidaRegistrada(
      authStore.codigo,
      nextDay,
      numeroJornadas.value
    );

    if (salidaToday?.length == 1) {
      registradoFinal.value = true;
      return;
    }

    if (entAnterior?.length == 1 && salidaToday?.length == 0) {
      entrada.value = false;
    }
  }
});

watch(registradoFinal, () => {
  if (registradoFinal.value && horario.value != null) {
    obtenerAsistenciasFecha(authStore.codigo, horario.value.start);
  }
});

watch(mostrarRegistros, () => {
  if (horario.value != null) {
    obtenerAsistenciasFecha(authStore.codigo, horario.value.start);
  }
});

const titulo = computed(() => {
  return entrada.value ? 'Entrada' : 'Salida';
});

// Methods
onMounted(() => {
  const session: Session | null = LocalStorage.getItem('session');
  codigo.value = session?.codigo || 0;
});

const takeSelfie = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      direction: CameraDirection.Front,
      width: 1024,
      height: 768,
    });

    if (image.webPath) {
      // result.webPath contiene la URL de la imagen tomada
      foto.value = image.webPath;

      const respt = await fetch(image.webPath);

      if (respt.ok) {
        const data = await respt.blob();
        const file = new File([data], 'foto.jpg');

        const response = await subirFoto(file, codigo.value);
        return response.objetos;
      }
    }
  } catch (error) {
    deducirMensajeError(error as ObjectError);
  }
};

const registrarEntrada = async (employee_id: number, turn: number) => {
  try {
    const response = await post(
      '/registrar_entrada',
      {},
      JSON.parse(
        JSON.stringify({
          employee_id: employee_id,
          jornada: turn,
        })
      )
    );

    if (response.error === 'N') {
      checkRegistro.value = true;
      text.value = "Registro de entrada: '" + currentTime + "'";
    }
    handleResponse(response);
  } catch (error) {
    deducirMensajeError(error as ObjectError);
  }
};

const registrarSalida = async (employee_id: number, turn: number) => {
  try {
    const response = await put(
      '/registrar_salida',
      {},
      JSON.parse(
        JSON.stringify({
          employee_id: employee_id,
          jornada: turn,
        })
      )
    );

    if (response.error === 'N') {
      checkRegistro.value = true;
      text.value = "Registro de salida: '" + currentTime + "'";
    }
    handleResponse(response);
  } catch (error) {
    deducirMensajeError(error as ObjectError);
  }
};

const printCurrentPosition = async () => {
  // Check for location permissions
  const permissionStatus = await Geolocation.checkPermissions();

  // If permissions are not granted, request them
  if (permissionStatus.coarseLocation === 'granted') {
    const coordinates = await Geolocation.getCurrentPosition();
    // Update the state of the newPos ref
    newPos.value.latitude = coordinates.coords.latitude;
    newPos.value.longitude = coordinates.coords.longitude;
    newPos.value.timestamp = coordinates.timestamp;
  } else {
    handleGpsPermission();
  }
};

const onBackButton = () => {
  if (showCamera.value) {
    stopScan(); // Stop the scan (close the camera)
    showCamera.value = false;
  }
};

const logDeviceInfo = async () => {
  const info: DeviceId = await Device.getId();
  return info.identifier;
};

const prepare = () => {
  BarcodeScanner.prepare();
};

// Call the prepare method before using the barcode scanner
prepare();

const startScan = async () => {
  check.value = await verificarDispositivo(id.value);
  // Check camera permission
  const hasCameraPermission = await checkPermission();
  if (!hasCameraPermission) {
    return;
  }

  await printCurrentPosition();
  showCamera.value = true;

  await BarcodeScanner.checkPermission({ force: true });
  // make background of WebView transparent
  BarcodeScanner.hideBackground();
  const result: ScanResult = await BarcodeScanner.startScan();

  // if the result has content
  if (result.hasContent) {
    showCamera.value = false;
    resultado.value = result.content; // this is the decoded string
    await obtenerCoordenadas(resultado.value);
    distance.value = obtenerDistancia(
      newPos.value.latitude,
      newPos.value.longitude,
      targetLatitude.value,
      targetLongitude.value
    );

    if (distance.value <= maxDistance && check.value === true) {
      checkSelfie.value = await takeSelfie();

      if (checkSelfie.value === true) {
        if (entrada.value) {
          await registrarEntrada(codigo.value, numeroJornadas.value);

          setTimeout(() => {
            location.reload();
          }, 7000);
        } else {
          await registrarSalida(codigo.value, numeroJornadas.value);
          setTimeout(() => {
            location.reload();
          }, 7000);
        }
        if (checkRegistro.value == true) {
          hora.value = new Date().toLocaleTimeString();
          registrado.value = true;
        }
      } else {
        registrado.value = false;
      }
    }
    handleDistanceCheck(distance.value, maxDistance);
  }
};

const stopScan = () => {
  BarcodeScanner.showBackground();
  BarcodeScanner.stopScan();
};

onDeactivated(() => {
  stopScan();
});

onBeforeUnmount(() => {
  stopScan();
});

const targetLatitude = ref(0);
const targetLongitude = ref(0);
const maxDistance = 30; // 30 meters
const distance = ref(0);

const obtenerCoordenadas = async (nombre: string) => {
  const respuesta: RespuestaCoordenadas = await get(
    '/obtener_coordenadas_almacen',
    { alm_nomcom: nombre }
  );

  if (respuesta.error === 'N') {
    const firstItem = respuesta.objetos[0];
    targetLatitude.value = firstItem.lat;
    targetLongitude.value = firstItem.long;
  } else {
    mostrarMensaje('Error', respuesta.mensaje);
    return;
  }
};

const jornadas = computed(() => {
  if (horario.value) {
    const input = horario.value.details;
    return input ? input.split(' - ') : [];
  }
  return [];
});

onMounted(async () => {
  stopScan();
  document.addEventListener('backbutton', onBackButton);
  id.value = await logDeviceInfo();
});
</script>

<template>
  <q-page padding>
    <div class="sample-background">
      <!-- this background simulates the camera view -->
    </div>
    <div v-if="showCamera" class="container">
      <div class="barcode-scanner--area--container">
        <div class="relative">
          <p>Apunta tu cámara al código QR</p>
        </div>
        <div class="square surround-cover">
          <div class="barcode-scanner--area--outer surround-cover">
            <div class="barcode-scanner--area--inner"></div>
          </div>
        </div>
      </div>
    </div>
    <h4
      v-if="!showCamera"
      class="row text-uppercase text-grey-8 justify-center items-center content-center q-pa-md q-pb-xs q-mb-xs text-center"
      style="font-family: 'Bebas Neue'"
    >
      <div class="row no-wrap">
        <span v-if="sinHorarios"> No tiene un horario asignado para hoy </span>
        <span v-if="registradoFinal && !sinHorarios">
          Entradas y salidas registradas hoy
        </span>
        <span v-if="!registradoFinal && !sinHorarios">
          Registrar {{ titulo }}</span
        >
        <q-btn
          flat
          rounded
          color="primary"
          icon="update"
          dense
          @click="updateButton"
        />
      </div>
    </h4>
    <div v-if="horario && !registradoFinal">
      <q-toggle
        v-model="mostrarRegistros"
        icon="alarm"
        label="Ver registros de hoy"
        :disable="registradoFinal"
      />
    </div>

    <div
      class="row justify-center text-center"
      v-if="
        !esNocturno &&
        !showCamera &&
        horario &&
        !sinHorarios &&
        !registradoFinal &&
        !mostrarRegistros
      "
    >
      {{
        `Jornada en la que va a registrar su entrada/salida para hoy (${horario.start}):`
      }}
      <br />
      <q-radio
        v-model="numeroJornadas"
        v-for="(jornada, index) in jornadas"
        :key="index"
        checked-icon="task_alt"
        unchecked-icon="panorama_fish_eye"
        disable
        :val="index + 1"
        :label="`Jornada ${index + 1}: ${jornada}`"
      />
    </div>

    <div
      class="row justify-center text-center"
      v-if="
        esNocturno &&
        !showCamera &&
        horario &&
        !sinHorarios &&
        !registradoFinal &&
        !mostrarRegistros
      "
    >
      {{
        `Jornada en la que va a registrar su entrada/salida para hoy (${horario.start}):`
      }}
      <br />
      <q-radio
        v-model="numeroJornadas"
        checked-icon="task_alt"
        unchecked-icon="panorama_fish_eye"
        disable
        :val="1"
        :label="`Jornada Nocturna: ${formatoNocturno(
          jornadas[0],
          horario.start,
          getNextDay(horario.start)
        )}`"
      />
    </div>

    <div class="column justify-center items-center content-center">
      <div
        v-if="
          !showCamera &&
          !registrado &&
          !registradoFinal &&
          !sinHorarios &&
          !mostrarRegistros
        "
        class="col-12 text-center q-pt-md"
      >
        <img alt="QR code" src="../assets/logo.jpg" style="width: 340px" />
      </div>
      <div v-if="registrado" class="col-12">
        <img :src="foto" alt="Foto tomada" style="width: 150px" />
      </div>
    </div>
    <div class="row justify-center q-pt-lg">
      <div class="col text-center">
        <div v-if="showCamera">
          <span class="text-subtitle2 text-grey-1" v-if="!registrado">
            Posiciona el código QR en el centro de la pantalla
          </span>
        </div>
        <div
          v-if="
            !registrado && !registradoFinal && !mostrarRegistros && !sinHorarios
          "
        >
          <q-btn
            color="primary"
            rounded
            icon="camera_alt"
            label="Escanear código QR"
            size="lg"
            @click="startScan()"
            v-show="!showCamera"
          />
        </div>
      </div>
    </div>
    <div
      class="q-pa-md row justify-center items-start q-gutter-md"
      v-if="registrado"
    >
      <q-card
        class="my-card text-white"
        style="background: radial-gradient(circle, #35a2ff 0%, #014a88 100%)"
      >
        <q-card-section class="q-pa-md">
          <strong>Hora de entrada: </strong> {{ hora }}
          <br />
          <strong>Lugar de trabajo: </strong> {{ resultado }}
        </q-card-section>
      </q-card>
    </div>
    <div v-if="registradoFinal || mostrarRegistros">
      <q-table
        flat
        bordered
        hide-bottom
        :rows="filas"
        hide-pagination
        row-key="codigo"
        :columns="columnas"
        :visible-columns="['entrada', 'salida']"
      >
      </q-table>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
@import '../css/registro.asistencia.scss';
</style>
