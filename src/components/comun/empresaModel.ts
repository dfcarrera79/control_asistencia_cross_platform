// export interface RespuestaSRISocio {
//   autorizado: string;
//   notificado: string;
//   en_lanube: string;
//   log: string;
// }

// export interface Empresa {
//   url_local_api: string;
//   url_publico_api: string;
//   url_local_api_emilia?: string;
//   url_publico_api_emilia?: string;
//   ultimo_servicio?: {
//     app_examenes: string;
//     app_formularios_bpa: string;
//     codigo_servicio: number;
//   };
//   facturacion_socio: {
//     login: string;
//     clave: string;
//     artcodbar_boletos: string;
//     concepto_boletos: string;
//     detalle_boletos: string;
//     cantidad_boletos: number;
//     monto_boletos: number;
//     artcodbar_encomiendas: string;
//     concepto_encomiendas: string;
//     detalle_encomiendas: string;
//     cantidad_encomiendas: number;
//     monto_encomiendas: number;
//     fecha_facturacion: string;
//     ruc_factura: string;
//     secuencia_boletos: string;
//     secuencia_encomiendas: string;
//     dt_iva_boletos: string;
//     dt_iva_encomiendas: string;
//     trn_codigo_boletos: number;
//     trn_codigo_encomiendas: number;
//     respuestaFacturacion: {
//       respuesta_boletos: string;
//       respuesta_encomiendas: string;
//       trn_codigo_boletos: number;
//       trn_codigo_encomiendas: number;
//       respuesta_sri_boletos: RespuestaSRISocio;
//       respuesta_sri_encomiendas: RespuestaSRISocio;
//     };
//   };
// }

export interface Empresa {
  codigo_empresa: number;
  ruc: string;
  index: number;
  razon_social: string;
  nombre_comercial: string;
  url_local_api: string;
  url_publico_api: string;
}

// export interface Empresa {
//   log: string;
//   codigo_empresa: number;
//   usuario: string;
//   clave: string;
//   direccion_ip: string;
//   puerto: string;
//   nombre_bdd: string;
//   ruc: string;
//   razon_social: string;
//   nombre_comercial: string;
//   url_local_api: string;
//   url_publico_api: string;
//   jndi_name: string;
//   url_local_api_emilia: string;
//   url_publico_api_emilia: string;
//   multiempresa: string;
//   tipo_empresa: string;
//   ultimo_servicio: Ultimoservicio;
//   validar_servicio: boolean;
// }

// interface Ultimoservicio {
//   codigo_servicio: number;
//   codigo_empresa: number;
//   app_comercial: string;
//   app_contabilidad: string;
//   app_rol: string;
//   app_examenes: string;
//   app_formularios_bpa: string;
//   trn_factura: number;
// }
