export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

// export interface Session {
//   estaLogeado: boolean;
//   currentURL: string;
//   token: string | null;
// }

export interface Respuesta {
  error: string;
  mensaje: string;
  objetos: number;
}

export interface RespuestaSelfie {
  error: string;
  mensaje: string;
  objetos: boolean;
}

export interface DeviceId {
  identifier: string;
}

export interface LocationData {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitudeAccuracy: number | null;
    altitude: number | null;
    speed: number | null;
    heading: number | null;
  };
  timestamp: number;
}

export interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
}

// export interface User {
//   nombre_comercial: string;
//   clave: string;
//   ruc_cliente: string;
//   razon_social: string;
// }
export interface Session {
  estaLogeado: boolean;
  currentURL: string;
  token: string | null;
  ruc: string;
  usuario: string;
  codigo: number;
  login: string;
  clave: string;
}

export interface RespuestaCoordenadas {
  error: string;
  mensaje: string;
  objetos: ObjetoCoordenadas[];
}

interface ObjetoCoordenadas {
  codigo: number;
  lat: number;
  long: number;
}

export interface Resultado {
  alm_nomcom: string;
  alm_codigo: number;
}

export interface ObjectError {
  message: string;
  name: string;
  stack: string;
  config: Config;
}

interface Config {
  url: string;
  method: string;
  headers: Headers;
  params: Params;
  transformRequest: null[];
  transformResponse: null[];
  timeout: number;
  xsrfCookieName: string;
  xsrfHeaderName: string;
  maxContentLength: number;
  maxBodyLength: number;
  transitional: Transitional;
}

interface Transitional {
  silentJSONParsing: boolean;
  forcedJSONParsing: boolean;
  clarifyTimeoutError: boolean;
}

interface Params {
  id: string;
  clave: string;
}

interface HorarioObject {
  horario: NuevoHorario[];
}

export interface NuevoHorario {
  end: string;
  time: string;
  start: string;
  title: string;
  bgcolor: string;
  details: string;
}

export interface RespuestaHorarioEmpleado {
  error: string;
  mensaje: string;
  objetos: HorarioObject[];
}

export interface EntradasRegistradas {
  error: string;
  mensaje: string;
  objetos: ObjetoEntradasRegistradas[];
}

export interface ObjetoEntradasRegistradas {
  codigo: number;
  entrada: string;
  salida: string;
}
