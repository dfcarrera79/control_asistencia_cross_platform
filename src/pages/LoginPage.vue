<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { Session } from '../components/models';
import { useAxios } from '../services/useAxios';
import { useMensajes } from '../services/useMensajes';
import type { ObjectError } from '../components/models';
import { deducirMensajeError } from '../utils/AppUtils';
import { handleResponse } from '../services/useHorarios';
import { LocalStorage, Loading, QSpinnerFacebook } from 'quasar';

const router = useRouter();
const authStore = useAuthStore();
const url = ref(authStore.url);
const { get, put } = useAxios();
const { mostrarMensaje } = useMensajes();
const mostrarVentana = ref(false);
const correoElectronico = ref('');
const ruc = ref('');
const id = ref('');
const clave = ref('');
const isPwd = ref(true);
const newUrl = ref(url.value.slice(url.value.indexOf('#') + 1));
const token = ref('');
const emailRule: ((v: string) => string | boolean)[] = [
  (v: string) => !!v || 'El correo electrónico es obligatorio',
  (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ||
    'Formato de correo electrónico inválido',
];

const codigo = ref(0);
const usuario = ref('');

onMounted(() => {
  const session: Session | null = LocalStorage.getItem('session');
  id.value = session?.login || '';
  usuario.value = session?.usuario || '';
  codigo.value = session?.codigo || 0;
  token.value = session?.token || '';

  if (session) {
    authStore.iniciarSesion(token.value, codigo.value, usuario.value, id.value);
    router.push(newUrl.value);
  }
});

const logearse = async () => {
  if (id.value.trim().length === 0) {
    mostrarMensaje(
      'Error',
      'Es necesario ingresar su nombre de usuario para continuar'
    );
    return;
  }
  if (clave.value.trim().length === 0) {
    mostrarMensaje('Error', 'Es obligatorio ingresar su clave de acceso');
    return;
  }
  Loading.show({
    spinner: QSpinnerFacebook,
    message: 'Verificando acceso...',
  });
  const respuesta = await get('/validar_usuario', {
    id: id.value,
    clave: clave.value,
    sys: 0,
  });

  if (respuesta.error === 'S') {
    handleResponse(respuesta);
    Loading.hide();
    return;
  }

  let objetos;
  let objetos2;
  if (respuesta.error === 'N') {
    objetos = respuesta.objetos[0];

    const respuesta2 = await get('/obtener_empleado_app', {
      id: objetos.codigo,
    });

    if (respuesta2.error === 'S') {
      handleResponse(respuesta2);
      Loading.hide();
      return;
    }

    objetos2 = respuesta2.objetos[0];
  }

  authStore.actualizarDatos(
    objetos.usu_nomape,
    objetos2.codigo,
    objetos.usu_login
  );
  Loading.hide();
  if (respuesta.error === 'S') {
    mostrarMensaje('Error', respuesta.mensaje);
    return;
  }
  authStore.iniciarSesion(
    respuesta.token,
    objetos2.codigo,
    objetos.usu_nomape,
    objetos.usu_login
  );
  router.push('/');
};

const recuperarContraseña = () => {
  mostrarVentana.value = true;
};

const enviarCorreoRecuperacion = async () => {
  try {
    const response = await put(
      '/resetear_clave_acceso',
      {},
      JSON.parse(
        JSON.stringify({
          email: correoElectronico.value,
          ruc: ruc.value,
        })
      )
    );

    // Handle the response accordingly
    if (response.error === 'N') {
      mostrarMensaje(
        'Su nueva clave ha sido enviada a su correo electrónico. Por favor, revise la carpeta de spam si no la encuentra en la bandeja de entrada.',
        response.mensaje
      );
      handleCerrarDialogo();
      return;
    }

    if (response.error === 'S') {
      mostrarMensaje('Error', response.mensaje);
      return;
    }
  } catch (error) {
    deducirMensajeError(error as ObjectError);
  }
};

const handleCerrarDialogo = () => {
  ruc.value = '';
  mostrarVentana.value = false;
  correoElectronico.value = '';
};
</script>

<template>
  <q-page padding class="flex flex-center bg-image">
    <q-dialog v-model="mostrarVentana" persistent>
      <q-card style="width: 250px">
        <div class="row bg-blue-8 justify-center q-pa-xs">
          <span
            class="text-h6 text-center text-white"
            style="font-family: 'Bebas Neue'"
            >Cambiar clave de acceso</span
          >
        </div>
        <q-card-section>
          <q-input
            v-model="ruc"
            debounce="750"
            label="Login (Nombre de usuario)"
            dense
          />
          <q-input
            v-model="correoElectronico"
            debounce="1000"
            label="Email"
            dense
            :rules="emailRule"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            color="primary"
            label="Enviar"
            @click="enviarCorreoRecuperacion()"
          />
          <q-btn flat label="Cerrar" @click="handleCerrarDialogo" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-card class="shadow-8 bg-white" style="width: 300px; height: 260px">
      <div class="row bg-blue-8 justify-center q-pa-xs">
        <span
          class="text-h6 text-center text-white"
          style="font-family: 'Bebas Neue'"
          >CONTROL DE ASISTENCIA APP V0.1</span
        >
      </div>
      <div class="row">
        <div class="column col-xs-12 q-pa-sm">
          <q-input v-model="id" type="text" label="Usuario" dense />
        </div>
        <div class="column col-xs-12 q-pa-sm">
          <q-input
            v-model="clave"
            dense
            :type="isPwd ? 'password' : 'text'"
            label="Clave de acceso"
            @keyup.enter="logearse()"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
        </div>
      </div>
      <q-separator dark />
      <div class="row">
        <div class="column col-xs-12 q-pa-sm">
          <q-btn
            class="full-width text-white"
            style="height: 40px"
            color="primary"
            label="Ingresar"
            @click="logearse()"
          />
        </div>
      </div>

      <div class="row">
        <div class="column col-xs-12 q-pa-sm">
          <a
            class="full-width text-secondary q-link"
            style="
              display: block;
              height: 40px;
              line-height: 40px;
              text-align: center;
            "
            @click="recuperarContraseña()"
          >
            <span class="text-bold text-blue-grey"
              >¿OLVIDASTE TU CONTRASEÑA?</span
            >
          </a>
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<style>
.hover-primary:hover {
  color: #1976d2;
}
.bg-image {
  background-image: url('../assets/background.jpg');
  background-repeat: repeat;
  background-size: cover;
}
</style>
