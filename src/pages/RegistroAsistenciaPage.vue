<template>
  <q-page>
    <div class="row">
      <div v-if="resultado !== ''">
        <p class="text-subtitle1 text-grey-9">
          Último resultado: <b>{{ resultado }}</b>
        </p>
      </div>

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

        <div v-if="showCamera">
          <BarcodeScanner
            v-if="$q.platform.is.mobile"
            :prepare="prepareScan"
            :hideBackground="hideBackground"
            :showBackground="showBackground"
            :startScan="startScan"
            :stopScan="stopScan"
            ref="barcodeScanner"
            @scan="onDecode"
            style="width: 100%; height: 100%"
          />
          <qrcode-stream v-else :camera="camera" @decode="onDecode">
          </qrcode-stream>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { QrcodeStream } from 'vue-qrcode-reader';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { computed, onDeactivated, onBeforeUnmount, ref, onMounted } from 'vue';
import { ScanResult } from '@capacitor-community/barcode-scanner';

// Data
const $q = useQuasar();
const resultado = ref('');
let camera = 'environment';
const showCamera = ref(false);

// Methods
const prepareScan = async () => {
  await BarcodeScanner.prepare();
};

const onBackButton = () => {
  if (showCamera.value) {
    stopScan(); // Stop the scan (close the camera)
  } else {
  }
};

// Add an event listener for the backbutton event
onMounted(() => {
  document.addEventListener('backbutton', onBackButton);
});

const textInfo = computed(() => {
  return showCamera.value
    ? 'posiciona el código QR en el centro de la pantalla'
    : 'Presiona el botón y escanea el código QR';
});

const onDecode = async (content: string) => {
  resultado.value = content;
  turnCameraOff();
};

const turnCameraOff = () => {
  camera = 'off';
  showCamera.value = false;
};

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

const startScan = async (): Promise<void> => {
  showCamera.value = true; //
  await BarcodeScanner.checkPermission({ force: true });

  BarcodeScanner.hideBackground();

  const result: ScanResult = await BarcodeScanner.startScan(); // start scanning and wait for a result

  // if the result has content
  if (result.hasContent) {
    showCamera.value = false; //
    resultado.value = result.content; // this is the decoded string
  }
};

const stopScan = async (): Promise<void> => {
  BarcodeScanner.showBackground();
  BarcodeScanner.stopScan();
  turnCameraOff(); //
};

const hideBackground = () => {
  BarcodeScanner.hideBackground();
  return Promise.resolve();
};

const showBackground = () => {
  BarcodeScanner.showBackground();
  return Promise.resolve();
};

onDeactivated(() => {
  stopScan();
});

onBeforeUnmount(() => {
  stopScan();
});
</script>
