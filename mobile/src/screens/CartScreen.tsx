import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { colors, radius, spacing } from "@/theme/tokens";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatNaira } from "@/components/PriceText";
import {
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShoppingBag,
  Tag,
  CheckCircle2,
  Truck,
  X,
} from "lucide-react-native";

export const CartScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const {
    items,
    totals,
    shippingMinor,
    finalTotalMinor,
    couponCode,
    couponDiscountMinor,
    couponError,
    isLoading,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    refreshCart,
  } = useCart();

  useFocusEffect(
    useCallback(() => {
      refreshCart();
    }, [refreshCart])
  );

  const [inputCoupon, setInputCoupon] = useState<string>("");
  const [applyingCoupon, setApplyingCoupon] = useState<boolean>(false);

  const handleApplyCoupon = async () => {
    if (!inputCoupon.trim()) return;
    setApplyingCoupon(true);
    await applyCoupon(inputCoupon);
    setApplyingCoupon(false);
  };

  const handleCheckoutPress = () => {
    if (!user) {
      Alert.alert(
        "Authentication Required",
        "Please sign in or create an account to complete your checkout order.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => navigation.navigate("Auth") },
        ]
      );
      return;
    }
    navigation.navigate("Checkout");
  };

  const freeShippingProgress = Math.min(
    1,
    totals.subtotalMinor / totals.freeShippingThresholdMinor
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {/* Free Shipping Progress Indicator (Stitch Screen 4) */}
      <View style={styles.shippingCard}>
        <View style={styles.shippingTitleRow}>
          <Truck size={16} color={totals.qualifiesForFreeShipping ? colors.success : colors.brand} />
          <Text style={styles.shippingTitle}>
            {totals.qualifiesForFreeShipping
              ? "🎉 You unlocked Free Express Delivery!"
              : `Add ${formatNaira(totals.amountNeededForFreeShippingMinor)} more for Free Express Delivery`}
          </Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${freeShippingProgress * 100}%`,
                backgroundColor: totals.qualifiesForFreeShipping ? colors.success : colors.brand,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footerSection}>
      {/* Coupon Application Box */}
      <View style={styles.couponCard}>
        <View style={styles.couponHeader}>
          <Tag size={16} color={colors.brand} />
          <Text style={styles.couponTitle}>Discount Code</Text>
        </View>

        {couponCode ? (
          <View style={styles.activeCouponRow}>
            <View style={styles.activeCouponBadge}>
              <CheckCircle2 size={14} color={colors.success} />
              <Text style={styles.activeCouponText}>{couponCode}</Text>
              <Text style={styles.activeCouponDiscount}>(-{formatNaira(couponDiscountMinor)})</Text>
            </View>
            <TouchableOpacity onPress={removeCoupon} style={styles.removeCouponBtn}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={styles.couponInputRow}>
              <TextInput
                style={styles.couponInput}
                placeholder="Enter coupon code (e.g. WELCOME10)"
                placeholderTextColor={colors.textPlaceholder}
                value={inputCoupon}
                onChangeText={setInputCoupon}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={handleApplyCoupon}
                disabled={applyingCoupon || !inputCoupon.trim()}
                activeOpacity={0.8}
              >
                {applyingCoupon ? (
                  <ActivityIndicator size="small" color={colors.onPrimary} />
                ) : (
                  <Text style={styles.applyBtnText}>Apply</Text>
                )}
              </TouchableOpacity>
            </View>
            {couponError && <Text style={styles.couponErrorText}>{couponError}</Text>}
          </View>
        )}
      </View>

      {/* Order Summary Breakdown */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Order Summary</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal ({totals.itemCount} items)</Text>
          <Text style={styles.summaryValue}>{formatNaira(totals.subtotalMinor)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <Text
            style={[
              styles.summaryValue,
              shippingMinor === 0 && { color: colors.success, fontWeight: "700" },
            ]}
          >
            {shippingMinor === 0 ? "FREE" : formatNaira(shippingMinor)}
          </Text>
        </View>

        {couponDiscountMinor > 0 && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.success }]}>Discount ({couponCode})</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>
              -{formatNaira(couponDiscountMinor)}
            </Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Estimated Total</Text>
          <Text style={styles.totalValue}>{formatNaira(finalTotalMinor)}</Text>
        </View>
      </View>
    </View>
  );

  if (items.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.topBar}>
          <Text style={styles.topBarTitle}>Shopping Cart</Text>
        </View>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refreshCart}
              tintColor={colors.brand}
              colors={[colors.brand]}
            />
          }
        >
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <ShoppingBag size={48} color={colors.textPlaceholder} />
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>
              Looks like you haven't added any electronics to your cart yet.
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => navigation.navigate("Home")}
              activeOpacity={0.8}
            >
              <Text style={styles.exploreBtnText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topBarTitle}>Shopping Cart</Text>
          <Text style={styles.topBarCount}>{totals.itemCount} Items</Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            Alert.alert("Clear Cart", "Are you sure you want to remove all items?", [
              { text: "Cancel", style: "cancel" },
              { text: "Clear", style: "destructive", onPress: clearCart },
            ])
          }
        >
          <Text style={styles.clearBtnText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.variantId}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshCart}
            tintColor={colors.brand}
            colors={[colors.brand]}
          />
        }
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemImageWrapper}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="contain" />
              ) : (
                <View style={styles.itemPlaceholder}>
                  <Text style={{ fontSize: 10, color: colors.textMuted }}>No Image</Text>
                </View>
              )}
            </View>

            <View style={styles.itemInfo}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.productName}
                </Text>
                <TouchableOpacity
                  onPress={() => removeFromCart(item.variantId)}
                  style={styles.deleteBtn}
                  activeOpacity={0.7}
                >
                  <Trash2 size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>

              {item.variantOptions && Object.keys(item.variantOptions).length > 0 && (
                <Text style={styles.itemVariantText}>
                  {Object.values(item.variantOptions).join(" • ")}
                </Text>
              )}

              <View style={styles.itemBottomRow}>
                <Text style={styles.itemPrice}>{formatNaira(item.priceMinor)}</Text>

                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.variantId, item.quantity - 1)}
                  >
                    <Minus size={14} color={colors.textPrimary} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.variantId, item.quantity + 1)}
                    disabled={item.quantity >= item.maxStock}
                  >
                    <Plus
                      size={14}
                      color={item.quantity >= item.maxStock ? colors.outlineVariant : colors.textPrimary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      />

      {/* Sticky Bottom Checkout Bar */}
      <View style={styles.checkoutBar}>
        <View>
          <Text style={styles.checkoutBarLabel}>Total to Pay</Text>
          <Text style={styles.checkoutBarAmount}>{formatNaira(finalTotalMinor)}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={handleCheckoutPress}
          activeOpacity={0.85}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
          <ArrowRight size={18} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  topBarCount: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  clearBtnText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: 110,
  },
  headerSection: {
    marginVertical: spacing.md,
  },
  shippingCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  shippingTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  shippingTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
    flex: 1,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: radius.pill,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    gap: spacing.md,
  },
  itemImageWrapper: {
    width: 76,
    height: 76,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  itemPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    flex: 1,
    paddingRight: 8,
  },
  deleteBtn: {
    padding: 4,
  },
  itemVariantText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qtyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
    paddingHorizontal: 8,
  },
  footerSection: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  couponCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  couponHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: spacing.sm,
  },
  couponTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  couponInputRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  couponInput: {
    flex: 1,
    height: 42,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    fontSize: 13,
    color: colors.textPrimary,
  },
  applyBtn: {
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.base,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
  },
  applyBtnText: {
    color: colors.onPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  couponErrorText: {
    fontSize: 11,
    color: colors.danger,
    marginTop: 6,
  },
  activeCouponRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.successLight,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  activeCouponBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  activeCouponText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.success,
  },
  activeCouponDiscount: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.success,
  },
  removeCouponBtn: {
    padding: 4,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.brand,
  },
  checkoutBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  checkoutBarLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  checkoutBarAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  checkoutBtn: {
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.lg,
    height: 48,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkoutBtnText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.base,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  exploreBtn: {
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  exploreBtnText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
});
