import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

type Props = {
  enabled: boolean;
  onPress?: () => void;
  title: string;
  subtitle?: string;
  pill?: string; // e.g. "🔒 Connect to enable"
};

export const FeatureGate: React.FC<Props> = ({ enabled, onPress, title, subtitle, pill }) => {
  return (
    <TouchableOpacity disabled={!enabled} onPress={onPress} activeOpacity={0.9} style={[styles.card, !enabled && styles.cardDisabled]}>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        {!enabled && (
          <View style={styles.pill}>
            <Text style={styles.pillText}>{pill ?? "🔒 Connect to enable"}</Text>
          </View>
        )}
      </View>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  cardDisabled: {
    opacity: 0.7,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: colors.text, fontSize: 16, fontWeight: "600" },
  subtitle: { color: colors.textMuted, marginTop: 6 },
  pill: { backgroundColor: colors.pillBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  pillText: { color: colors.pillText, fontSize: 12, fontWeight: "600" },
});
