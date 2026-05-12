import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { AppButton } from "../../components/AppButton";
import { CategorySelector } from "../../components/CategorySelector";
import { ScreenContainer } from "../../components/ScreenContainer";
import { CouponBuilder } from "../../components/vendor/CouponBuilder";
import { useCategories } from "../../hooks/useCategories";
import {
  createOfferApi,
  generateCouponApi,
  getVendorDashboardApi,
  publishOfferApi,
  updateOfferApi,
  uploadCouponApi
} from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { colors, radii, spacing } from "../../theme/tokens";
import { CouponBuilderInput, OfferDraft } from "../../types";

const steps = ["basic", "included", "validity", "coupon", "preview"] as const;
type Step = (typeof steps)[number];

const defaultOffer: OfferDraft = {
  title: "",
  category: "",
  categoryIds: [],
  description: "",
  includedItems: [],
  terms: "",
  originalPrice: "",
  discountedPrice: "",
  discountPercentage: "",
  startDate: "",
  endDate: "",
  location: "",
  city: "Lugano",
  imageUrls: [],
  maxCouponDownloads: "100",
  usageLimitPerCustomer: "1"
};

const defaultCoupon: CouponBuilderInput = {
  type: "generated",
  title: "",
  subtitle: "",
  couponCode: "",
  offerDetails: "",
  terms: "",
  validityStart: "",
  validityEnd: "",
  layout: "modern",
  pattern: "gradient",
  primaryColor: "#4F46E5",
  secondaryColor: "#22C55E",
  textColor: "#111827",
  backgroundColor: "#F9FAFB",
  borderStyle: "solid"
};

const splitCsv = (input: string): string[] =>
  input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const isIsoDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);

const validateOffer = (offer: OfferDraft): string | null => {
  if (!offer.title || !offer.description || offer.categoryIds.length === 0) return "Fill basic offer info first.";
  if (!offer.originalPrice || !offer.discountedPrice) return "Add original and discounted prices.";
  if (!Number.isFinite(Number(offer.originalPrice)) || !Number.isFinite(Number(offer.discountedPrice))) {
    return "Prices must be valid numbers.";
  }
  if (Number(offer.discountedPrice) > Number(offer.originalPrice)) {
    return "Discounted price must be lower than original price.";
  }
  if (!offer.includedItems.length || !offer.terms) return "Add included items and terms.";
  if (!isIsoDate(offer.startDate) || !isIsoDate(offer.endDate)) return "Use date format YYYY-MM-DD.";
  if (!offer.location || !offer.city) return "Location and city are required.";
  if (!offer.imageUrls.length) return "Add at least one offer image URL.";
  if (!offer.maxCouponDownloads || !offer.usageLimitPerCustomer) return "Set coupon limits.";
  return null;
};

