import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, radius, spacing } from "@/theme/tokens";
import { Zap, ShoppingBag } from "lucide-react-native";
import { useCart } from "@/context/CartContext";

interface HeaderProps {
  onPressCart?: () => void;
  showCart?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onPressCart, showCart = true }) => {
  const { totals } = useCart();

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <View style={styles.logoBox}>
          <Zap size={18} color={colors.onPrimary} fill={colors.onPrimary} />
        </View>
        <View style={styles.titleBox}>
          <Text style={styles.brandTitle}>Slurge</Text>
          <Text style={styles.brandReg}>®</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <View style={styles.nigeriaPill}>
          <View style={styles.greenDot} />
          <Text style={styles.nigeriaText}>Electronics NG</Text>
        </View>

        {showCart && (
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={onPressCart}
            activeOpacity={0.7}
            accessibilityLabel="Shopping Cart"
          >
            <ShoppingBag size={20} color={colors.textPrimary} />
            {totals.itemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totals.itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logoBox: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  titleBox: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  brandReg: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textMuted,
    marginLeft: 2,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  nigeriaPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  nigeriaText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  cartBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: colors.brand,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.onPrimary,
    fontSize: 10,
    fontWeight: "700",
  },
});
