<template>
  <q-page>
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
          <span class="text-subtitle2 text-grey-9" v-if="!registrado">
            {{ textInfo }}
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
          <strong>Hora de salida: </strong> {{ hora }}
          <br />
          <strong>Lugar de trabajo: </strong> {{ resultado }}
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { Device } from '@capacitor/device';
import { DeviceId } from '../components/models';
import { useAxios } from '../services/useAxios';
import { LocalStorage, useQuasar } from 'quasar';
import { Geolocation } from '@capacitor/geolocation';
import { obtenerDistancia } from '../utils/AppUtils';
import { RespuestaCoordenadas, Session } from '../components/models';
import { computed, onDeactivated, onBeforeUnmount, ref, onMounted } from 'vue';
import {
  BarcodeScanner,
  ScanResult,
} from '@capacitor-community/barcode-scanner';

// Data
const id = ref('');
const hora = ref('');
const text = ref('');
const codigo = ref(0);
const $q = useQuasar();
const check = ref(false);
const checkRegistro = ref(false);
const resultado = ref('');
const registrado = ref(false);
const showCamera = ref(false);
const { get, put } = useAxios();
let currentTime = new Date().toLocaleTimeString();
const newPos = ref({
  latitude: 0,
  longitude: 0,
  timestamp: 0,
});

// Methods
onMounted(() => {
  const session: Session | null = LocalStorage.getItem('session');
  codigo.value = session?.codigo || 0;
});

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
    });
    check.value = false;
  }
};

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
      checkRegistro.value = true;
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
      await registrarSalida(codigo.value);
      if (checkRegistro.value == true) {
        hora.value = new Date().toLocaleTimeString();
        registrado.value = true;
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
    console.error(respuesta.mensaje);
    return;
  }
};
</script>

<style>
* {
  box-sizing: border-box;
}
p {
  color: #fff;
  font-family: sans-serif;
  text-align: center;
  font-weight: 600;
}
html,
body,
.container {
  position: relative;
  width: 100%;
  height: 100%;
}
.container {
  display: flex;
}
.relative {
  position: relative;
  z-index: 1;
}
.square {
  height: 50%;
  width: 50%; /* Change this value to make the square smaller */
  margin-top: 150px;
  margin-left: 70px;
  position: relative;
  overflow: hidden;
  transition: 0.3s;
}
.square:after {
  content: '';
  top: 0;
  display: block;
  padding-bottom: 100%;
}
.square > div {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
.surround-cover {
  box-shadow: 0 0 0 99999px rgba(0, 0, 0, 0.5);
}
.barcode-scanner--area--container {
  width: 80%;
  max-width: min(500px, 80vh);
  margin: auto;
}
.barcode-scanner--area--outer {
  display: flex;
  border-radius: 1em;
}
.barcode-scanner--area--inner {
  width: 100%;
  margin: 1rem;
  border: 2px solid #fff;
  box-shadow: 0px 0px 2px 1px rgb(0 0 0 / 0.5),
    inset 0px 0px 2px 1px rgb(0 0 0 / 0.5);
  border-radius: 1rem;
}

.sample-background {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(45deg, #673ab7, transparent);
  background: url(./mockup.jpg);
  background-position: 45% 50%;
  background-size: cover;
  background-repeat: no-repeat;
  animation: shake 5s infinite;
}
@keyframes shake {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
  20% {
    transform: translate(5px, 5px) rotate(-1deg) scale(1.05);
  }
  40% {
    transform: translate(5px, 5px) rotate(-2deg) scale(1.07);
  }
  60% {
    transform: translate(2px, 2px) rotate(0deg) scale(1.04);
  }
  80% {
    transform: translate(-1px, -1px) rotate(-2deg) scale(1.05);
  }
  100% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
}
</style>
