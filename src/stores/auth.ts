import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { LocalStorage } from 'quasar';
import { Empresa } from '../components/comun/empresaModel';
import { Servidor } from '../components/comun/servidorModel';

export const useAuthStore = defineStore('auth', () => {
  const usuario = ref('');
  const codigo = ref(0);
  const appCodigo = ref(0);
  const empresaCodigo = ref(0);
  const empresasRegistradas = ref(0);
  const estaLogeado = ref(false);
  const url = ref(window.location.href);
  const token = ref('');
  const login = ref('');
  const IMAGE_PATH = ref(
    '/opt/control-asistencia/control_asistencia_api/src/public/fotos'
  );
  const servidores = ref<Servidor[]>([
    {
      id: 1,
      nombre: 'LoxaSoluciones 1',
      urlDesarrollo: 'http://192.168.50.14:8080/apisage/webresources/empresas',
      urlApiSSL:
        'https://www.loxasoluciones-cloud.com:8181/apisage/webresources/empresas',
      urlApi:
        'https://www.loxasoluciones-cloud.com:8181/apisage/webresources/empresas',
    },
    // {
    //   id: 2,
    //   nombre: 'PIÑAS INTERPROVINCIAL',
    //   urlDesarrollo: 'http://192.168.50.14:8080/apisage/webresources/empresas',
    //   urlApiSSL:
    //     'http://www.loxasoluciones-cloud1.com:8080/apisage/webresources/empresas',
    //   urlApi:
    //     'http://www.loxasoluciones-cloud1.com:8080/apisage/webresources/empresas',
    // },
    // {
    //   id: 3,
    //   nombre: 'CIFA INTERNACIONAL',
    //   urlDesarrollo: 'http://192.168.50.14:8080/apisage/webresources/empresas',
    //   urlApiSSL: 'http://181.39.106.50:8080/apisage/webresources/empresas',
    //   urlApi: 'http://181.39.106.50:8080/apisage/webresources/empresas',
    // },
  ]);
  const servidor = ref<Servidor>(servidores.value[0]);
  const apiEmpresas = ref(servidor.value.urlApiSSL);
  const empresa = ref<Empresa | null>(null);
  const empresaCero = ref<Empresa>({
    codigo_empresa: 0,
    ruc: '',
    index: 0,
    razon_social: '',
    nombre_comercial: '',
    url_local_api: '',
    url_publico_api: '',
  });

  // const API_URL = computed(() => {
  //   return appCodigo.value == 1
  //     ? process.env.API_URL_LOCAL
  //     : process.env.API_URL;
  // });
  const API_URL = computed(() => {
    return appCodigo.value == 1
      ? empresa.value?.url_local_api
      : empresa.value?.url_publico_api;
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
    empresaCodigo,
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
    empresa,
    empresaCero,
    empresasRegistradas,
    servidor,
    servidores,
    apiEmpresas,
    IMAGE_PATH,
    cerrarSesion,
    iniciarSesion,
    actualizarDatos,
  };
});
