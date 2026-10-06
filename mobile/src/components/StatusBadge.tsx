import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radius } from "@/theme/tokens";

interface StatusBadgeProps {
  status: string;
  type?: "order" | "payment";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = (status || "").toLowerCase();

  let bg = colors.surfaceContainer;
  let text = colors.textSecondary;
  let label = status;

  switch (normalized) {
    case "paid":
      bg = colors.successLight;
      text = colors.success;
      label = "Paid";
      break;
    case "delivered":
      bg = colors.successLight;
      text = colors.success;
      label = "Delivered";
      break;
    case "shipped":
    case "dispatched":
      bg = colors.infoLight;
      text = colors.info;
      label = "Shipped";
      break;
    case "processing":
      bg = colors.infoLight;
      text = colors.info;
      label = "Processing";
      break;
    case "payment_init":
    case "initiated":
      bg = colors.warningLight;
      text = colors.warning;
      label = "Payment Pending";
      break;
    case "pending":
      bg = colors.warningLight;
      text = colors.warning;
      label = "Pending";
      break;
    case "failed":
    case "cancelled":
      bg = colors.dangerLight;
      text = colors.danger;
      label = normalized === "cancelled" ? "Cancelled" : "Failed";
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
});
