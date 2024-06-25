<template>
  <q-page>
    <capacitor-google-map ref="mapRef"></capacitor-google-map>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Geolocation } from '@capacitor/geolocation';
import { GoogleMap, Marker } from '@capacitor/google-maps';

// Data
const mapRef = ref<HTMLElement | null>(null);
let newMap: GoogleMap | null = null;

// Define el array de marcadores
const markers = [
  {
    id: 1,
    lng: -79.2111903099063,
    lat: -3.992406066572435,
    title: 'Marcador 1',
    snippet: 'Descripción del Marcador 1',
  },
  {
    id: 2,
    lng: -79.20759182752107,
    lat: -4.027215353340831,
    title: 'Marcador 2',
    snippet: 'Descripción del Marcador 2',
  },
  // Agrega más pares de coordenadas aquí si es necesario
];

// Methods
const getCurrentPosition = async () => {
  const coordinates = await Geolocation.getCurrentPosition();
  return {
    lat: coordinates.coords.latitude,
    lng: coordinates.coords.longitude,
  };
};

const createMap = async (position: { lat: number; lng: number }) => {
  if (mapRef.value) {
    newMap = await GoogleMap.create({
      id: 'mapa',
      element: mapRef.value,
      apiKey: 'AIzaSyDdKx33PF_wfd9qd8YkiL_7MuLMbfe__ic',
      config: {
        center: position,
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
        title: marker.title,
        snippet: marker.snippet,
      });
    });

    // Habilitar ubicación actual y botones de zoom
    await newMap.enableCurrentLocation(true);
    await newMap.setCamera({
      coordinate: position,
      zoom: 14,
    });
    // Habilitar capa de tráfico
    await newMap.enableTrafficLayer(true);

    newMap.setOnMarkerClickListener(async (marker) => {
      console.log('Marcador clicado:', JSON.stringify(marker));
      // Aquí podrías implementar acciones adicionales, como abrir un popup con detalles del marcador
    });
  }
};

onMounted(async () => {
  const position = await getCurrentPosition();
  createMap(position);
});

onUnmounted(async () => {
  if (newMap) {
    await newMap.destroy();
    newMap = null;
  }
});
</script>

<style scoped lang="scss">
capacitor-google-map {
  display: block;
  width: 100%;
  height: 100vh; // Viewport height - ajusta al alto completo del viewport
}
</style>
