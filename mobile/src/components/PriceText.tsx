import React from "react";
import { View, Text, TextStyle, ViewStyle } from "react-native";
import { colors } from "@/theme/tokens";

export function formatNaira(minorUnits: number): string {
  const naira = Math.floor(minorUnits / 100);
  return `₦${naira.toLocaleString("en-NG")}`;
}

interface PriceTextProps {
  amountMinor: number;
  style?: TextStyle;
  compareAtMinor?: number | null;
  stacked?: boolean;
  containerStyle?: ViewStyle;
}

export const PriceText: React.FC<PriceTextProps> = ({
  amountMinor,
  style,
  compareAtMinor,
  stacked = false,
  containerStyle,
}) => {
  const hasCompare = Boolean(compareAtMinor && compareAtMinor > amountMinor);

  if (stacked) {
    return (
      <View style={[{ flexShrink: 1, minWidth: 0 }, containerStyle]}>
        <Text
          numberOfLines={1}
          style={[{ color: colors.textPrimary, fontWeight: "700", fontSize: 13 }, style]}
        >
          {formatNaira(amountMinor)}
        </Text>
        {hasCompare && compareAtMinor ? (
          <Text
            numberOfLines={1}
            style={{
              textDecorationLine: "line-through",
              color: colors.textMuted,
              fontSize: 10,
              fontWeight: "400",
              marginTop: 1,
            }}
          >
            {formatNaira(compareAtMinor)}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", gap: 6 }, containerStyle]}>
      <Text style={[{ color: colors.textPrimary, fontWeight: "700", fontSize: 16 }, style]}>
        {formatNaira(amountMinor)}
      </Text>
      {hasCompare && compareAtMinor ? (
        <Text
          style={{
            textDecorationLine: "line-through",
            color: colors.textMuted,
            fontSize: 13,
            fontWeight: "400",
          }}
        >
          {formatNaira(compareAtMinor)}
        </Text>
      ) : null}
    </View>
  );
};

