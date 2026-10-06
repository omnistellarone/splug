import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@/theme/tokens";
import { api } from "@/lib/api";
import { formatNaira } from "@/components/PriceText";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShoppingBag,
  RefreshCw,
  Mail,
  ShieldCheck,
} from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "PaymentStatus">;

export const PaymentStatusScreen: React.FC<Props> = ({ route, navigation }) => {
  const { reference, failed, orderId: initialOrderId } = route.params || {};

  const [status, setStatus] = useState<"verifying" | "paid" | "failed">(
    failed ? "failed" : "verifying"
  );
  const [orderId, setOrderId] = useState<string | null>(initialOrderId || null);
  const [amountMinor, setAmountMinor] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (failed) {
      setStatus("failed");
      setErrorMessage("The transaction was not completed or was cancelled.");
      return;
    }

    if (reference) {
      verifyTransaction(reference);
    } else {
      setStatus("failed");
      setErrorMessage("No transaction reference was provided.");
    }
  }, [reference, failed]);

  const verifyTransaction = async (ref: string) => {
    setStatus("verifying");
    try {
      const res = await api.verifyPayment(ref);
      if (res.success && res.data) {
        setStatus("paid");
        setOrderId(res.data.orderId);
        setAmountMinor(res.data.amountMinor || 0);
      } else {
        setStatus("failed");
        setErrorMessage(res.error || "Unable to confirm payment status.");
      }
    } catch (err: unknown) {
      setStatus("failed");
      setErrorMessage(err instanceof Error ? err.message : "Verification connection failed.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        {/* State 1: Verifying */}
        {status === "verifying" && (
          <View style={styles.contentBox}>
            <View style={styles.spinnerCircle}>
              <ActivityIndicator size="large" color={colors.brand} />
            </View>
            <Text style={styles.statusTitle}>Verifying Payment</Text>
            <Text style={styles.statusSubtitle}>
              Please hold on while we verify your transaction with Paystack and secure your inventory.
            </Text>
            {reference && (
              <View style={styles.refBadge}>
                <Text style={styles.refText}>Ref: {reference}</Text>
              </View>
            )}
          </View>
        )}

        {/* State 2: Paid & Confirmed */}
        {status === "paid" && (
          <View style={styles.contentBox}>
            <View style={styles.successCircle}>
              <CheckCircle2 size={54} color={colors.success} />
            </View>
            <Text style={styles.statusTitle}>Payment Successful!</Text>
            <Text style={styles.statusSubtitle}>
              Your electronics order has been placed and payment confirmed.
            </Text>

            {/* Receipt Summary Card */}
            <View style={styles.receiptCard}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Transaction Ref</Text>
                <Text style={styles.receiptValue} numberOfLines={1}>
                  {reference}
                </Text>
              </View>

              {orderId && (
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Order Number</Text>
                  <Text style={styles.receiptValue}>
                    {orderId.substring(0, 8).toUpperCase()}
                  </Text>
                </View>
              )}

              {amountMinor > 0 && (
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Amount Paid</Text>
                  <Text style={[styles.receiptValue, { color: colors.brand, fontWeight: "800" }]}>
                    {formatNaira(amountMinor)}
                  </Text>
                </View>
              )}

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Payment Status</Text>
                <View style={styles.paidPill}>
                  <Text style={styles.paidPillText}>VERIFIED</Text>
                </View>
              </View>
            </View>

            {/* Mailgun Confirmation Notice */}
            <View style={styles.mailgunNotice}>
              <Mail size={16} color={colors.brand} />
              <Text style={styles.mailgunText}>
                Order receipt & tracking details sent via Mailgun
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actionsGroup}>
              {orderId && (
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={() => navigation.replace("OrderTracking", { orderId })}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryActionText}>Track Live Order</Text>
                  <ArrowRight size={18} color={colors.onPrimary} />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.secondaryActionBtn}
                onPress={() => navigation.navigate("Home")}
                activeOpacity={0.8}
              >
                <ShoppingBag size={18} color={colors.brand} />
                <Text style={styles.secondaryActionText}>Continue Shopping</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* State 3: Failed */}
        {status === "failed" && (
          <View style={styles.contentBox}>
            <View style={styles.failedCircle}>
              <XCircle size={54} color={colors.danger} />
            </View>
            <Text style={styles.statusTitle}>Payment Incomplete</Text>
            <Text style={styles.statusSubtitle}>
              {errorMessage || "We could not verify your payment transaction. Your cart has been preserved."}
            </Text>

            {reference && (
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => verifyTransaction(reference)}
                activeOpacity={0.85}
              >
                <RefreshCw size={18} color={colors.onPrimary} />
                <Text style={styles.retryBtnText}>Recheck Verification</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.cartReturnBtn}
              onPress={() => navigation.navigate("Cart")}
              activeOpacity={0.8}
            >
              <Text style={styles.cartReturnText}>Return to Shopping Cart</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: "center",
  },
  contentBox: {
    alignItems: "center",
  },
  spinnerCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.brandLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  successCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.successLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  failedCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.dangerLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  statusSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  refBadge: {
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  refText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
  },
  receiptCard: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
    marginBottom: spacing.base,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  receiptLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  receiptValue: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
    maxWidth: "60%",
  },
  paidPill: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  paidPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.success,
  },
  mailgunNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.brandLight,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.xl,
  },
  mailgunText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.brand,
  },
  actionsGroup: {
    width: "100%",
    gap: spacing.md,
  },
  primaryActionBtn: {
    width: "100%",
    height: 48,
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryActionText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryActionBtn: {
    width: "100%",
    height: 48,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryActionText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  retryBtn: {
    width: "100%",
    height: 48,
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: spacing.md,
  },
  retryBtnText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  cartReturnBtn: {
    padding: spacing.md,
  },
  cartReturnText: {
    fontSize: 13,
    color: colors.brand,
    fontWeight: "600",
  },
});
