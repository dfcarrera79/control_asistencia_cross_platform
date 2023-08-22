import { defineStore } from 'pinia';
import { LocalStorage } from 'quasar';

export const useAuthStore = defineStore('counter', {
  state: () => ({
    usuario: '',
    codigo: 0,
    API_URL: process.env.API_URL,
    estaLogeado: false,
    url: window.location.href,
    token: '',
    login: '',
  }),

  getters: {
    getURLApi(state) {
      return state.API_URL;
    },
    getHttpHeaders(state) {
      return {
        'Content-Type': 'application/json',
        token: state.token,
      };
    },
    getCodigo(state) {
      return state.codigo;
    },
    getUsuario(state) {
      return state.usuario;
    },
  },

  actions: {
    iniciarSesion(
      token: string,
      codigo: number,
      usuario: string,
      login: string
    ) {
      this.estaLogeado = true;
      this.token = token;
      this.codigo = codigo;
      this.usuario = usuario;
      this.login = login;
      LocalStorage.set('session', {
        estaLogeado: this.estaLogeado,
        currentURL: this.url,
        token: this.token,
        usuario: this.usuario,
        codigo: this.codigo,
        login: this.login,
      });
    },
    actualizarDatos(newUsuario: string, newCodigo: number, newLogin: string) {
      this.usuario = newUsuario;
      this.codigo = newCodigo;
      this.login = newLogin;
    },
  },
});
