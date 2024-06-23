<template>
  <capacitor-google-map ref="mapRef"></capacitor-google-map>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { GoogleMap, Marker } from '@capacitor/google-maps';

const mapRef = ref<HTMLElement | null>(null);
let newMap: GoogleMap | null = null;

// Define el array de marcadores
const markers = [
  { lng: -79.2111903099063, lat: -3.992406066572435 },
  { lng: -79.20759182752107, lat: -4.027215353340831 },
  // Agrega más pares de coordenadas aquí si es necesario
];

const createMap = async () => {
  if (mapRef.value) {
    newMap = await GoogleMap.create({
      id: 'my-cool-map',
      element: mapRef.value,
      apiKey: 'AIzaSyDdKx33PF_wfd9qd8YkiL_7MuLMbfe__ic',
      config: {
        center: {
          lat: -4.005623246897199,
          lng: -79.20436829744078,
        },
        zoom: 14,
      },
    });

    // Itera sobre el array de markers y añade cada marcador al mapa
    markers.forEach((marker) => {
      newMap?.addMarker({
        coordinate: {
          lat: marker.lat,
          lng: marker.lng,
        },
      });
    });
  }
};

onMounted(() => {
  createMap();
});

onUnmounted(async () => {
  if (newMap) {
    await newMap.destroy();
    newMap = null;
  }
});
</script>

<style scoped>
capacitor-google-map {
  display: block;
  width: 100%;
  height: 100vh; /* Viewport height - ajusta al alto completo del viewport */
}
</style>
