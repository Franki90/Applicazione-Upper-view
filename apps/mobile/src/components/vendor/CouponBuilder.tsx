import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { CouponBuilderInput, CouponBorderStyle, CouponLayout, CouponPattern } from "../../types";
import { colors, radii, spacing } from "../../theme/tokens";
import { CouponPreview } from "./CouponPreview";

type CouponBuilderProps = {
  value: CouponBuilderInput;
  onChange: (value: CouponBuilderInput) => void;
  businessName: string;
  logoUrl?: string;
  offerTitle: string;
};

const layouts: CouponLayout[] = ["classic", "modern", "premium", "youthful", "minimal"];
const patterns: CouponPattern[] = [
  "minimal",
  "dots",
  "waves",
  "diagonal_lines",
  "confetti",
  "gradient",
  "geometric"
];
const borders: CouponBorderStyle[] = ["none", "solid", "dashed", "double", "bold"];

const ChoiceGroup: React.FC<{
  label: string;
  values: string[];
  selected: string;
  onSelect: (value: string) => void;
}> = ({ label, values, selected, onSelect }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.choices}>
      {values.map((item) => (
        <Pressable
          key={item}
          onPress={() => onSelect(item)}
          style={[styles.choice, selected === item ? styles.choiceActive : null]}
        >
          <Text style={[styles.choiceText, selected === item ? styles.choiceTextActive : null]}>{item}</Text>
        </Pressable>
      ))}
    </View>
  </View>
);

const ColorInput: React.FC<{
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}> = ({ label, value, onChangeText }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.colorRow}>
      <View style={[styles.colorSample, { backgroundColor: value }]} />
      <TextInput value={value} onChangeText={onChangeText} autoCapitalize="characters" style={styles.input} />
    </View>
  </View>
);

export const CouponBuilder: React.FC<CouponBuilderProps> = ({
  value,
  onChange,
  businessName,
  logoUrl,
  offerTitle
}) => {
  const update = <K extends keyof CouponBuilderInput>(key: K, nextValue: CouponBuilderInput[K]) => {
    onChange({ ...value, [key]: nextValue });
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Coupon builder</Text>

      <ChoiceGroup
        label="Type"
        values={["generated", "uploaded"]}
        selected={value.type}
        onSelect={(item) => update("type", item as CouponBuilderInput["type"])}
      />

      <TextInput
        placeholder="Coupon title"
        value={value.title}
        onChangeText={(text) => update("title", text)}
        style={styles.input}
      />
      <TextInput
        placeholder="Coupon subtitle"
        value={value.subtitle}
        onChangeText={(text) => update("subtitle", text)}
        style={styles.input}
      />
      <TextInput
        placeholder="Coupon code"
        value={value.couponCode}
        onChangeText={(text) => update("couponCode", text)}
        autoCapitalize="characters"
        style={styles.input}
      />

      {value.type === "uploaded" ? (
        <TextInput
          placeholder="Uploaded coupon file URL"
          value={value.uploadedFileUrl ?? ""}
          onChangeText={(text) => update("uploadedFileUrl", text)}
          autoCapitalize="none"
          style={styles.input}
        />
      ) : null}

      <View style={styles.row}>
        <TextInput
          placeholder="Validity start (YYYY-MM-DD)"
          value={value.validityStart}
          onChangeText={(text) => update("validityStart", text)}
          style={[styles.input, styles.half]}
        />
        <TextInput
          placeholder="Validity end (YYYY-MM-DD)"
          value={value.validityEnd}
          onChangeText={(text) => update("validityEnd", text)}
          style={[styles.input, styles.half]}
        />
      </View>

      <TextInput
        placeholder="Offer details"
        value={value.offerDetails}
        onChangeText={(text) => update("offerDetails", text)}
        multiline
        style={[styles.input, styles.textArea]}
      />
      <TextInput
        placeholder="Terms and conditions"
        value={value.terms}
        onChangeText={(text) => update("terms", text)}
        multiline
        style={[styles.input, styles.textArea]}
      />

      <ChoiceGroup
        label="Layout"
        values={layouts}
        selected={value.layout}
        onSelect={(item) => update("layout", item as CouponLayout)}
      />
      <ChoiceGroup
        label="Pattern"
        values={patterns}
        selected={value.pattern}
        onSelect={(item) => update("pattern", item as CouponPattern)}
      />
      <ChoiceGroup
        label="Border style"
        values={borders}
        selected={value.borderStyle}
        onSelect={(item) => update("borderStyle", item as CouponBorderStyle)}
      />

      <ColorInput label="Primary color" value={value.primaryColor} onChangeText={(text) => update("primaryColor", text)} />
      <ColorInput
        label="Secondary color"
        value={value.secondaryColor}
        onChangeText={(text) => update("secondaryColor", text)}
      />
      <ColorInput label="Text color" value={value.textColor} onChangeText={(text) => update("textColor", text)} />
      <ColorInput
        label="Background color"
        value={value.backgroundColor}
        onChangeText={(text) => update("backgroundColor", text)}
      />

      <CouponPreview businessName={businessName} logoUrl={logoUrl} offerTitle={offerTitle} coupon={value} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  field: {
    gap: spacing.xs
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700"
  },
  choices: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  choice: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF"
  },
  choiceActive: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.primary
  },
  choiceText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700"
  },
  choiceTextActive: {
    color: colors.primaryDark
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.md,
    paddingVertical: 10
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm
  },
  half: {
    flex: 1
  },
  textArea: {
    minHeight: 72,
    textAlignVertical: "top"
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  colorSample: {
    width: 26,
    height: 26,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border
  }
});
