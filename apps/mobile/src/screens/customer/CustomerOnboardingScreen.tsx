import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { AppButton } from "../../components/AppButton";
import { CategorySelector } from "../../components/CategorySelector";
import { ScreenContainer } from "../../components/ScreenContainer";
import { RootStackParamList } from "../../navigation/types";
import { saveUserPreferencesApi } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { colors, radii, spacing } from "../../theme/tokens";
import { CategoryId } from "../../types";

type ScreenRoute = RouteProp<RootStackParamList, "CustomerOnboarding">;

export const CustomerOnboardingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<ScreenRoute>();
  const { token, user, setSelectedCategories } = useAuthStore((state) => ({
    token: state.token,
    user: state.user,
    setSelectedCategories: state.setSelectedCategories
  }));
  const [selected, setSelected] = useState<CategoryId[]>(user?.selectedCategoryIds ?? []);
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    if (!token || !user || user.role !== "customer") {
      navigation.navigate("MainTabs");
      return;
    }

    setLoading(true);
    try {
      await saveUserPreferencesApi(token, selected);
      setSelectedCategories(selected);
      if (route.params?.fromRegistration) {
        navigation.navigate("MainTabs");
      } else {
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Unable to save preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.title}>What are you interested in?</Text>
        <Text style={styles.subtitle}>Pick your favorite categories to personalize your feed.</Text>
      </View>

      <CategorySelector selectedIds={selected} onChange={setSelected} />

      <View style={styles.actions}>
        <AppButton label={loading ? "Saving..." : "Save interests"} onPress={onSave} disabled={loading} />
        <AppButton
          label="Skip for now"
          variant="ghost"
          onPress={() => navigation.navigate("MainTabs")}
          disabled={loading}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: spacing.xs
  },
  subtitle: {
    color: colors.textSecondary
  },
  actions: {
    marginTop: spacing.md,
    gap: spacing.sm
  }
});
