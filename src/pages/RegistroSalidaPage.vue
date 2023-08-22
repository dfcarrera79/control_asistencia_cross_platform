<template>
  <q-page>
    <h4
      v-if="!showCamera"
      class="row text-uppercase text-grey-8 justify-center items-center content-center q-pa-md text-center"
      style="font-family: 'Bebas Neue'"
    >
      <div>Registrar Salida</div>
    </h4>

    <div class="row">
      <div v-if="!showCamera" class="col-12 text-center q-pt-md">
        <img alt="QR code" src="../assets/logo.jpg" style="width: 340px" />
      </div>
    </div>
    <div class="row justify-center q-pt-lg">
      <div class="col text-center">
        <div>
          <span class="text-subtitle2 text-grey-9">
            {{ textInfo }}
          </span>
        </div>
        <div>
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
    <div v-if="resultado !== ''">
      <p><strong>Device ID: </strong> {{ id }}</p>
      <p><strong>GPS position: </strong> {{ newPos }}</p>
      <p class="text-subtitle1 text-grey-9">
        <strong>Último resultado: </strong> <b>{{ resultado }}</b>
      </p>
      <p>{{ targetLatitude }}</p>
      <p>{{ targetLongitude }}</p>
      <p>{{ distance }}</p>
      <p>{{ text }}</p>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { LocalStorage, useQuasar } from 'quasar';
import { Device } from '@capacitor/device';
import { DeviceId } from '../components/models';
import { useAxios } from '../services/useAxios';
import { Geolocation } from '@capacitor/geolocation';
import {
  BarcodeScanner,
  ScanResult,
} from '@capacitor-community/barcode-scanner';
import { computed, onDeactivated, onBeforeUnmount, ref, onMounted } from 'vue';
import { RespuestaCoordenadas, Session } from '../components/models';
import { useAuthStore } from '../stores/auth';

// Data
const resultado = ref('');
const { get, put } = useAxios();
const authStore = useAuthStore();
const showCamera = ref(false);
const id = ref('');
const newPos = ref({
  latitude: 0,
  longitude: 0,
  timestamp: 0,
});
const $q = useQuasar();
const text = ref('');
let currentTime = new Date().toLocaleTimeString();
const codigo = ref(0);

// Methods
onMounted(() => {
  const session: Session | null = LocalStorage.getItem('session');
  codigo.value = session?.codigo || 0;
});

const registrarSalida = async (employee_id: number) => {
  try {
    const response = await put(
      '/registrar_salida',
      {},
      JSON.parse(
        JSON.stringify({
          employee_id: employee_id,
        })
      )
    );

    if (response.error === 'N') {
      text.value = "Registro de salida: '" + currentTime + "'";
    }
    // Handle the response accordingly
    $q.notify({
      color: response.error === 'N' ? 'green-4' : 'red-5',
      textColor: 'white',
      icon: response.error === 'N' ? 'cloud_done' : 'warning',
      message: response.mensaje,
    });
  } catch (error) {
    console.error('Error registrando las coordenadas:', error);
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

  // Get the current position
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

onMounted(async () => {
  document.addEventListener('backbutton', onBackButton);
  id.value = await logDeviceInfo();
});

const textInfo = computed(() => {
  return showCamera.value
    ? 'posiciona el código QR en el centro de la pantalla'
    : 'Presiona el botón y escanea el código QR';
});

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

    if (distance.value <= maxDistance) {
      await registrarSalida(codigo.value);
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
  });
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

const obtenerDistancia = (
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
    console.error(respuesta.mensaje);
    return;
  }
};
</script>
