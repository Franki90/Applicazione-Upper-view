import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { AppButton } from "../../components/AppButton";
import { CategorySelector } from "../../components/CategorySelector";
import { ScreenContainer } from "../../components/ScreenContainer";
import { RootStackParamList } from "../../navigation/types";
import { registerCustomerApi, registerVendorApi } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { colors, radii, spacing } from "../../theme/tokens";
import { CategoryId } from "../../types";

type AccountType = "customer" | "vendor";
type RegisterRoute = RouteProp<RootStackParamList, "Register">;

export const RegisterScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<RegisterRoute>();
  const setAuthSession = useAuthStore((state) => state.setAuthSession);
  const [accountType, setAccountType] = useState<AccountType>(route.params?.accountType ?? "customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("Lugano");
  const [selectedCategories, setSelectedCategories] = useState<CategoryId[]>([]);
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Missing data", "Name, email and password are required.");
      return;
    }

    if (accountType === "vendor" && selectedCategories.length === 0) {
      Alert.alert("Select categories", "Vendors must select at least one business category.");
      return;
    }

    setLoading(true);
    try {
      if (accountType === "vendor") {
        const payload = await registerVendorApi({
          name,
          email,
          password,
          businessName: businessName || name,
          city,
          latitude: 46.0037,
          longitude: 8.9511,
          categoryIds: selectedCategories
        });
        setAuthSession(payload);
        navigation.navigate("VendorOnboarding");
      } else {
        const payload = await registerCustomerApi({
          name,
          email,
          password,
          selectedCategoryIds: selectedCategories
        });
        setAuthSession(payload);
        navigation.navigate("CustomerOnboarding", { fromRegistration: true });
      }
    } catch (error) {
      Alert.alert("Registration failed", error instanceof Error ? error.message : "Unable to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.formCard}>
        <Text style={styles.title}>{t("register")}</Text>
        <Text style={styles.subtitle}>Choose account type and categories to personalize Ticino Deals.</Text>

        <View style={styles.roleRow}>
          <Pressable
            onPress={() => setAccountType("customer")}
            style={[styles.roleChip, accountType === "customer" ? styles.roleChipActive : null]}
          >
            <Text style={[styles.roleText, accountType === "customer" ? styles.roleTextActive : null]}>
              Customer
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setAccountType("vendor")}
            style={[styles.roleChip, accountType === "vendor" ? styles.roleChipActive : null]}
          >
            <Text style={[styles.roleText, accountType === "vendor" ? styles.roleTextActive : null]}>Vendor</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Name</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} />
        <Text style={styles.label}>{t("email")}</Text>
        <TextInput value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" />
        <Text style={styles.label}>{t("password")}</Text>
        <TextInput value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />

        {accountType === "vendor" ? (
          <>
            <Text style={styles.label}>Business name</Text>
            <TextInput value={businessName} onChangeText={setBusinessName} style={styles.input} />
            <Text style={styles.label}>City / area</Text>
            <TextInput value={city} onChangeText={setCity} style={styles.input} />
          </>
        ) : null}

        <Text style={styles.label}>
          {accountType === "vendor"
            ? "Select your business categories (max 5)"
            : "What are you interested in? (recommended up to 5)"}
        </Text>
        <CategorySelector
          selectedIds={selectedCategories}
          onChange={setSelectedCategories}
          maxSelection={accountType === "vendor" ? 5 : undefined}
        />

        <AppButton label={loading ? "Creating account..." : t("register")} onPress={onRegister} disabled={loading} />
        <AppButton label={t("login")} variant="secondary" onPress={() => navigation.navigate("Login")} />
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
  title: {
    fontSize: 24,
    color: colors.text,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.xs
  },
  roleRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  roleChip: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    alignItems: "center",
    backgroundColor: "#FFFFFF"
  },
  roleChipActive: {
    borderColor: colors.primary,
    backgroundColor: "#EEF2FF"
  },
  roleText: {
    color: colors.textSecondary,
    fontWeight: "700"
  },
  roleTextActive: {
    color: colors.primaryDark
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
    paddingVertical: 12,
    marginBottom: spacing.xs
  }
});
