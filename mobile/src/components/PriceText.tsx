import React from "react";
import { Text, TextStyle } from "react-native";
import { colors } from "@/theme/tokens";

export function formatNaira(minorUnits: number): string {
  const naira = Math.floor(minorUnits / 100);
  return `₦${naira.toLocaleString("en-NG")}`;
}

interface PriceTextProps {
  amountMinor: number;
  style?: TextStyle;
  compareAtMinor?: number | null;
}

export const PriceText: React.FC<PriceTextProps> = ({ amountMinor, style, compareAtMinor }) => {
  return (
    <Text style={[{ color: colors.textPrimary, fontWeight: "700", fontSize: 16 }, style]}>
      {formatNaira(amountMinor)}
      {compareAtMinor && compareAtMinor > amountMinor ? (
        <Text style={{ textDecorationLine: "line-through", color: colors.textMuted, fontSize: 13, fontWeight: "400" }}>
          {"  "}{formatNaira(compareAtMinor)}
        </Text>
      ) : null}
    </Text>
  );
};
