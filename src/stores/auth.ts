import { defineStore } from 'pinia';
import { LocalStorage } from 'quasar';
import { computed, ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const usuario = ref('');
  const codigo = ref(0);
  const appCodigo = ref(0);
  // const API_URL = ref(process.env.API_URL);
  const estaLogeado = ref(false);
  const url = ref(window.location.href);
  const token = ref('');
  const login = ref('');

  const API_URL = computed(() => {
    return appCodigo.value == 1
      ? process.env.API_URL_LOCAL
      : process.env.API_URL;
  });

  const PATH = computed(() => `${API_URL.value}/static`);

  const getURLApi = computed(() => API_URL.value);

  const getHttpHeaders = computed(() => ({
    'Content-Type': 'application/json',
    token: token.value,
  }));

  const getCodigo = computed(() => codigo.value);

  const getUsuario = computed(() => usuario.value);

  const iniciarSesion = (
    newToken: string,
    newCodigo: number,
    newAppCodigo: number,
    newUsuario: string,
    newLogin: string
  ) => {
    estaLogeado.value = true;
    token.value = newToken;
    codigo.value = newCodigo;
    appCodigo.value = newAppCodigo;
    usuario.value = newUsuario;
    login.value = newLogin;
    LocalStorage.set('session', {
      estaLogeado: estaLogeado.value,
      currentURL: url.value,
      token: token.value,
      usuario: usuario.value,
      codigo: codigo.value,
      appCodigo: appCodigo.value,
      login: login.value,
    });
  };

  const cerrarSesion = () => {
    estaLogeado.value = false;
    token.value = '';
    usuario.value = '';
    codigo.value = 0;

    LocalStorage.set('session', {
      estaLogeado: estaLogeado.value,
      currentURL: url.value,
      token: token.value,
      usuario: usuario.value,
      codigo: codigo.value,
      appCodigo: appCodigo.value,
      login: login.value,
    });
  };

  const actualizarDatos = (
    newUsuario: string,
    newCodigo: number,
    newLogin: string
  ) => {
    usuario.value = newUsuario;
    codigo.value = newCodigo;
    login.value = newLogin;
  };

  return {
    usuario,
    codigo,
    appCodigo,
    API_URL,
    PATH,
    estaLogeado,
    url,
    token,
    login,
    getURLApi,
    getHttpHeaders,
    getCodigo,
    getUsuario,
    cerrarSesion,
    iniciarSesion,
    actualizarDatos,
  };
});
