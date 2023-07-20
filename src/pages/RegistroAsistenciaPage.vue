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

        <p class="text-subtitle1" v-if="resultado">
          Último resultado: <b>{{ resultado }}</b>
        </p>
        <div v-if="showCamera">
          <qrcode-stream :camera="camera" @decode="onDecode"> </qrcode-stream>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onDeactivated, onBeforeUnmount, ref } from 'vue';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { QrcodeStream } from 'vue-qrcode-reader';

let camera = 'environment';
const showCamera = ref(false);
const resultado = ref('');

// Function to handle the backbutton event
const onBackButton = () => {
  if (showCamera.value) {
    stopScan();
  } else {
    // Do nothing
  }
};

// Add an event listener for the backbutton event
document.addEventListener('backbutton', onBackButton);

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

const stopScan = () => {
  BarcodeScanner.showBackground();
  BarcodeScanner.stopScan();
  turnCameraOff();
};

const startScan = async () => {
  showCamera.value = true;
  // Check camera permission
  // This is just a simple example, check out the better checks below
  await BarcodeScanner.checkPermission({ force: true });

  // make background of WebView transparent
  // note: if you are using ionic this might not be enough, check below
  BarcodeScanner.hideBackground();

  const result = await BarcodeScanner.startScan(); // start scanning and wait for a result

  // if the result has content
  if (result.hasContent) {
    resultado.value = result.content; // this is the decoded string
  }
};

onDeactivated(() => {
  stopScan();
});

onBeforeUnmount(() => {
  stopScan();
});
</script>

<style scoped>
/* .validation-success,
.validation-failure,
.validation-pending {
  position: absolute;
  width: 100%;
  height: 100%;

  background-color: rgba(255, 255, 255, .8);
  text-align: center;
  font-weight: bold;
  font-size: 1.4rem;
  padding: 10px;

  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
}
.validation-success {
  color: green;
}
.validation-failure {
  color: red;
} */
</style>
