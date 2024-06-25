<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { LocalStorage } from 'quasar';
import { Session } from '../components/models';

const router = useRouter();
const authStore = useAuthStore();
const usuario = ref('');

// Methods
onMounted(() => {
  const session: Session | null = LocalStorage.getItem('session');
  usuario.value = session?.usuario || '';
});

const cerrarSesion = () => {
  authStore.estaLogeado = false;
  router.push('/login');
  LocalStorage.clear();
};

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
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
              {{ usuario }}
            </div>
            <q-separator inset />
          </q-item>

          <q-item clickable v-ripple to="/" active-class="my-menu-link">
            <q-item-section avatar>
              <q-icon name="home" color="grey-9" />
            </q-item-section>

            <q-item-section>
              <span
                class="text-grey-9 text-h6"
                style="font-family: 'Bebas Neue'"
              >
                PÁGINA DE INICIO
              </span>
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/permisos" active-class="my-menu-link">
            <q-item-section avatar>
              <q-icon name="check_box" color="grey-9" />
            </q-item-section>

            <q-item-section>
              <span
                class="text-grey-9 text-h6"
                style="font-family: 'Bebas Neue'"
              >
                PERMISOS
              </span>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/registro_facial"
            active-class="my-menu-link"
          >
            <q-item-section avatar>
              <q-icon name="camera_front" color="grey-9" />
            </q-item-section>

            <q-item-section>
              <span
                class="text-grey-9 text-h6"
                style="font-family: 'Bebas Neue'"
              >
                REGISTRO FACIAL
              </span>
            </q-item-section>
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
              <div class="row">
                <q-icon size="1.5em" name="arrow_right" color="grey-9" />
                <q-icon size="1.5em" name="timer" color="grey-9" />
              </div>
            </q-item-section>

            <q-item-section>
              <span
                class="text-grey-9 text-h6"
                style="font-family: 'Bebas Neue'"
              >
                REGISTRAR ENTRADA
              </span>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/registro_salida"
            active-class="my-menu-link"
          >
            <q-item-section avatar>
              <div class="row">
                <q-icon size="1.5em" name="arrow_left" color="grey-9" />
                <q-icon size="1.5em" name="timer" color="grey-9" />
              </div>
            </q-item-section>

            <q-item-section>
              <span
                class="text-grey-9 text-h6"
                style="font-family: 'Bebas Neue'"
              >
                REGISTRAR SALIDA
              </span>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/registrar_entrada_salida"
            active-class="my-menu-link"
          >
            <q-item-section avatar>
              <div class="row">
                <q-icon size="1.5em" name="timer" color="grey-9" />
              </div>
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
            to="/registrar_cliente"
            active-class="my-menu-link"
          >
            <q-item-section avatar>
              <div class="row">
                <q-icon size="1.5em" name="my_location" color="grey-9" />
              </div>
            </q-item-section>

            <q-item-section>
              <span
                class="text-grey-9 text-h6"
                style="font-family: 'Bebas Neue'"
              >
                Registrar Cliente
              </span>
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/rutas" active-class="my-menu-link">
            <q-item-section avatar>
              <div class="row">
                <q-icon size="1.5em" name="alt_route" color="grey-9" />
              </div>
            </q-item-section>

            <q-item-section>
              <span
                class="text-grey-9 text-h6"
                style="font-family: 'Bebas Neue'"
              >
                Rutas
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
