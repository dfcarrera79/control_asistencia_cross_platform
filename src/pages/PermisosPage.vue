<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Plugins } from '@capacitor/core';

const { Camera } = Plugins;
const { Geolocation } = Plugins;

const cameraPermission = ref(false);
const locationPermission = ref(false);

const checkCameraPermission = async () => {
  const result = await Camera.checkPermissions();
  if (result.camera === 'granted') {
    cameraPermission.value = true;
  } else {
    cameraPermission.value = false;
  }
};

const checkLocationPermission = async () => {
  const result = await Geolocation.checkPermissions();
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

const toggleLocationPermission = async () => {
  if (locationPermission.value) {
    // Si ya tiene permiso, puedes revocarlo aquí
    await Geolocation.requestPermissions({
      permissions: ['location'],
      revoke: true,
    });
    locationPermission.value = false;
  } else {
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

<template>
  <h4
    class="row text-uppercase text-grey-8 justify-center items-center content-center q-pa-md text-center"
    style="font-family: 'Bebas Neue'"
  >
    <div class="q-pt-md">Permisos</div>
  </h4>

  <div class="q-pa-md text-subtitle1 text-grey-8">
    <strong>Permitido</strong>
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
    <strong>No permitido</strong>
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
