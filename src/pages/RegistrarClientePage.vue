<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { LocalStorage } from 'quasar';
import { Session } from '../components/models';
import { useAxios } from '../services/useAxios';
import { QTableProps, useQuasar } from 'quasar';
import { Geolocation } from '@capacitor/geolocation';
import type { ObjectError } from '../components/models';
import { deducirMensajeError } from '../utils/AppUtils';

interface GeoLocation {
  lat: number;
  long: number;
}

interface RespuestaCoordenadas {
  error: string;
  mensaje: string;
  objetos: GeoLocation[];
}

interface Selected {
  id_externo: number;
  usuario: string;
  lugar: string;
}

// Data
const newPos = ref({
  lat: 0,
  long: 0,
  timestamp: 0,
});
const $q = useQuasar();
const usuario = ref('');
const right = ref(false);
const confirm = ref(false);
const actualizar = ref(false);
const { get, post, put } = useAxios();
const selected = ref<Selected[]>([]);
const geolocalizacion = ref<GeoLocation[]>([]);
const columns: QTableProps['columns'] = [
  { name: 'id_externo', align: 'left', label: 'Codigo', field: 'id_externo' },
  {
    name: 'usuario',
    required: true,
    label: 'Nombre',
    align: 'left',
    field: 'usuario',
    sortable: true,
  },
  {
    name: 'lugar',
    align: 'center',
    label: 'Lugar',
    field: 'lugar',
    sortable: true,
  },
];

const rows = [
  {
    id_externo: 1,
    usuario: 'Frozen Yogurt',
    lugar: '',
  },
  {
    id_externo: 2,
    usuario: 'Ice cream sandwich',
    lugar: '',
  },
  {
    id_externo: 3,
    usuario: 'Eclair',
    lugar: '',
  },
  {
    id_externo: 4,
    usuario: 'Cupcake',
    lugar: '',
  },
  {
    id_externo: 5,
    usuario: 'Gingerbread',
    lugar: '',
  },
  {
    id_externo: 6,
    usuario: 'Jelly bean',
    lugar: '',
  },
  {
    id_externo: 7,
    usuario: 'Lollipop',
    lugar: '',
  },
  {
    id_externo: 8,
    usuario: 'Honeycomb',
    lugar: '',
  },
  {
    id_externo: 9,
    usuario: 'Donut',
    lugar: '',
  },
  {
    id_externo: 10,
    usuario: 'KitKat',
    lugar: '',
  },
];

// Methods
const currentPosition = async () => {
  // Check for location permissions
  const permissionStatus = await Geolocation.checkPermissions();

  // If permissions are not granted, request them
  if (permissionStatus.coarseLocation === 'granted') {
    const coordinates = await Geolocation.getCurrentPosition();
    // Update the state of the newPos ref
    newPos.value.lat = coordinates.coords.latitude;
    newPos.value.long = coordinates.coords.longitude;
    newPos.value.timestamp = coordinates.timestamp;
    confirm.value = false;
  } else {
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: '¡Debe chequear los permisos de gps en las configuraciones!',
    });
  }
};

const registrarPosicion = async () => {
  currentPosition();
  try {
    const response = await post(
      '/crear_coordenadas_cliente',
      {},
      JSON.parse(
        JSON.stringify({
          usuario: usuario.value,
          id_externo: selected.value[0].id_externo,
          lugar: newPos.value,
          tipo: 1,
        })
      )
    );

    if (response.error === 'N') {
      confirm.value = false;
    }
    // Handle the response accordingly
    $q.notify({
      color: response.error === 'N' ? 'green-4' : 'red-5',
      textColor: 'white',
      icon: response.error === 'N' ? 'cloud_done' : 'warning',
      message: response.mensaje,
    });
  } catch (error) {
    deducirMensajeError(error as ObjectError);
  }
};

const actualizarPosicion = async () => {
  currentPosition();
  try {
    const response = await put(
      '/actualizar_coordenadas_cliente',
      {},
      JSON.parse(
        JSON.stringify({
          usuario: usuario.value,
          id_externo: selected.value[0].id_externo,
          lugar: newPos.value,
          tipo: 1,
        })
      )
    );

    if (response.error === 'N') {
      confirm.value = false;
    }
    // Handle the response accordingly
    $q.notify({
      color: response.error === 'N' ? 'green-4' : 'red-5',
      textColor: 'white',
      icon: response.error === 'N' ? 'cloud_done' : 'warning',
      message: response.mensaje,
    });
  } catch (error) {
    deducirMensajeError(error as ObjectError);
  }
};

const getClientes = async (code: number): Promise<GeoLocation[]> => {
  const response: RespuestaCoordenadas = await get('/coordenadas_cliente', {
    codigo: code,
  });
  return response.objetos;
};

const handleClick = async (id: number) => {
  currentPosition();
  right.value = false;
  confirm.value = true;
  console.log('[ID]: ', id);
  geolocalizacion.value = await getClientes(id);

  if (geolocalizacion.value.length !== 0) {
    actualizar.value = true;
  } else {
    actualizar.value = false;
  }
};

onMounted(async () => {
  const session: Session | null = LocalStorage.getItem('session');
  usuario.value = session?.login || '';
  geolocalizacion.value = await getClientes(1);
});
</script>

<template>
  <q-page padding class="page-container">
    <h4
      class="row text-uppercase text-grey-8 justify-center items-center content-center q-pa-md text-center"
      style="font-family: 'Bebas Neue'"
    >
      <div class="q-pt-md">Registrar Cliente</div>
    </h4>
    {{ JSON.stringify(geolocalizacion) }}
    <div class="row justify-center">
      <q-btn
        outline
        round
        color="primary"
        icon="my_location"
        @click="handleClick(selected[0].id_externo)"
        :disable="!selected.length"
      />
    </div>

    <q-dialog v-model="confirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <div class="row no-wrap items-center">
            <q-avatar icon="map" color="primary" text-color="white" />
            <span class="q-ml-sm" v-if="!actualizar"
              >¿Está seguro de que desea registrar la localización actual del
              cliente?</span
            >
            <span class="q-ml-sm" v-if="actualizar"
              >¿Está seguro de que desea actualizar la localización actual del
              cliente?</span
            >
          </div>
          <div class="q-pt-md">
            <q-checkbox
              v-model="right"
              v-if="actualizar"
              label="Entiendo que esta acción está sujeta a auditoría"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn
            flat
            v-if="!actualizar"
            label="Registrar"
            color="primary"
            @click="registrarPosicion"
          />
          <q-btn
            v-if="actualizar"
            flat
            color="primary"
            label="Actualizar"
            :disable="!right"
            @click="actualizarPosicion"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div class="q-pa-md">
      <q-table
        flat
        bordered
        title="Clientes"
        :rows="rows"
        :columns="columns"
        :visible-columns="['name', 'lugar']"
        row-key="id_externo"
        selection="single"
        v-model:selected="selected"
      />

      <div class="q-mt-md">
        Selected ID:
        {{ JSON.stringify(selected.map((el) => el.id_externo)) }}
        <br />
        Selected:
        {{ selected }}
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
@import '../css/page.container.scss';
</style>
