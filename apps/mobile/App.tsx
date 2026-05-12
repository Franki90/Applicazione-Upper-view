import "react-native-gesture-handler";
import "./src/i18n";
import React, { useEffect, useRef } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { colors } from "./src/theme/tokens";
import { useAuthStore } from "./src/store/authStore";
import { registerForPushNotifications } from "./src/services/pushNotifications";
import { registerPushDeviceApi } from "./src/services/api";

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.card,
    border: colors.border,
    primary: colors.primary,
    text: colors.text
  }
};

export default function App() {
  const token = useAuthStore((state) => state.token);
  const pushedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token || pushedTokenRef.current === token) {
      return;
    }

    pushedTokenRef.current = token;

    void (async () => {
      const payload = await registerForPushNotifications();
      if (!payload) {
        return;
      }

      try {
        await registerPushDeviceApi(token, payload.expoPushToken, {
          platform: payload.platform,
          locale: payload.locale,
          city: payload.city,
          latitude: payload.latitude,
          longitude: payload.longitude
        });
      } catch (error) {
        // Non-blocking: app continues even if push registration fails.
      }
    })();
  }, [token]);

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style="dark" />
      <RootNavigator />
    </NavigationContainer>
  );
}