export const CreateOfferScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { i18n } = useTranslation();
  const lang = (i18n.language?.slice(0, 2) ?? "it") as "it" | "en" | "de" | "fr" | "es";
  const categories = useCategories();
  const { token, role } = useAuthStore((state) => ({
    token: state.token,
    role: state.role
  }));
  const [step, setStep] = useState<Step>("basic");
  const [offer, setOffer] = useState<OfferDraft>(defaultOffer);
  const [coupon, setCoupon] = useState<CouponBuilderInput>(defaultCoupon);
  const [includedText, setIncludedText] = useState("");
  const [imagesText, setImagesText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [draftOfferId, setDraftOfferId] = useState<string | null>(null);
  const [vendorName, setVendorName] = useState("Vendor");
  const [vendorLogo, setVendorLogo] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!token || role !== "vendor") return;
    const loadVendor = async () => {
      try {
        const dashboard = await getVendorDashboardApi(token);
        setVendorName(dashboard.vendor.businessName || "Vendor");
        setVendorLogo(dashboard.vendor.logoUrl ?? undefined);
        setOffer((current) => ({
          ...current,
          categoryIds: dashboard.vendor.categoryIds ?? [],
          category: dashboard.vendor.categoryIds?.[0] ?? ""
        }));
        setCoupon((current) => ({
          ...current,
          primaryColor: dashboard.vendor.branding.primaryColor,
          secondaryColor: dashboard.vendor.branding.secondaryColor,
          backgroundColor: dashboard.vendor.branding.backgroundColor
        }));
      } catch (_error) {
        // Keep defaults if dashboard is unavailable.
      }
    };

    void loadVendor();
  }, [token, role]);

  const activeStep = useMemo(() => steps.indexOf(step) + 1, [step]);
  const previewCategories = useMemo(() => {
    return offer.categoryIds
      .map((id) => categories.find((item) => item.id === id)?.name[lang] ?? id)
      .join(", ");
  }, [categories, lang, offer.categoryIds]);

  const nextStep = () => {
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const onSubmit = async () => {
    if (!token || role !== "vendor") {
      Alert.alert("Vendor only", "Switch to a vendor account to publish offers.");
      return;
    }

    const error = validateOffer(offer);
    if (error) {
      Alert.alert("Missing information", error);
      return;
    }

    setSubmitting(true);
    try {
      const saved = draftOfferId
        ? await updateOfferApi(token, draftOfferId, offer)
        : await createOfferApi(token, offer);

      const offerId = saved.offer.id;
      setDraftOfferId(offerId);

      const couponPayload: CouponBuilderInput = {
        ...coupon,
        title: coupon.title || `${offer.title} Coupon`,
        offerDetails: coupon.offerDetails || offer.description,
        terms: coupon.terms || offer.terms,
        validityStart: coupon.validityStart || offer.startDate,
        validityEnd: coupon.validityEnd || offer.endDate
      };

      if (couponPayload.type === "uploaded") {
        await uploadCouponApi(token, offerId, couponPayload);
      } else {
        await generateCouponApi(token, offerId, couponPayload);
      }

      await publishOfferApi(token, offerId);
      Alert.alert("Offer submitted", "Your offer is now pending admin approval.");
      navigation.navigate("MainTabs", { screen: "VendorDashboard" });
    } catch (submitError) {
      Alert.alert("Publish failed", submitError instanceof Error ? submitError.message : "Unable to publish offer");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Create offer</Text>
      <Text style={styles.subtitle}>Step {activeStep}/5</Text>

      <View style={styles.stepper}>
        {steps.map((stepItem, index) => (
          <Pressable
            key={stepItem}
            onPress={() => setStep(stepItem)}
            style={[styles.stepChip, stepItem === step ? styles.stepChipActive : null]}
          >
            <Text style={[styles.stepChipText, stepItem === step ? styles.stepChipTextActive : null]}>
              {index + 1}
            </Text>
          </Pressable>
        ))}
      </View>

      {step === "basic" ? (
        <View style={styles.card}>
          <Text style={styles.section}>Step 1 - Basic offer info</Text>
          <TextInput value={offer.title} onChangeText={(title) => setOffer({ ...offer, title })} placeholder="Offer title" style={styles.input} />
          <Text style={styles.label}>Offer categories</Text>
          <CategorySelector
            selectedIds={offer.categoryIds}
            onChange={(categoryIds) => setOffer({ ...offer, categoryIds, category: categoryIds[0] ?? "" })}
            maxSelection={5}
          />
          <TextInput
            value={offer.description}
            onChangeText={(description) => setOffer({ ...offer, description })}
            placeholder="Offer description"
            multiline
            style={[styles.input, styles.textArea]}
          />
          <View style={styles.row}>
            <TextInput
              value={offer.originalPrice}
              onChangeText={(originalPrice) => setOffer({ ...offer, originalPrice })}
              placeholder="Original price"
              keyboardType="decimal-pad"
              style={[styles.input, styles.half]}
            />
            <TextInput
              value={offer.discountedPrice}
              onChangeText={(discountedPrice) => setOffer({ ...offer, discountedPrice })}
              placeholder="Discounted price"
              keyboardType="decimal-pad"
              style={[styles.input, styles.half]}
            />
          </View>
          <TextInput
            value={offer.discountPercentage}
            onChangeText={(discountPercentage) => setOffer({ ...offer, discountPercentage })}
            placeholder="Discount percentage (optional)"
            keyboardType="decimal-pad"
            style={styles.input}
          />
        </View>
      ) : null}

      {step === "included" ? (
        <View style={styles.card}>
          <Text style={styles.section}>Step 2 - What is included</Text>
          <TextInput
            value={includedText}
            onChangeText={(text) => {
              setIncludedText(text);
              setOffer({ ...offer, includedItems: splitCsv(text) });
            }}
            placeholder="Comma separated included items"
            multiline
            style={[styles.input, styles.textArea]}
          />
          <TextInput
            value={offer.terms}
            onChangeText={(terms) => setOffer({ ...offer, terms })}
            placeholder="Terms and conditions"
            multiline
            style={[styles.input, styles.textArea]}
          />
        </View>
      ) : null}

      {step === "validity" ? (
        <View style={styles.card}>
          <Text style={styles.section}>Step 3 - Validity period</Text>
          <View style={styles.row}>
            <TextInput
              value={offer.startDate}
              onChangeText={(startDate) => setOffer({ ...offer, startDate })}
              placeholder="Start date YYYY-MM-DD"
              style={[styles.input, styles.half]}
            />
            <TextInput
              value={offer.endDate}
              onChangeText={(endDate) => setOffer({ ...offer, endDate })}
              placeholder="End date YYYY-MM-DD"
              style={[styles.input, styles.half]}
            />
          </View>
          <TextInput value={offer.location} onChangeText={(location) => setOffer({ ...offer, location })} placeholder="Location" style={styles.input} />
          <TextInput value={offer.city} onChangeText={(city) => setOffer({ ...offer, city })} placeholder="City/Area" style={styles.input} />
          <TextInput
            value={imagesText}
            onChangeText={(text) => {
              setImagesText(text);
              setOffer({ ...offer, imageUrls: splitCsv(text) });
            }}
            placeholder="Image URLs, comma separated"
            autoCapitalize="none"
            style={styles.input}
          />
          <View style={styles.row}>
            <TextInput
              value={offer.maxCouponDownloads}
              onChangeText={(maxCouponDownloads) => setOffer({ ...offer, maxCouponDownloads })}
              placeholder="Max coupon downloads"
              keyboardType="number-pad"
              style={[styles.input, styles.half]}
            />
            <TextInput
              value={offer.usageLimitPerCustomer}
              onChangeText={(usageLimitPerCustomer) => setOffer({ ...offer, usageLimitPerCustomer })}
              placeholder="Usage per customer"
              keyboardType="number-pad"
              style={[styles.input, styles.half]}
            />
          </View>
        </View>
      ) : null}

      {step === "coupon" ? (
        <View style={styles.card}>
          <Text style={styles.section}>Step 4 - Coupon creation</Text>
          <CouponBuilder value={coupon} onChange={setCoupon} businessName={vendorName} logoUrl={vendorLogo} offerTitle={offer.title} />
        </View>
      ) : null}

      {step === "preview" ? (
        <View style={styles.card}>
          <Text style={styles.section}>Step 5 - Preview and publish</Text>
          <Text style={styles.previewLabel}>Offer title</Text>
          <Text style={styles.previewValue}>{offer.title || "-"}</Text>
          <Text style={styles.previewLabel}>Category</Text>
          <Text style={styles.previewValue}>{previewCategories || "-"}</Text>
          <Text style={styles.previewLabel}>Period</Text>
          <Text style={styles.previewValue}>{offer.startDate || "-"} - {offer.endDate || "-"}</Text>
          <Text style={styles.previewLabel}>Coupon type</Text>
          <Text style={styles.previewValue}>{coupon.type}</Text>
          <Text style={styles.previewLabel}>Discount</Text>
          <Text style={styles.previewValue}>CHF {offer.originalPrice || "-"} -> CHF {offer.discountedPrice || "-"}</Text>

          <AppButton label={submitting ? "Publishing..." : "Publish offer"} onPress={onSubmit} disabled={submitting} />
        </View>
      ) : null}

      <View style={styles.nav}>
        <AppButton label="Back" variant="ghost" onPress={prevStep} />
        {step !== "preview" ? <AppButton label="Next" onPress={nextStep} /> : null}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.sm
  },
  stepper: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  stepChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  stepChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  stepChipText: {
    color: colors.textSecondary,
    fontWeight: "800"
  },
  stepChipTextActive: {
    color: "#FFFFFF"
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  section: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 16
  },
  label: {
    color: colors.text,
    fontWeight: "700"
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.md,
    paddingVertical: 10
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top"
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm
  },
  half: {
    flex: 1
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  previewLabel: {
    color: colors.textSecondary,
    fontSize: 12
  },
  previewValue: {
    color: colors.text,
    fontWeight: "700"
  }
});
