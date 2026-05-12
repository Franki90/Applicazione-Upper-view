import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { CouponBuilderInput } from "../../types";
import { radii, spacing } from "../../theme/tokens";

type CouponPreviewProps = {
  businessName: string;
  logoUrl?: string;
  offerTitle: string;
  coupon: CouponBuilderInput;
};

const patternLabel: Record<CouponBuilderInput["pattern"], string> = {
  minimal: "MIN",
  dots: "DOT",
  waves: "WAV",
  diagonal_lines: "DGN",
  confetti: "CNF",
  gradient: "GRD",
  geometric: "GEO"
};

export const CouponPreview: React.FC<CouponPreviewProps> = ({ businessName, logoUrl, offerTitle, coupon }) => {
  const nativeBorderStyle =
    coupon.borderStyle === "dashed"
      ? "dashed"
      : coupon.borderStyle === "none"
      ? "solid"
      : coupon.borderStyle === "double" || coupon.borderStyle === "bold"
      ? "solid"
      : "solid";

  const borderWidth = coupon.borderStyle === "none" ? 0 : coupon.borderStyle === "bold" ? 3 : 2;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: coupon.backgroundColor,
          borderColor: coupon.primaryColor,
          borderStyle: nativeBorderStyle,
          borderWidth
        }
      ]}
    >
      <View style={styles.header}>
        <View style={styles.logoBox}>
          {logoUrl ? <Image source={{ uri: logoUrl }} style={styles.logo} resizeMode="contain" /> : null}
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.business, { color: coupon.textColor }]}>{businessName}</Text>
          <Text style={[styles.layout, { color: coupon.secondaryColor }]}>
            {coupon.layout.toUpperCase()} - {patternLabel[coupon.pattern]}
          </Text>
        </View>
      </View>

      <Text style={[styles.title, { color: coupon.textColor }]}>{coupon.title || offerTitle}</Text>
      {coupon.subtitle ? <Text style={[styles.subtitle, { color: coupon.textColor }]}>{coupon.subtitle}</Text> : null}

      <View style={styles.row}>
        <View style={[styles.codeBox, { borderColor: coupon.secondaryColor }]}>
          <Text style={[styles.codeLabel, { color: coupon.textColor }]}>Coupon code</Text>
          <Text style={[styles.code, { color: coupon.primaryColor }]}>{coupon.couponCode || "TD-DEMO-12345"}</Text>
        </View>
        <View style={[styles.qr, { backgroundColor: coupon.secondaryColor }]}>
          <Text style={[styles.qrText, { color: "#FFFFFF" }]}>QR</Text>
        </View>
      </View>

      <Text style={[styles.meta, { color: coupon.textColor }]}>
        Validity: {coupon.validityStart || "Start"} - {coupon.validityEnd || "End"}
      </Text>
      <Text style={[styles.meta, { color: coupon.textColor }]} numberOfLines={2}>
        {coupon.terms || "Terms and conditions"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.8)",
    overflow: "hidden"
  },
  logo: {
    width: "100%",
    height: "100%"
  },
  headerText: {
    flex: 1
  },
  business: {
    fontWeight: "900"
  },
  layout: {
    fontSize: 11,
    fontWeight: "800"
  },
  title: {
    fontSize: 18,
    fontWeight: "900"
  },
  subtitle: {
    fontSize: 13
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm
  },
  codeBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm
  },
  codeLabel: {
    fontSize: 11
  },
  code: {
    fontSize: 18,
    fontWeight: "900"
  },
  qr: {
    width: 74,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center"
  },
  qrText: {
    fontSize: 20,
    fontWeight: "900"
  },
  meta: {
    fontSize: 11
  }
});
