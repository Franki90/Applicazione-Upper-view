import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { requestCurrentLocation } from "./location";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true
  })
});

const mapPlatform = (): "ios" | "android" | "web" | "unknown" => {
  if (Platform.OS === "ios") return "ios";
  if (Platform.OS === "android") return "android";
  if (Platform.OS === "web") return "web";
  return "unknown";
};

export type PushRegistrationResult = {
  expoPushToken: string;
  platform: "ios" | "android" | "web" | "unknown";
  locale?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
};

export const registerForPushNotifications = async (): Promise<PushRegistrationResult | null> => {
  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const permission = await Notifications.requestPermissionsAsync();
    finalStatus = permission.status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const projectId =
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId;

  const pushToken = projectId
    ? await Notifications.getExpoPushTokenAsync({ projectId })
    : await Notifications.getExpoPushTokenAsync();

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX
    });
  }

  const location = await requestCurrentLocation().catch(() => null);

  return {
    expoPushToken: pushToken.data,
    platform: mapPlatform(),
    locale: Intl.DateTimeFormat().resolvedOptions().locale,
    city: undefined,
    latitude: location?.latitude,
    longitude: location?.longitude
  };
};
