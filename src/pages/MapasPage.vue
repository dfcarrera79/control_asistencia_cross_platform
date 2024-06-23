<script setup>
import { useQuasar } from 'quasar';
import { Geolocation } from '@capacitor/geolocation';
import { Map, MapStyle, Marker, config } from '@maptiler/sdk';
import { ref, shallowRef, onMounted, onUnmounted, markRaw } from 'vue';
import '@maptiler/sdk/dist/maptiler-sdk.css';

const mapContainer = shallowRef(null);
const map = shallowRef(null);
const markers = [
  { lng: -79.2111903099063, lat: -3.992406066572435 },
  { lng: -79.20759182752107, lat: -4.027215353340831 },
  // Añade más pares de coordenadas aquí
];
const newPos = ref({
  latitude: 0,
  longitude: 0,
  timestamp: 0,
});
const $q = useQuasar();

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
    console.log('[newPos]: ', JSON.stringify(newPos.value));
  } else {
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: '¡Debe chequear los permisos de gps en las configuraciones!',
      timeout: 10000,
    });
  }
};

onMounted(() => {
  config.apiKey = 'llTfCTzrez9pd2oFRaHi';

  const initialState = {
    lng: -79.20436829744078,
    lat: -4.005623246897199,
    zoom: 14,
  };

  map.value = markRaw(
    new Map({
      container: mapContainer.value,
      style: MapStyle.STREETS,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
    })
  );

  markers.forEach(({ lng, lat }) => {
    new Marker({ color: '#FF0000' }).setLngLat([lng, lat]).addTo(map.value);
  });
  printCurrentPosition();
}),
  onUnmounted(() => {
    map.value?.remove();
  });
</script>

<template>
  <div class="map-wrap">
    <div class="map" ref="mapContainer"></div>
  </div>
</template>

<style scoped>
.map-wrap {
  position: relative;
  width: 100%;
  height: calc(
    100vh - 77px
  ); /* calculate height of the screen minus the heading */
}

.map {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
