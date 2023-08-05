<template>
  <q-page>
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
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { Device } from '@capacitor/device';
import { DeviceId } from '../components/models';
import { Geolocation } from '@capacitor/geolocation';
import {
  BarcodeScanner,
  ScanResult,
} from '@capacitor-community/barcode-scanner';
import { computed, onDeactivated, onBeforeUnmount, ref, onMounted } from 'vue';

// Data
const resultado = ref('');
const showCamera = ref(false);
const id = ref('');
// const newPos: Ref<LocationData | null> = ref(null);
const newPos = ref({
  latitude: 0,
  longitude: 0,
  timestamp: 0,
});

// Methods
const printCurrentPosition = async () => {
  const coordinates = await Geolocation.getCurrentPosition();
  // newPos.value = coordinates;
  newPos.value.latitude = coordinates.coords.latitude;
  newPos.value.longitude = coordinates.coords.longitude;
  newPos.value.timestamp = coordinates.timestamp;
  console.log('Current position:', coordinates);
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
  const status = await BarcodeScanner.checkPermission({ force: true });
  if (status.granted) {
    return true;
  } else if (status.denied) {
    return false;
  } else {
    return false;
  }
};

checkPermission();

const prepare = () => {
  BarcodeScanner.prepare();
};

// Call the prepare method before using the barcode scanner
prepare();

const startScan = async () => {
  // Check camera permission
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
</script>
