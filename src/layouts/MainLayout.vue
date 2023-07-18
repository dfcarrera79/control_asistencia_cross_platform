<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title
          class="text-h4 row text-uppercase"
          style="font-family: 'Bebas Neue'"
        >
          Control de asistencia
        </q-toolbar-title>

        <div>{{ expires }}</div>

        <div class="row items-center content-center q-mr-md">
          <q-btn flat @click="cerrarSesion">
            <div class="q-mr-sm" v-if="!($q.screen.lt.md || $q.screen.lt.sm)">
              Salir
            </div>
            <q-icon left name="logout" />
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EssentialLink, {
  EssentialLinkProps,
} from 'components/EssentialLink.vue';
import { LocalStorage } from 'quasar';
import { useAuthStore } from '../stores/auth';
import jwtDecode from 'jwt-decode';

const win: Window = window;
const authStore = useAuthStore();
const expires = ref('');

const cerrarSesion = () => {
  win.location = 'https://www.loxasoluciones.com/';
  LocalStorage.clear();
};

const checkTokenExpiration = () => {
  const token = authStore.token;
  const decodedToken = jwtDecode(token);
  const expirationTimestamp = decodedToken.exp;
  const currentTime = Math.floor(Date.now() / 1000); // Current timestamp in seconds
  const tokenExpirationTime = expirationTimestamp - currentTime;

  if (decodedToken.exp < currentTime) {
    // Token has expired, log the user out
    cerrarSesion();
  } else {
    // Calculate remaining time
    const remainingTime = tokenExpirationTime * 1000; // Convert to milliseconds

    const remainingMinutes = Math.floor(remainingTime / 60000); // 1 minute = 60,000 milliseconds
    const remainingSeconds = Math.floor((remainingTime % 60000) / 1000); // Remaining seconds

    expires.value = `Token expires in ${remainingMinutes} minutes and ${remainingSeconds} seconds`;
  }
};

// Check token expiration every 5 minutes (300,000 milliseconds)
const tokenExpirationCheckInterval = setInterval(checkTokenExpiration, 300000);

checkTokenExpiration();

const essentialLinks: EssentialLinkProps[] = [
  {
    title: 'Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev',
  },
  {
    title: 'Github',
    caption: 'github.com/quasarframework',
    icon: 'code',
    link: 'https://github.com/quasarframework',
  },
  {
    title: 'Discord Chat Channel',
    caption: 'chat.quasar.dev',
    icon: 'chat',
    link: 'https://chat.quasar.dev',
  },
  {
    title: 'Forum',
    caption: 'forum.quasar.dev',
    icon: 'record_voice_over',
    link: 'https://forum.quasar.dev',
  },
  {
    title: 'Twitter',
    caption: '@quasarframework',
    icon: 'rss_feed',
    link: 'https://twitter.quasar.dev',
  },
  {
    title: 'Facebook',
    caption: '@QuasarFramework',
    icon: 'public',
    link: 'https://facebook.quasar.dev',
  },
  {
    title: 'Quasar Awesome',
    caption: 'Community Quasar projects',
    icon: 'favorite',
    link: 'https://awesome.quasar.dev',
  },
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
