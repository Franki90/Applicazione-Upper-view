import * as Location from "expo-location";

export type DeviceLocation = {
  latitude: number;
  longitude: number;
};

export const requestCurrentLocation = async (): Promise<DeviceLocation | null> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    return null;
  }

  const current = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced
  });

  return {
    latitude: current.coords.latitude,
    longitude: current.coords.longitude
  };
};

const degToRad = (deg: number) => (deg * Math.PI) / 180;

export const distanceKm = (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): number => {
  const earthRadiusKm = 6371;
  const dLat = degToRad(toLat - fromLat);
  const dLng = degToRad(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(fromLat)) *
      Math.cos(degToRad(toLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(earthRadiusKm * c * 10) / 10;
};
