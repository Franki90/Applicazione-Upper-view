import React, { useMemo, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";
import { useTranslation } from "react-i18next";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { HomeScreen } from "../screens/customer/HomeScreen";
import { OfferDetailsScreen } from "../screens/customer/OfferDetailsScreen";
import { SearchScreen } from "../screens/customer/SearchScreen";
import { FavoritesScreen } from "../screens/customer/FavoritesScreen";
import { ProfileScreen } from "../screens/customer/ProfileScreen";
import { CouponScreen } from "../screens/customer/CouponScreen";
import { CustomerOnboardingScreen } from "../screens/customer/CustomerOnboardingScreen";
import { VendorDashboardScreen } from "../screens/vendor/VendorDashboardScreen";
import { CreateOfferScreen } from "../screens/vendor/CreateOfferScreen";
import { SubscriptionScreen } from "../screens/vendor/SubscriptionScreen";
import { VendorOnboardingScreen } from "../screens/vendor/VendorOnboardingScreen";
import { useAuthStore } from "../store/authStore";
import { colors } from "../theme/tokens";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator();

const tabIcon = (label: string) => ({ color }: { color: string }) => (
  <Text style={{ color, fontWeight: "700" }}>{label}</Text>
);

const MainTabs = () => {
  const role = useAuthStore((state) => state.role);
  const { t } = useTranslation();

  const tabs = useMemo(() => {
    if (role === "vendor") {
      return [
        { name: "Home", component: HomeScreen, label: t("home") },
        { name: "VendorDashboard", component: VendorDashboardScreen, label: t("vendorDashboard") },
        { name: "Profile", component: ProfileScreen, label: t("profile") }
      ];
    }

    if (role === "customer") {
      return [
        { name: "Home", component: HomeScreen, label: t("home") },
        { name: "Search", component: SearchScreen, label: t("search") },
        { name: "Favorites", component: FavoritesScreen, label: t("favorites") },
        { name: "Profile", component: ProfileScreen, label: t("profile") }
      ];
    }

    return [
      { name: "Home", component: HomeScreen, label: t("home") },
      { name: "Search", component: SearchScreen, label: t("search") },
      { name: "Profile", component: ProfileScreen, label: t("profile") }
    ];
  }, [role, t]);

  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 6,
          paddingTop: 6
        }
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarLabel: tab.label,
            tabBarIcon: tabIcon(tab.label.slice(0, 1))
          }}
        />
      ))}
    </Tabs.Navigator>
  );
};

export const RootNavigator = () => {
  const [onboardingDone, setOnboardingDone] = useState(false);
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background }
      }}
    >
      {!onboardingDone ? (
        <Stack.Screen name="Onboarding" options={{ headerShown: false }}>
          {() => <OnboardingScreen onContinue={() => setOnboardingDone(true)} />}
        </Stack.Screen>
      ) : null}

      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="OfferDetails" component={OfferDetailsScreen} options={{ title: t("viewDetails") }} />
      <Stack.Screen name="Coupon" component={CouponScreen} options={{ title: t("couponTitle") }} />
      <Stack.Screen name="CreateOffer" component={CreateOfferScreen} options={{ title: t("createOffer") }} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ title: t("subscriptionTitle") }} />
      <Stack.Screen name="VendorOnboarding" component={VendorOnboardingScreen} options={{ title: t("manageBusiness") }} />
      <Stack.Screen name="CustomerOnboarding" component={CustomerOnboardingScreen} options={{ title: "Interests" }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ presentation: "modal", title: t("login") }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ presentation: "modal", title: t("register") }} />
    </Stack.Navigator>
  );
};
