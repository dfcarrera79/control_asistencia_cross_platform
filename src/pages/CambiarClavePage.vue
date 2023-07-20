<template>
  <div class="update-password">
    <h4
      class="row text-uppercase text-grey-8 justify-center content-center"
      style="font-family: 'Bebas Neue'"
    >
      <div class="q-pt-md">Cambiar constraseña</div>
    </h4>
    <div class="form-group q-px-md text-grey-8">
      <label for="newPassword">Nueva contraseña</label>
      <q-input
        id="newPassword"
        :type="isPwdNew ? 'password' : 'text'"
        v-model="newPassword"
        required
      >
        <template v-slot:append>
          <q-icon
            :name="isPwdNew ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwdNew = !isPwdNew"
          />
        </template>
      </q-input>
    </div>
    <div class="form-group q-px-md text-grey-8">
      <label for="confirmPassword">Confirmar contraseña</label>
      <q-input
        id="confirmPassword"
        :type="isPwdConfirm ? 'password' : 'text'"
        v-model="confirmPassword"
        required
      >
        <template v-slot:append>
          <q-icon
            :name="isPwdConfirm ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwdConfirm = !isPwdConfirm"
          />
        </template>
      </q-input>
    </div>
    <div class="row justify-center">
      <q-btn
        class="text-white"
        dense
        style="height: 40px; width: 183px"
        color="primary"
        label="Cambiar contraseña"
        @click="changePassword()"
        :disabled="!passwordsMatch || newPassword === ''"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useAxios } from '../services/useAxios';
import { Respuesta } from '../components/models';
import { useMensajes } from '../services/useMensajes';

// Data
const { put } = useAxios();
const newPassword = ref('');
const confirmPassword = ref('');
const authStore = useAuthStore();
const { mostrarMensaje } = useMensajes();
const claveActualizada = ref({
  ruc: '',
  clave: '',
});
const $q = useQuasar();
const isPwdNew = ref(true);
const isPwdConfirm = ref(true);

// Methods
const deducirMensaje = (resp: Respuesta) => {
  $q.notify({
    color: resp.error === 'N' ? 'green-4' : 'red-5',
    textColor: 'white',
    icon: resp.error === 'N' ? 'cloud_done' : 'warning',
    message: resp.mensaje,
  });
};

const changePassword = async () => {
  // Perform password validation
  claveActualizada.value = {
    ruc: authStore.ruc,
    clave: newPassword.value,
  };
  if (newPassword.value === confirmPassword.value) {
    const respuesta = await put(
      '/cambiar_clave',
      {},
      JSON.parse(JSON.stringify(claveActualizada.value))
    );
    deducirMensaje(respuesta);
    newPassword.value = '';
    confirmPassword.value = '';
  } else {
    mostrarMensaje('Error', 'Las contraseñas no coinciden');
  }
};

// Computed
const passwordsMatch = computed(
  () => newPassword.value === confirmPassword.value
);
</script>

<style scoped>
.update-password {
  max-width: 400px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  font-weight: bold;
}

input[type='password'] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>
