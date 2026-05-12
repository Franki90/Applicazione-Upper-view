import * as AppleAuthentication from "expo-apple-authentication";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { AppButton } from "../../components/AppButton";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useAuthStore } from "../../store/authStore";
import { colors, radii, spacing } from "../../theme/tokens";

WebBrowser.maybeCompleteAuthSession();

export const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("customer@ticino.market");
  const [password, setPassword] = useState("Pass12345");
  const {
    loginWithEmail,
    loginWithSocial,
    loading,
    error,
    clearError,
    setGuest
  } = useAuthStore((state) => ({
    loginWithEmail: state.loginWithEmail,
    loginWithSocial: state.loginWithSocial,
    loading: state.loading,
    error: state.error,
    clearError: state.clearError,
    setGuest: state.setGuest
  }));

  const [googleRequest, googleResponse, googlePromptAsync] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
  });

  useEffect(() => {
    if (googleResponse?.type === "success") {
      const idToken = googleResponse.params.id_token;
      if (idToken) {
        void handleSocialLogin("google", idToken);
      }
    }
  }, [googleResponse]);

  const onEmailLogin = async () => {
    clearError();
    const success = await loginWithEmail(email, password);
    if (success) {
      navigation.navigate("MainTabs");
    }
  };

  const handleSocialLogin = async (provider: "google" | "apple", idToken: string) => {
    clearError();
    const success = await loginWithSocial(provider, idToken);
    if (success) {
      navigation.navigate("MainTabs");
    }
  };

  const onAppleLogin = async () => {
    if (Platform.OS !== "ios") return;

    try {
      const credentials = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL
        ]
      });

      if (credentials.identityToken) {
        await handleSocialLogin("apple", credentials.identityToken);
      }
    } catch (appleError) {
      // User cancelled auth flow or provider returned an error.
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.formCard}>
        <Text style={styles.label}>{t("email")}</Text>
        <TextInput value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" />
        <Text style={styles.label}>{t("password")}</Text>
        <TextInput value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />

        <View style={styles.actions}>
          <AppButton label={loading ? t("loading") : t("customerAccess")} onPress={onEmailLogin} disabled={loading} />
          <AppButton label={t("vendorAccess")} onPress={onEmailLogin} variant="secondary" disabled={loading} />
          <AppButton label={t("continueGuest")} onPress={() => { setGuest(); navigation.navigate("MainTabs"); }} variant="ghost" disabled={loading} />
        </View>

        <Text style={styles.social}>{t("socialLogin")}</Text>
        <AppButton
          label={t("loginGoogle")}
          onPress={() => {
            if (googleRequest) {
              void googlePromptAsync();
            }
          }}
          variant="secondary"
          disabled={loading || !googleRequest}
        />
        {Platform.OS === "ios" ? (
          <AppButton label={t("loginApple")} onPress={onAppleLogin} variant="secondary" disabled={loading} />
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <AppButton label={t("register")} onPress={() => navigation.navigate("Register")} variant="secondary" />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  formCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderColor: colors.border,
    borderWidth: 1,
    gap: spacing.sm
  },
  label: {
    color: colors.text,
    fontWeight: "700"
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FFFFFF",
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12
  },
  actions: {
    marginTop: spacing.sm,
    gap: spacing.sm
  },
  social: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    textAlign: "center"
  },
  error: {
    color: colors.danger,
    textAlign: "center",
    marginTop: spacing.xs
  }
});
