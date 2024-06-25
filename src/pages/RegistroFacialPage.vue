<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  Camera,
  CameraResultType,
  CameraSource,
  CameraDirection,
} from '@capacitor/camera';
import { Session } from '../components/models';
import { useAxios } from '../services/useAxios';
import { LocalStorage, useQuasar } from 'quasar';

// Data
const foto = ref();
const file = ref();
const codigo = ref(0);
const selfie = ref('');
const $q = useQuasar();
const check = ref(false);
const confirmar = ref(false);
const showCamera = ref(false);
const path = process.env.IMAGE_PATH;
const replacedPath = process.env.REPLACED_PATH;
const { get, post } = useAxios();

// Methods
const takeSelfie = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      direction: CameraDirection.Front,
      width: 1024,
      height: 768,
    });

    if (image.webPath) {
      // result.webPath contiene la URL de la imagen tomada
      foto.value = image.webPath;
      const respt = await fetch(image.webPath);

      if (respt.ok) {
        const data = await respt.blob();
        file.value = new File([data], 'foto.jpg');
      }
    }
  } catch (error) {
    console.error('[ERROR AL TOMAR LA SELFIE] :', error);
  }
};

const subirFoto = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const respt = await post('/subir_foto', {}, formData);
    return respt.objetos;
  } catch (error) {
    console.error('[ERROR AL SUBIR LA FOTO]:', error);
  }
};

const procesarSelfie = async (img: File) => {
  console.log('[SE DIO CLICK EN REGISTRAR SELFIE]');
  if (img) {
    const path = await subirFoto(img);
    const response = await post(
      '/registrar_foto',
      {},
      JSON.parse(JSON.stringify({ filepath: path, usuario: codigo.value }))
    );
    if (response.error === 'N') {
      obtenerSelfie(codigo.value);
    }
    $q.notify({
      color: response.error === 'N' ? 'green-4' : 'red-5',
      textColor: 'white',
      icon: response.error === 'N' ? 'cloud_done' : 'warning',
      message: response.mensaje,
    });
    confirmar.value = false;
  }
};

const obtenerSelfie = async (code: number) => {
  const response = await get('/obtener_foto', {
    usuario: code,
  });
  if (response.error === 'N') {
    selfie.value = response.objetos[0].path;
    check.value = true;
  }
};

onMounted(() => {
  const session: Session | null = LocalStorage.getItem('session');
  codigo.value = session?.codigo || 0;
  obtenerSelfie(codigo.value);
});

// Computed
const textInfo = computed(() => {
  return check.value ? 'La foto ya se encuentra registrada' : 'Registro Facial';
});
</script>

<template>
  <q-page padding class="page-container">
    <h4
      class="row text-uppercase text-grey-8 justify-center items-center content-center q-pa-xs text-center"
      style="font-family: 'Bebas Neue'"
    >
      <div class="q-pt-none">{{ textInfo }}</div>
    </h4>

    <div class="col-12 text-center q-pt-none" v-if="foto && !check">
      <img :src="foto" alt="Foto tomada" style="width: 340px" />
    </div>

    <div class="col-12 text-center q-pt-none" v-if="check">
      <img
        :src="selfie.replace(path as string, replacedPath as string)"
        alt="Foto tomada"
        style="width: 340px"
      />
    </div>

    <div class="row justify-center q-pt-lg">
      <div class="col text-center">
        <div v-if="foto">
          <q-btn
            no-caps
            v-if="!check"
            color="primary"
            rounded
            icon="upload"
            label="Registrar selfie"
            size="lg"
            @click="confirmar = true"
          />
        </div>
        <div class="q-py-sm" v-if="!check">
          <q-btn
            no-caps
            color="primary"
            rounded
            icon="camera_alt"
            label="Tomar selfie"
            size="lg"
            @click="takeSelfie"
            v-show="!showCamera"
          />
        </div>
      </div>
    </div>
    <div>
      <q-dialog v-model="confirmar" persistent>
        <q-card>
          <q-card-section class="row items-center">
            <span
              >¿Está seguro de usar esta foto para sus registros de
              asistencia?</span
            >
          </q-card-section>

          <q-card-section class="row items-center">
            <div>
              <span
                ><strong>Nota: </strong> Una vez que haya registrado la foto, no
                podrá realizar modificaciones. Por favor, asegúrese de que la
                imagen muestre su rostro de manera clara y centrada.</span
              >
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="red" v-close-popup />
            <q-btn
              flat
              label="Registrar selfie"
              color="primary"
              v-close-popup
              @click="procesarSelfie(file)"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
@import '../css/page.container.scss';
</style>
