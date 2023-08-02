interface RootObject {
  coords: Coords;
  timestamp: number;
}

interface Coords {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number;
  altitudeAccuracy: number;
  speed: number;
  heading: number;
}
