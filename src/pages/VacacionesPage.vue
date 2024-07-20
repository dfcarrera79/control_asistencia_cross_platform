<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useAxios } from '../services/useAxios';
import { formatearFechas } from '../utils/AppUtils';
import { useMensajes } from '../services/useMensajes';

const tab = ref('');
const { get } = useAxios();
const autorizados = ref(false);
const authStore = useAuthStore();
import { QTableProps } from 'quasar';
const { mostrarMensaje } = useMensajes();

interface ObjetosExcepciones {
  id: number;
  excepcion: string;
  dias: string[];
}

const rows = ref<ObjetosExcepciones[]>([]);

const columns: QTableProps['columns'] = [
  {
    name: 'id',
    label: 'Codigo',
    align: 'center',
    field: 'id',
  },
  {
    name: 'excepcion',
    label: 'Excepcion',
    align: 'center',
    field: 'excepcion',
    sortable: true,
  },
  {
    name: 'dias',
    align: 'center',
    label: 'Dias',
    field: (row) => formatearFechas(row.dias),
  },
];

const verificarExcepciones = async (autorizado: boolean) => {
  autorizados.value = autorizado;
  const respuesta = await get('/obtener_excepciones_usuario', {
    usuario_codigo: authStore.codigo,
    autorizado: autorizados.value,
  });
  rows.value = respuesta.objetos;
  if (respuesta.error === 'N') {
    rows.value = respuesta.objetos;
  } else {
    mostrarMensaje('Error', respuesta.mensaje);
  }
};

//Methods
onMounted(async () => {
  verificarExcepciones(autorizados.value);
});
</script>

<template>
  <q-page padding class="page-container">
    <span
      class="text-h4 row text-uppercase text-grey-8 justify-center items-center content-center q-pa-md text-center"
      style="font-family: 'Bebas Neue'"
    >
      <div class="q-pt-md">Vacaciones/Excepciones</div>
    </span>

    <div class="text-caption text-grey-8">
      <p>
        En esta sección se muestran las excepciones de vacaciones autorizadas y
        no autorizadas del año en curso únicamente.
      </p>
    </div>

    <div class="q-pa-none">
      <q-card square flat>
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab
            name="autorizados"
            label="Autorizados"
            @click="verificarExcepciones(true)"
          />
          <q-tab
            name="noAutorizados"
            label="No autorizados"
            @click="verificarExcepciones(false)"
          />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="autorizados" class="q-pa-none">
            <q-table
              class="my-sticky-header-table"
              flat
              square
              bordered
              :rows="rows"
              :columns="columns"
              :visible-columns="['excepcion', 'dias']"
              row-key="id"
              :rows-per-page-options="[0]"
              hide-bottom
              hide-pagination
            />
          </q-tab-panel>

          <q-tab-panel name="noAutorizados" class="q-pa-none">
            <q-table
              class="my-sticky-header-table"
              flat
              square
              bordered
              :rows="rows"
              :columns="columns"
              :visible-columns="['excepcion', 'dias']"
              row-key="id"
              :rows-per-page-options="[0]"
              hide-bottom
              hide-pagination
            />
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </q-page>
</template>

<style lang="scss">
@import '../css/sticky.header.table.scss';
</style>
