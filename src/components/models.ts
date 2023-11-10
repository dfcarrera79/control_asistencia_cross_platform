export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

export interface Session {
  estaLogeado: boolean;
  currentURL: string;
  token: string | null;
}

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
