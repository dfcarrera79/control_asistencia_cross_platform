import { defineStore } from 'pinia';
import { LocalStorage } from 'quasar';

export const useAuthStore = defineStore('counter', {
  state: () => ({
    usuario: '',
    ruc: '',
    API_URL: process.env.API_URL,
    estaLogeado: false,
    url: window.location.href,
    token: '',
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
  },

  actions: {
    iniciarSesion(token: string) {
      this.estaLogeado = true;
      this.token = token;
      LocalStorage.set('session', {
        estaLogeado: this.estaLogeado,
        currentURL: this.url,
        token: this.token,
        ruc: this.ruc,
        usuario: this.usuario,
      });
    },
  },
});
