import React, { useEffect, useRef, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Animated,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { AppButton } from "../components/AppButton";
import { FeatureCard } from "../components/onboarding/FeatureCard";
import { HowStepCard } from "../components/onboarding/HowStepCard";
import { PathChoiceCard } from "../components/onboarding/PathChoiceCard";
import { SectionHeader } from "../components/onboarding/SectionHeader";
import { TrustStatCard } from "../components/onboarding/TrustStatCard";
import { colors, radii, spacing } from "../theme/tokens";

type OnboardingScreenProps = {
  onContinue: () => void;
};

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onContinue }) => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  const [pathOffset, setPathOffset] = useState(0);
  const sectionAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]).current;

  useEffect(() => {
    Animated.stagger(
      120,
      sectionAnimations.map((value) =>
        Animated.timing(value, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        })
      )
    ).start();
  }, [sectionAnimations]);

  const sectionStyle = (index: number) => ({
    opacity: sectionAnimations[index],
    transform: [
      {
        translateY: sectionAnimations[index].interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0]
        })
      }
    ]
  });

  const goGuest = () => {
    onContinue();
  };

  const goRegister = (accountType: "customer" | "vendor") => {
    onContinue();
    setTimeout(() => {
      navigation.navigate("Register", { accountType });
    }, 0);
  };

  const scrollToPaths = () => {
    scrollRef.current?.scrollTo({
      y: pathOffset > 0 ? Math.max(pathOffset - spacing.lg, 0) : 930,
      animated: true
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.bgBlobTop} pointerEvents="none" />
      <View style={styles.bgBlobMid} pointerEvents="none" />
      <View style={styles.bgBlobBottom} pointerEvents="none" />

      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.heroCard, sectionStyle(0)]}>
          <View style={styles.heroGradientA} />
          <View style={styles.heroGradientB} />

          <Text style={styles.badge}>{t("landingBadge")}</Text>
          <View style={styles.locationHint}>
            <MaterialCommunityIcons name="map-marker-radius-outline" size={14} color={colors.primaryDark} />
            <Text style={styles.locationHintText}>{t("landingLocationHint")}</Text>
          </View>

          <Image source={require("../../assets/logo-upv.png")} style={styles.logo} resizeMode="contain" />

          <Text style={styles.heroTitle}>{t("landingHeroTitle")}</Text>
          <Text style={styles.heroSubtitle}>{t("landingHeroSubtitle")}</Text>

          <View style={styles.heroActions}>
            <AppButton label={t("landingHeroPrimaryCta")} onPress={scrollToPaths} />
            <AppButton label={t("landingHeroSecondaryCta")} variant="secondary" onPress={goGuest} />
          </View>
        </Animated.View>

        <Animated.View style={sectionStyle(1)}>
          <SectionHeader title={t("landingValueTitle")} subtitle={t("landingValueSubtitle")} />
          <View style={styles.stack}>
            <FeatureCard
              icon="wallet-outline"
              title={t("landingCitizenTitle")}
              description={t("landingCitizenBody")}
              tint="#4F46E5"
            />
            <FeatureCard
              icon="storefront-outline"
              title={t("landingBusinessTitle")}
              description={t("landingBusinessBody")}
              tint="#0EA5E9"
            />
            <FeatureCard
              icon="account-group-outline"
              title={t("landingCommunityTitle")}
              description={t("landingCommunityBody")}
              tint="#22C55E"
            />
          </View>
        </Animated.View>

        <Animated.View style={[styles.sectionCard, sectionStyle(2)]}>
          <SectionHeader title={t("landingHowTitle")} subtitle={t("landingHowSubtitle")} />
          <View style={styles.stack}>
            <HowStepCard step="1" title={t("landingStepDiscover")} icon="compass-outline" />
            <HowStepCard step="2" title={t("landingStepDownload")} icon="qrcode-scan" />
            <HowStepCard step="3" title={t("landingStepSave")} icon="chart-line" />
          </View>
        </Animated.View>

        <Animated.View style={[styles.sectionCard, sectionStyle(3)]}>
          <SectionHeader title={t("landingTrustTitle")} subtitle={t("landingTrustSubtitle")} />
          <View style={styles.trustGrid}>
            <TrustStatCard value={t("landingStatBusinessesValue")} label={t("landingStatBusinessesLabel")} />
            <TrustStatCard value={t("landingStatDealsValue")} label={t("landingStatDealsLabel")} />
            <TrustStatCard value={t("landingStatSavingsValue")} label={t("landingStatSavingsLabel")} />
          </View>
        </Animated.View>

        <Animated.View
          style={[styles.sectionCard, sectionStyle(4)]}
          onLayout={(event) => setPathOffset(event.nativeEvent.layout.y)}
        >
          <SectionHeader title={t("landingSplitTitle")} subtitle={t("landingSplitSubtitle")} />
          <View style={styles.splitGrid}>
            <PathChoiceCard
              title={t("landingPathCustomerTitle")}
              description={t("landingPathCustomerBody")}
              cta={t("landingPathCustomerCta")}
              icon="heart-outline"
              tone="user"
              onPress={() => goRegister("customer")}
            />
            <PathChoiceCard
              title={t("landingPathVendorTitle")}
              description={t("landingPathVendorBody")}
              cta={t("landingPathVendorCta")}
              icon="briefcase-outline"
              tone="vendor"
              onPress={() => goRegister("vendor")}
            />
          </View>
        </Animated.View>

        <Animated.View style={[styles.finalCard, sectionStyle(5)]}>
          <Text style={styles.finalTitle}>{t("landingFinalTitle")}</Text>
          <Text style={styles.finalSubtitle}>{t("landingFinalSubtitle")}</Text>
          <View style={styles.finalActions}>
            <AppButton label={t("landingFinalPrimaryCta")} onPress={() => goRegister("customer")} />
            <AppButton label={t("landingFinalSecondaryCta")} variant="ghost" onPress={goGuest} />
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg
  },
  bgBlobTop: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#E0E7FF",
    top: -90,
    right: -70,
    opacity: 0.8
  },
  bgBlobMid: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#DCFCE7",
    top: 360,
    left: -90,
    opacity: 0.5
  },
  bgBlobBottom: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#DBEAFE",
    bottom: -120,
    right: -110,
    opacity: 0.55
  },
  heroCard: {
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#FFFFFF",
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    shadowColor: "#1D4ED8",
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 22,
    elevation: 6
  },
  heroGradientA: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "#E0E7FF",
    top: -80,
    right: -70
  },
  heroGradientB: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#DCFCE7",
    bottom: -70,
    left: -60
  },
  badge: {
    color: colors.primaryDark,
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: "800",
    marginBottom: spacing.xs
  },
  locationHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    borderRadius: radii.sm,
    backgroundColor: "#EEF2FF",
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginBottom: spacing.sm
  },
  locationHintText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "700"
  },
  logo: {
    width: "100%",
    height: 130,
    marginBottom: spacing.md
  },
  heroTitle: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    marginBottom: spacing.sm
  },
  heroSubtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.md
  },
  heroActions: {
    gap: spacing.sm
  },
  sectionCard: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm
  },
  stack: {
    gap: spacing.sm
  },
  trustGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  splitGrid: {
    gap: spacing.sm
  },
  finalCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: radii.xl,
    padding: spacing.lg,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 7
  },
  finalTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    lineHeight: 31,
    fontWeight: "900",
    marginBottom: spacing.xs
  },
  finalSubtitle: {
    color: "#D1D5DB",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.md
  },
  finalActions: {
    gap: spacing.sm
  }
});
