import React, { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import i18n from "i18next";
import { useTranslation } from "react-i18next";
import { AppButton } from "../../components/AppButton";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useAuthStore } from "../../store/authStore";
import { colors, radii, spacing } from "../../theme/tokens";

const languages = ["it", "en", "de", "fr", "es"];

export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { role, user, logout } = useAuthStore((state) => ({
    role: state.role,
    user: state.user,
    logout: state.logout
  }));
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={styles.title}>{t("profile")}</Text>
        <Text style={styles.subtitle}>{role === "guest" ? t("guestMode") : `${user?.name} (${role})`}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>{t("notifications")}</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ true: colors.accent, false: colors.border }}
          />
        </View>

        <Text style={styles.label}>{t("language")}</Text>
        <View style={styles.langRow}>
          {languages.map((lang) => (
            <AppButton key={lang} label={lang.toUpperCase()} onPress={() => void i18n.changeLanguage(lang)} variant="secondary" />
          ))}
        </View>

        {role === "guest" ? (
          <View style={styles.actions}>
            <AppButton label={t("login")} onPress={() => navigation.navigate("Login")} />
            <AppButton label={t("register")} variant="secondary" onPress={() => navigation.navigate("Register")} />
          </View>
        ) : role === "customer" ? (
          <View style={styles.actions}>
            <AppButton label="Update interests" variant="secondary" onPress={() => navigation.navigate("CustomerOnboarding")} />
            <AppButton label={t("logout")} variant="secondary" onPress={logout} />
          </View>
        ) : (
          <AppButton label={t("logout")} variant="secondary" onPress={logout} />
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.textSecondary
  },
  label: {
    color: colors.text,
    fontWeight: "700"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  langRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  actions: {
    gap: spacing.sm
  }
});
