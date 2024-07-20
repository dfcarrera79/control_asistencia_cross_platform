<script setup lang="ts">
import {
  Camera,
  CameraResultType,
  CameraSource,
  CameraDirection,
} from '@capacitor/camera';
import { Device } from '@capacitor/device';
import { useAuthStore } from '../stores/auth';
import { useAxios } from '../services/useAxios';
import { DeviceId } from '../components/models';
import { LocalStorage, useQuasar } from 'quasar';
import { Geolocation } from '@capacitor/geolocation';
import { useMensajes } from '../services/useMensajes';
import type { ObjectError } from '../components/models';
import { obtenerDistancia, deducirMensajeError } from '../utils/AppUtils';
import {
  NuevoHorario,
  RespuestaCoordenadas,
  RespuestaHorarioEmpleado,
  Session,
} from '../components/models';
import { computed, onDeactivated, onBeforeUnmount, ref, onMounted } from 'vue';
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
const $q = useQuasar();
const check = ref(false);
const resultado = ref('');
const registrado = ref(false);
const showCamera = ref(false);
const checkSelfie = ref(false);
const checkRegistro = ref(false);
const authStore = useAuthStore();
const { get, post } = useAxios();
const { mostrarMensaje } = useMensajes();
let currentTime = new Date().toLocaleTimeString();
const newPos = ref({
  latitude: 0,
  longitude: 0,
  timestamp: 0,
});

const currentMonth = ref(0);
const currentYear = ref(0);

const horario = ref({
  end: '',
  time: '',
  start: '',
  title: '',
  bgcolor: '',
  details: '',
});
const jornada = ref(0);

const getJornadaForToday = (schedules: NuevoHorario[]) => {
  // const today = new Date().toISOString().split('T')[0];
  const today = new Date().toLocaleDateString('en-CA');
  let nuevoHorario = null;
  schedules.forEach((schedule) => {
    if (schedule.start === today) {
      jornada.value = schedule.time === '' ? 1 : 2;
      nuevoHorario = schedule;
    }
  });

  return nuevoHorario;
};

const updateButton = async () => {
  registrado.value = false;
  horario.value = (await obtenerHorarioEmpleado(
    authStore.codigo,
    currentMonth.value,
    currentYear.value
  )) || {
    end: '',
    time: '',
    start: '',
    title: '',
    bgcolor: '',
    details: '',
  };
};

const obtenerHorarioEmpleado = async (
  code: number,
  month: number,
  year: number
) => {
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
    return getJornadaForToday(respuesta.objetos[0].horario);
  }
};

const registrarJornadas = async (id: number, jor: number) => {
  let response;

  response = await post(
    '/registrar_jornadas',
    {},
    JSON.parse(
      JSON.stringify({
        employee_id: id,
        jornada: jor,
      })
    )
  );

  return response;
};

onMounted(async () => {
  const currentDate = new Date();

  currentMonth.value = currentDate.getMonth() + 1;
  currentYear.value = currentDate.getFullYear();
  horario.value = (await obtenerHorarioEmpleado(
    authStore.codigo,
    currentMonth.value,
    currentYear.value
  )) || {
    end: '',
    time: '',
    start: '',
    title: '',
    bgcolor: '',
    details: '',
  };

  let asistencia;
  asistencia = await get('/obtener_entrada_registrada', {
    codigo: 84,
    fecha: currentDate,
  });

  console.log('[ASISTENCIA]: ', JSON.stringify(asistencia));

  if (asistencia.objetos.length !== 0) {
  } else {
    console.log('No hay asistencia registrada');
    for (let i = 1; i <= jornada.value; i++) {
      await registrarJornadas(84, i);
    }
  }
});

// Methods
onMounted(() => {
  const session: Session | null = LocalStorage.getItem('session');
  codigo.value = session?.codigo || 0;
});

const subirFoto = async (file: File, code: number) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const newQuery = `/comparar_fotos/${code}`;
    const respt = await post(newQuery, {}, formData);

    // Handle the response accordingly
    $q.notify({
      color: respt.error === 'N' ? 'green-4' : 'red-5',
      textColor: 'white',
      icon: respt.error === 'N' ? 'cloud_done' : 'warning',
      message: respt.mensaje,
      timeout: 10000,
    });
    return respt;
  } catch (error) {
    mostrarMensaje('Error al subir la foto:', error as string);
  }
};

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

const verificarDispositivo = async () => {
  id.value = await logDeviceInfo();
  const respuesta = await get('/validar_dispositivo', {
    id: id.value,
  });
  if (respuesta.error === 'N') {
    check.value = true;
  } else {
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: '¡No se encuentra el dispositivo registrado en el sistema!',
      timeout: 10000,
    });
    check.value = false;
  }
};

const registrarEntrada = async (employee_id: number) => {
  try {
    const response = await post(
      '/registrar_entrada',
      {},
      JSON.parse(
        JSON.stringify({
          employee_id: employee_id,
        })
      )
    );

    if (response.error === 'N') {
      checkRegistro.value = true;
      text.value = "Registro de entrada: '" + currentTime + "'";
    }
    // Handle the response accordingly
    $q.notify({
      color: response.error === 'N' ? 'green-4' : 'red-5',
      textColor: 'white',
      icon: response.error === 'N' ? 'cloud_done' : 'warning',
      message: response.mensaje,
      timeout: 10000,
    });
  } catch (error) {
    mostrarMensaje('Error registrando las coordenadas:', error as string);
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
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: '¡Debe chequear los permisos de gps en las configuraciones!',
    });
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

const checkPermission = async () => {
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

const prepare = () => {
  BarcodeScanner.prepare();
};

// Call the prepare method before using the barcode scanner
prepare();

const startScan = async () => {
  verificarDispositivo();
  // Check camera permission
  const hasCameraPermission = await checkPermission();
  if (!hasCameraPermission) {
    // Handle the case when the user denies camera permission
    return;
  }

  await printCurrentPosition();
  showCamera.value = true;

  await BarcodeScanner.checkPermission({ force: true });
  // make background of WebView transparent
  // note: if you are using ionic this might not be enough, check below
  BarcodeScanner.hideBackground();

  const result: ScanResult = await BarcodeScanner.startScan(); // start scanning and wait for a result

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
        await registrarEntrada(codigo.value);
        if (checkRegistro.value == true) {
          hora.value = new Date().toLocaleTimeString();
          registrado.value = true;
        }
      } else {
        registrado.value = false;
      }
    }

    $q.notify({
      color: distance.value <= maxDistance ? 'green-4' : 'red-5',
      textColor: 'white',
      icon: distance.value <= maxDistance ? 'cloud_done' : 'warning',
      message:
        distance.value <= maxDistance
          ? 'El dispositivo está dentro del rango especificado.'
          : 'El dispositivo está fuera del rango especificado.',
      timeout: 10000,
    });
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
  const input = horario.value.details;
  return input ? input.split(' - ') : [];
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
        <span>Registrar Entrada</span>
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

    <div class="row justify-center text-center" v-if="!showCamera">
      {{ `Tu horario de trabajo para hoy (${horario.start}) es:` }}
      <br />
      <ul class="q-ma-xs" v-for="(jornada, index) in jornadas" :key="index">
        <li>Jornada {{ index + 1 }}: {{ jornada }}</li>
      </ul>
    </div>

    <div class="column justify-center items-center content-center">
      <div v-if="!showCamera && !registrado" class="col-12 text-center q-pt-md">
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
        <div v-if="!registrado">
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
  </q-page>
</template>

<style scoped lang="scss">
@import '../css/registro.asistencia.scss';
</style>
