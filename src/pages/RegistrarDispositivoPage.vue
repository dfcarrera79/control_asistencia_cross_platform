<script setup lang="ts">
import { LocalStorage } from 'quasar';
import { Device } from '@capacitor/device';
import { useAuthStore } from '../stores/auth';
import { computed, onMounted, ref } from 'vue';
import { DeviceId } from '../components/models';
import { useAxios } from '../services/useAxios';
import { useMensajes } from '../services/useMensajes';
import { deducirMensajeError } from '../utils/AppUtils';
import type { ObjectError } from '../components/models';
import { handleResponse } from '../services/useHorarios';

// Data
const id = ref('');
const check = ref(false);
const { get, post } = useAxios();
const authStore = useAuthStore();
const session = ref();
const { mostrarMensaje } = useMensajes();

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
    mostrarMensaje('Error', respuesta.mensaje);
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
    handleResponse(response.mensaje);
  } catch (error) {
    deducirMensajeError(error as ObjectError);
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

<template>
  <q-page padding class="page-container">
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
  </q-page>
</template>

<style scoped lang="scss">
@import '../css/page.container.scss';
</style>
