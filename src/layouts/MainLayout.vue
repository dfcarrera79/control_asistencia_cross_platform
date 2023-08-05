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
          class="text-h5 row text-uppercase"
          style="font-family: 'Bebas Neue'"
        >
          Control de asistencia
        </q-toolbar-title>

        <div class="row items-center content-center q-mr-md">
          <q-btn dense flat round @click="cerrarSesion">
            <div class="q-mr-sm" v-if="!($q.screen.lt.md || $q.screen.lt.sm)">
              Salir
            </div>
            <q-icon left name="logout" />
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-scroll-area
        style="
          height: calc(100% - 150px);
          margin-top: 150px;
          border-right: 1px solid #ddd;
        "
      >
        <q-list padding>
          <q-item class="column">
            <q-separator inset />
            <div style="color: #636466" class="text-center">Bienvenido</div>
            <div class="text-weight-bold text-center" style="color: #636466">
              {{ appStore.usuario }}
            </div>
            <q-separator inset />
          </q-item>
          <q-item
            clickable
            v-ripple
            to="/registro_dispositivo"
            active-class="my-menu-link"
          >
            <q-item-section avatar>
              <q-icon name="perm_device_information" color="grey-9" />
            </q-item-section>

            <q-item-section>
              <span
                class="text-grey-9 text-h6"
                style="font-family: 'Bebas Neue'"
              >
                REGISTRAR DISPOSITIVO
              </span>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/registro_asistencia"
            active-class="my-menu-link"
          >
            <q-item-section avatar>
              <q-icon name="timer" color="grey-9" />
            </q-item-section>

            <q-item-section>
              <span
                class="text-grey-9 text-h6"
                style="font-family: 'Bebas Neue'"
              >
                REGISTRAR ENTRADA/SALIDA
              </span>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/cambiar_clave"
            active-class="my-menu-link"
          >
            <q-item-section avatar>
              <q-icon name="password" color="grey-9" />
            </q-item-section>

            <q-item-section>
              <span
                class="text-grey-9 text-h6"
                style="font-family: 'Bebas Neue'"
              >
                CAMBIAR CONTRASEÑA
              </span>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <q-img
        fit="fill"
        class="absolute-top q-pa-sm"
        src="../assets/loxasoluciones.png"
        style="height: 150px"
      />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { LocalStorage } from 'quasar';

const router = useRouter();
const appStore = useAuthStore();

const cerrarSesion = () => {
  appStore.estaLogeado = false;
  router.push('/login');
  LocalStorage.clear();
};

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
