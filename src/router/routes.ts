import { useAuthStore } from '../stores/auth';
import multiguard from 'vue-router-multiguard';
import {
  RouteRecordRaw,
  NavigationGuardNext,
  RouteLocationNormalized,
} from 'vue-router';

const estaLogeado = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const appStore = useAuthStore();
  if (appStore.estaLogeado === false) {
    return next({
      path: '/login',
      query: { redirect: to.fullPath },
    });
  }
  return next();
};

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
        beforeEnter: multiguard([estaLogeado]),
      },
    ],
  },
  {
    path: '/permisos',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/PermisosPage.vue'),
      },
    ],
  },
  {
    path: '/registro_facial',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/RegistroFacialPage.vue'),
      },
    ],
  },
  {
    path: '/registro_dispositivo',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/RegistrarDispositivoPage.vue'),
      },
    ],
  },
  {
    path: '/registro_asistencia',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/RegistroAsistenciaPage.vue') },
    ],
  },
  {
    path: '/registro_salida',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/RegistroSalidaPage.vue') },
    ],
  },
  {
    path: '/registrar_entrada_salida',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/RegistrarEntradaSalidaPage.vue'),
      },
    ],
  },
  {
    path: '/registrar_cliente',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/RegistrarClientePage.vue'),
      },
    ],
  },
  {
    path: '/rutas',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/RutasPage.vue'),
      },
    ],
  },
  {
    path: '/login',
    component: () => import('layouts/LoginLayout.vue'),
    children: [{ path: '', component: () => import('pages/LoginPage.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
