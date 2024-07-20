<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useAxios } from '../services/useAxios';
import { useMensajes } from '../services/useMensajes';

// Datos
const isPwd = ref(true);
const { put } = useAxios();
const newPassword = ref('');
const confirmPassword = ref('');
const authStore = useAuthStore();
const { mostrarMensaje } = useMensajes();
const claveActualizada = ref({
  login: '',
  clave: '',
});
const login = authStore.login;

const reset = () => {
  newPassword.value = '';
  confirmPassword.value = '';
};

const changePassword = async (code: string) => {
  // Perform password validation
  claveActualizada.value = {
    login: code,
    clave: newPassword.value,
  };
  if (newPassword.value === confirmPassword.value) {
    const response = await put(
      '/cambiar_clave',
      {},
      JSON.parse(JSON.stringify(claveActualizada.value))
    );
    mostrarMensaje('Éxito', response.mensaje);
    reset();
  } else {
    mostrarMensaje('Error', 'Las contraseñas no coinciden');
  }
};
</script>

<template>
  <q-page padding>
    <div class="update-password">
      <h4
        class="row text-uppercase text-grey-8 justify-center items-center content-center q-pa-md text-center"
        style="font-family: 'Bebas Neue'"
      >
        <div class="q-pt-md">Cambiar Contraseña</div>
      </h4>

      <q-form @submit="changePassword(login)" class="q-gutter-md q-px-md">
        <q-input
          outlined
          dense
          v-model="newPassword"
          label="Nueva contraseña"
          lazy-rules
          :rules="[
            (val) => (val && val.length > 0) || 'Debe ingresar una contraseña',
          ]"
        >
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>

        <q-input
          outlined
          dense
          :type="isPwd ? 'password' : 'text'"
          v-model="confirmPassword"
          label="Confirmar contraseña"
          lazy-rules
          :rules="[
            (val) => (val && val.length > 0) || 'Debe ingresar una contraseña',
          ]"
        >
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>

        <div>
          <q-btn label="Cambiar contraseña" type="submit" color="primary" />
        </div>
      </q-form>
    </div>
  </q-page>
</template>

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
}
</style>
