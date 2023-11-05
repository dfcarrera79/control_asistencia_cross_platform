<template>
  <h4
    class="row text-uppercase text-grey-8 justify-center items-center content-center q-pa-md text-center"
    style="font-family: 'Bebas Neue'"
  >
    <div class="q-pt-md">Permisos</div>
  </h4>

  <div class="q-pa-md text-subtitle1 text-grey-8">
    <p><strong>Permitido</strong></p>
    <div class="row items-center" v-if="cameraPermission">
      <div>
        <q-icon color="primary" name="photo_camera" />
        <span class="q-pl-sm">Cámara</span>
      </div>
    </div>

    <div class="row items-center" v-if="locationPermission">
      <div>
        <q-icon color="primary" name="location_on" />
        <span class="q-pl-sm">Ubicación</span>
      </div>
    </div>
  </div>

  <br />
  <div class="q-pa-md text-subtitle1 text-grey-8">
    <p><strong>No permitido</strong></p>
    <div class="q-pb-sm row items-center" v-if="!cameraPermission">
      <div>
        <q-icon name="photo_camera" />
        <span class="q-pl-sm">Cámara</span>
      </div>
      <div class="q-pl-sm">
        <q-btn
          dense
          no-caps
          outline
          color="primary"
          label="Habilitar"
          @click="toggleCameraPermission"
        />
      </div>
    </div>

    <div class="row items-center" v-if="!locationPermission">
      <div>
        <q-icon name="location_on" />
        <span class="q-pl-sm">Ubicación</span>
      </div>
      <div class="q-pl-sm">
        <q-btn
          dense
          no-caps
          outline
          color="primary"
          label="Habilitar"
          @click="toggleLocationPermission"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Plugins } from '@capacitor/core';

const { Camera } = Plugins;
const { Geolocation } = Plugins;

const cameraPermission = ref(false);
const locationPermission = ref(false);

const checkCameraPermission = async () => {
  const result = await Camera.checkPermissions();
  console.log('[CAMARA]: ', JSON.stringify(result.camera));
  if (result.camera === 'granted') {
    cameraPermission.value = true;
  } else {
    cameraPermission.value = false;
  }
};

const checkLocationPermission = async () => {
  const result = await Geolocation.checkPermissions();
  console.log('[GPS]: ', JSON.stringify(result));
  if (result.location === 'granted') {
    locationPermission.value = true;
  } else {
    locationPermission.value = false;
  }
};

const toggleCameraPermission = async () => {
  if (cameraPermission.value) {
    // Si ya tiene permiso, puedes revocarlo aquí
    await Camera.requestPermissions({ permissions: ['camera'], revoke: true });
    cameraPermission.value = false;
  } else {
    // Si no tiene permiso, solicítalo nuevamente
    await Camera.requestPermissions({ permissions: ['camera'] });
    cameraPermission.value = true;
  }
};

// const toggleLocationPermission = async () => {
//   if (locationPermission.value) {
//     // If already have permission, you can revoke it here
//     try {
//       await Geolocation.requestPermissions({
//         permissions: ['geolocation'],
//         revoke: true,
//       });
//       locationPermission.value = false;
//     } catch (error) {
//       console.error('Error requesting geolocation permission:', error);
//       // Handle the error as needed
//     }
//   } else {
//     console.log('[DIO CLICK]');
//     // If no permission, request it again
//     // await Geolocation.requestPermissions({ permissions: ['geolocation'] });
//     // locationPermission.value = true;
//     try {
//       await Geolocation.requestPermissions({ permissions: ['geolocation'] });
//       locationPermission.value = true;
//     } catch (error) {
//       console.error('Error requesting geolocation permission:', error);
//       // Handle the error as needed
//     }
//   }
// };

const toggleLocationPermission = async () => {
  if (locationPermission.value) {
    // Si ya tiene permiso, puedes revocarlo aquí
    await Geolocation.requestPermissions({
      permissions: ['location'],
      revoke: true,
    });
    locationPermission.value = false;
  } else {
    console.log('[DIO CLICK]');
    // Si no tiene permiso, solicítalo nuevamente
    await Geolocation.requestPermissions({ permissions: ['location'] });
    locationPermission.value = true;
  }
};

onMounted(() => {
  checkCameraPermission();
  checkLocationPermission();
});
</script>
