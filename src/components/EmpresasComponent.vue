<script setup lang="ts">
import { axios } from 'src/boot/axios';
import { ref, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import type { Empresa } from './comun/empresaModel';
import { useMensajes } from '../services/useMensajes';
import type { ObjectError } from '../components/models';
import { LocalStorage, Loading, QSpinnerFacebook, useQuasar } from 'quasar';
import { deducirMensajeError, removeObjectFromArray } from '../utils/AppUtils';

const empresa = defineModel<Empresa>('empresa', { required: true });
const empresas = defineModel<Empresa[]>('empresas', { required: true });
const editorRegistro = defineModel<boolean>('editorRegistro', {
  required: true,
});

// Data
const ruc = ref('');
const $q = useQuasar();
const card = ref(false);
const authStore = useAuthStore();
const editor_edicion = ref(false);
const { mostrarError } = useMensajes();
const db_empresas = 'db_empresas_controlasistencias';
const rucRule: ((v: string) => string | boolean)[] = [
  (v: string) => !!v || 'El RUC es obligatorio',
  (v: string) => /^\d{13}$/.test(v) || 'El RUC debe contener 13 dígitos',
];

//Methods
const handleRegistrar = () => {
  editorRegistro.value = false;
  card.value = true;
};

const grabarCambios = () => {
  try {
    LocalStorage.set(db_empresas, empresas.value);
    $q.notify({
      message: 'Los Datos de la empresa se modificaron correctamente',
      multiLine: true,
    });
    editor_edicion.value = false;
    editorRegistro.value = false;
  } catch (error) {
    editor_edicion.value = false;
    mostrarError(JSON.stringify(error), undefined);
  }
};

const editarEmpresa = () => {
  if (empresa.value.codigo_empresa === 0) {
    mostrarError('Seleccione primero una empresa', undefined);
    return;
  }
  editor_edicion.value = true;
};

const eliminarEmpresa = () => {
  if (empresa.value == null) {
    mostrarError('Primero seleccione una empresa', undefined);
    return;
  }
  $q.dialog({
    title: 'Confirmar',
    message: '¿Esta seguro de eliminar la empresa seleccionada?',
    cancel: {
      label: 'Cancelar', // Texto del botón de cancelar
      color: 'negative', // Cambia el color del botón si lo deseas
    },
    ok: {
      label: 'Eliminar', // Texto del botón de aceptar
      color: 'positive', // Cambia el color del botón si lo deseas
    },
    persistent: true,
  }).onOk(async () => {
    const ok = removeObjectFromArray(
      empresas.value,
      'index',
      empresa.value.index
    );
    if (ok) {
      LocalStorage.set(db_empresas, empresas.value);
      empresa.value = authStore.empresaCero;
      editorRegistro.value = false;
      ruc.value = '';
    }
  });
};

const handleCloseCard = () => {
  card.value = false;
  ruc.value = '';
};

const iniciarRegistro = async () => {
  if (ruc.value.trim().length !== 13) {
    mostrarError('El RUC debe contener 13 digitos', undefined);
    return;
  }
  if (
    empresas.value.filter((e) => e.ruc.trim() === ruc.value.trim()).length > 0
  ) {
    mostrarError('La empresa ya esta registrada', undefined);
    return;
  }
  try {
    Loading.show({
      spinner: QSpinnerFacebook,
      message: 'Registrando empresa...',
    });

    const promesa = await axios.get(
      `${authStore.apiEmpresas}/obtener_empresa?ruc=${ruc.value.trim()}`
    );

    const respuesta = await promesa.data;
    if (respuesta.mensaje.trim().length > 0) {
      mostrarError(respuesta.mensaje, undefined);
      return;
    }
    const data = respuesta.objetos[0];
    let newEmpresa = {
      codigo_empresa: data.codigo_empresa,
      ruc: data.ruc,
      index: empresas.value.length,
      razon_social: data.razon_social,
      nombre_comercial: data.nombre_comercial,
      url_local_api: data.url_local_api_emilia,
      url_publico_api: data.url_publico_api_emilia,
    };
    authStore.empresa = newEmpresa;
    empresas.value.push(newEmpresa);
    LocalStorage.set(db_empresas, empresas.value);
    editorRegistro.value = false;
    ruc.value = '';
  } catch (error) {
    mostrarError(deducirMensajeError(error as ObjectError), undefined);
  } finally {
    Loading.hide();
  }
};

watch(empresa, async () => {
  authStore.empresa = empresa.value;
});
</script>

<template>
  <div>
    <q-dialog v-model="editorRegistro" position="bottom">
      <q-card style="width: 350px">
        <q-card-section class="row items-center no-wrap">
          <div class="col">
            <div class="text-grey-9 text-h6">OPCIONES DE EMPRESA</div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions vertical>
          <q-item
            clickable
            v-ripple
            active-class="my-menu-link"
            @click="handleRegistrar"
          >
            <q-item-section avatar>
              <q-icon name="add" color="positive" />
            </q-item-section>
            <q-item-section>
              <span class="text-grey-9 text-subtitle1">
                Registrar Empresa
              </span>
            </q-item-section>
          </q-item>
          <q-item
            clickable
            v-ripple
            active-class="my-menu-link"
            @click="editarEmpresa"
          >
            <q-item-section avatar>
              <q-icon name="edit" color="primary" />
            </q-item-section>
            <q-item-section>
              <span class="text-grey-9 text-subtitle1">
                Editar Configuraciones de Empresa
              </span>
            </q-item-section>
          </q-item>
          <q-item
            clickable
            v-ripple
            active-class="my-menu-link"
            @click="eliminarEmpresa"
          >
            <q-item-section avatar>
              <q-icon name="delete" color="red-5" />
            </q-item-section>
            <q-item-section>
              <span class="text-grey-9 text-subtitle1"> Eliminar Empresa </span>
            </q-item-section>
          </q-item>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="card">
      <q-card class="my-card">
        <q-bar class="bg-primary text-white">
          <div class="text-h6">Registrar Empresa</div>
          <q-space />
          <q-btn dense flat icon="close" @click="handleCloseCard" />
        </q-bar>

        <q-card-section class="q-pt-md">
          <div class="column col-xs-12 q-pa-sm">
            <q-select
              outlined
              dense
              v-model="authStore.servidor"
              :options="authStore.servidores"
              label="Servidor Cloud"
              option-label="nombre"
            />
          </div>
          <div class="column col-xs-12 q-pa-sm">
            <q-input
              dense
              outlined
              v-model="ruc"
              color="primary"
              debounce="1000"
              label="RUC de la empresa"
              :rules="rucRule"
            >
              <template v-slot:append>
                <q-icon name="close" @click="ruc = ''" class="cursor-pointer" />
              </template>
            </q-input>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            flat
            color="primary"
            label="Cancelar"
            @click="handleCloseCard"
          />
          <q-btn
            v-close-popup
            flat
            color="primary"
            label="Registrar"
            @click="iniciarRegistro"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- Visor para editar datos de empresa-->
    <q-dialog v-model="editor_edicion">
      <q-card class="my-card">
        <q-bar class="bg-primary text-white">
          <div class="text-h6">Editor de Empresa</div>
          <q-space />
          <q-btn dense flat icon="close" @click="editor_edicion = false" />
        </q-bar>

        <q-card-section class="q-pt-md">
          <div class="column col-xs-12 q-pa-sm">
            <q-input
              dense
              outlined
              color="primary"
              label="API - URL Local"
              v-model="empresa.url_local_api"
              autofocus
              @keyup.enter="editor_edicion = false"
            />
          </div>
          <div class="column col-xs-12 q-pa-sm">
            <q-input
              dense
              outlined
              color="primary"
              label="API - URL"
              v-model="empresa.url_publico_api"
              autofocus
              @keyup.enter="editor_edicion = false"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            flat
            color="primary"
            label="Cancelar"
            @click="editor_edicion = false"
          />
          <q-btn
            v-close-popup
            flat
            color="primary"
            label="Guardar"
            @click="grabarCambios"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
