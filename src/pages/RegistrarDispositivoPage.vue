<template>
  <h4
    class="row text-uppercase text-grey-8 justify-center items-center content-center q-pa-md text-center"
    style="font-family: 'Bebas Neue'"
  >
    <div class="q-pt-md">{{ textInfo }}</div>
  </h4>

  <div class="row justify-center">
    <q-btn
      color="primary"
      rounded
      icon="phone_android"
      label="Registrar dispositivo"
      size="lg"
      @click="registrarDispositivo"
      v-show="!check"
    />
  </div>
</template>
<script setup lang="ts">
import { useQuasar, LocalStorage } from 'quasar';
import { Device } from '@capacitor/device';
import { useAuthStore } from '../stores/auth';
import { computed, onMounted, ref } from 'vue';
import { DeviceId } from '../components/models';
import { useAxios } from '../services/useAxios';

// Data
const id = ref('');
const $q = useQuasar();
const check = ref(false);
const { get, post } = useAxios();
const authStore = useAuthStore();
const session = ref();

// Methods
const logDeviceInfo = async () => {
  const info: DeviceId = await Device.getId();
  return info.identifier;
};

onMounted(async () => {
  id.value = await logDeviceInfo();
  const respuesta = await get('/validar_dispositivo', {
    id: id.value,
  });
  if (respuesta.error === 'N') {
    check.value = true;
  } else {
    console.error(respuesta.mensaje);
    check.value = false;
  }
});

const registrarDispositivo = async () => {
  try {
    const response = await post(
      '/registrar_dispositivo',
      {},
      JSON.parse(
        JSON.stringify({
          usuario_codigo: authStore.codigo,
          id_dispositivo: id.value,
        })
      )
    );

    if (response.error === 'N') {
      check.value = true;
    }
    // Handle the response accordingly
    $q.notify({
      color: response.error === 'N' ? 'green-4' : 'red-5',
      textColor: 'white',
      icon: response.error === 'N' ? 'cloud_done' : 'warning',
      message: response.mensaje,
    });
  } catch (error) {
    console.error('Error registrando el dispositivo:', error);
  }
};

// Computed
const textInfo = computed(() => {
  return check.value
    ? 'El dispositivo ya se encuentra registrado'
    : 'Registrar dispositivo';
});

onMounted(() => {
  session.value = LocalStorage.getItem('session');
});
</script>
