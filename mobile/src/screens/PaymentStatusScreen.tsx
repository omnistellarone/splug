import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@/theme/tokens";
import { api, Order } from "@/lib/api";
import { formatNaira } from "@/components/PriceText";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Copy,
  MapPin,
  Zap,
  Package,
  Share2,
  Building2,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
} from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "PaymentStatus">;

export const PaymentStatusScreen: React.FC<Props> = ({ route, navigation }) => {
  const { reference, failed, orderId: initialOrderId } = route.params || {};

  const [activeTab, setActiveTab] = useState<"success" | "pending" | "failed">(
    failed ? "failed" : "success"
  );
  const [status, setStatus] = useState<"verifying" | "paid" | "failed">(
    failed ? "failed" : "verifying"
  );
  const [orderId, setOrderId] = useState<string | null>(initialOrderId || null);
  const [order, setOrder] = useState<Order | null>(null);
  const [amountMinor, setAmountMinor] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (failed) {
      setStatus("failed");
      setActiveTab("failed");
      setErrorMessage("The transaction was not completed or was cancelled.");
      return;
    }

    if (reference) {
      verifyTransaction(reference);
    } else if (initialOrderId) {
      setStatus("paid");
      setActiveTab("success");
      loadOrderDetails(initialOrderId);
    } else {
      setStatus("failed");
      setActiveTab("failed");
      setErrorMessage("No transaction reference was provided.");
    }
  }, [reference, failed, initialOrderId]);

  const verifyTransaction = async (ref: string) => {
    setStatus("verifying");
    try {
      const res = await api.verifyPayment(ref);
      if (res.success && res.data) {
        setStatus("paid");
        setActiveTab("success");
        setOrderId(res.data.orderId);
        setAmountMinor(res.data.amountMinor || 0);
        if (res.data.orderId) {
          loadOrderDetails(res.data.orderId);
        }
      } else {
        setStatus("failed");
        setActiveTab("failed");
        setErrorMessage(res.error || "Unable to confirm payment status.");
      }
    } catch (err: unknown) {
      setStatus("failed");
      setActiveTab("failed");
      setErrorMessage(err instanceof Error ? err.message : "Verification connection failed.");
    }
  };

  const loadOrderDetails = async (id: string) => {
    try {
      const res = await api.getOrderDetails(id);
      if (res.success && res.data) {
        setOrder(res.data);
        if (res.data.total_minor) {
          setAmountMinor(res.data.total_minor);
        }
      }
    } catch {
      // Ignore
    }
  };

  const handleCopyRef = () => {
    setCopied(true);
    Alert.alert("Reference Copied", `Payment Reference: ${reference || order?.payment_reference || "N/A"}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const orderNum = orderId
    ? `SLG-${orderId.substring(0, 5).toUpperCase()}`
    : reference
    ? `SLG-${reference.substring(Math.max(0, reference.length - 6)).toUpperCase()}`
    : "SLG-94821";

  const firstItem = order?.order_items?.[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.navigate("Main", { screen: "Home" })}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Verification</Text>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.navigate("Main", { screen: "Account" })}
          activeOpacity={0.7}
        >
          <View style={styles.profileDot} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Interactive State Switcher Tabs (Stitch Screen 6) */}
        <View style={styles.stateTabs}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "success" && styles.tabBtnActive]}
            onPress={() => setActiveTab("success")}
            activeOpacity={0.8}
          >
            <CheckCircle2
              size={16}
              color={activeTab === "success" ? colors.brand : colors.textMuted}
            />
            <Text style={[styles.tabText, activeTab === "success" && styles.tabTextActive]}>
              Success
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "pending" && styles.tabBtnActive]}
            onPress={() => setActiveTab("pending")}
            activeOpacity={0.8}
          >
            <Clock
              size={16}
              color={activeTab === "pending" ? colors.warning : colors.textMuted}
            />
            <Text style={[styles.tabText, activeTab === "pending" && styles.tabTextActive]}>
              Processing
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "failed" && styles.tabBtnActive]}
            onPress={() => setActiveTab("failed")}
            activeOpacity={0.8}
          >
            <XCircle
              size={16}
              color={activeTab === "failed" ? colors.danger : colors.textMuted}
            />
            <Text style={[styles.tabText, activeTab === "failed" && styles.tabTextActive]}>
              Failed
            </Text>
          </TouchableOpacity>
        </View>

        {/* STATE 1: SUCCESS VIEW (DEFAULT) */}
        {activeTab === "success" && (
          <View style={styles.tabContent}>
            {/* Hero Status Beacon */}
            <View style={styles.heroBeacon}>
              <View style={styles.beaconGlow}>
                <View style={styles.beaconCircle}>
                  <CheckCircle2 size={36} color={colors.onPrimary} />
                </View>
              </View>
              <Text style={styles.beaconTag}>TRANSACTION APPROVED</Text>
              <Text style={styles.beaconTitle}>Payment Verified & Confirmed!</Text>
              <Text style={styles.beaconDesc}>
                Your order <Text style={styles.beaconOrderBold}>#{orderNum}</Text> has been received
                and routed to our Lagos Fulfillment Hub.
              </Text>
            </View>

            {/* Verified Items Peek Card */}
            <View style={styles.verifiedPeekCard}>
              <View style={styles.peekImageWrapper}>
                {firstItem?.image_url ? (
                  <Image source={{ uri: firstItem.image_url }} style={styles.peekImage} />
                ) : (
                  <Package size={26} color={colors.brand} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.peekTitleRow}>
                  <Text style={styles.peekTitle} numberOfLines={1}>
                    {firstItem?.product_name || "Slurge Premium Electronics Order"}
                  </Text>
                  <View style={styles.qtyPill}>
                    <Text style={styles.qtyPillText}>
                      Qty: {order?.order_items?.reduce((s, i) => s + i.quantity, 0) || 1}
                    </Text>
                  </View>
                </View>
                <Text style={styles.peekSub} numberOfLines={1}>
                  {firstItem?.variant_sku || "Lagos Secured Hub • Express Care Plus"}
                </Text>
                <Text style={styles.peekPrice}>
                  {formatNaira(amountMinor || order?.total_minor || 0)}
                </Text>
              </View>
            </View>

            {/* Order & Payment Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.channelRow}>
                <View style={styles.channelBadge}>
                  <CreditCard size={18} color={colors.brand} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.channelLabel}>Payment Channel</Text>
                  <Text style={styles.channelName}>Paystack Mastercard / Tokenized</Text>
                </View>
                <Text style={styles.cardMask}>•••• 8821</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.amountPaidRow}>
                <Text style={styles.amountPaidLabel}>Amount Paid</Text>
                <Text style={styles.amountPaidVal}>
                  {formatNaira(amountMinor || order?.total_minor || 0)}
                </Text>
              </View>

              <View style={styles.refRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailLabel}>Payment Reference</Text>
                  <Text style={styles.refCode}>
                    {reference || order?.payment_reference || "PSTK_TXN_VERIFIED"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={handleCopyRef}
                  activeOpacity={0.7}
                >
                  <Copy size={14} color={colors.brand} />
                  <Text style={styles.copyBtnText}>{copied ? "Copied!" : "Copy Ref"}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.addressRow}>
                <MapPin size={18} color={colors.brand} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailLabel}>Delivery Address</Text>
                  <Text style={styles.addressText}>
                    {order?.shipping_address1 || order?.shipping_address_line1 || "14 Admiralty Way, Lekki Phase 1, Lagos"}
                    {", "}
                    {order?.shipping_city || "Lagos"}
                  </Text>
                </View>
              </View>

              {/* Lagos Same-Day Dispatch Banner */}
              <View style={styles.dispatchBanner}>
                <Zap size={18} color={colors.brand} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.dispatchTitle}>LAGOS SAME-DAY DISPATCH</Text>
                  <Text style={styles.dispatchETA}>
                    Estimated Delivery: <Text style={{ fontWeight: "700" }}>Today, by 4:30 PM</Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* Fulfillment Hub Visual Snapshot */}
            <View style={styles.hubCard}>
              <View style={{ flex: 1 }}>
                <View style={styles.hubActiveRow}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.hubActiveText}>Hub Packaging Active</Text>
                </View>
                <Text style={styles.hubName}>Slurge Central Depot, Ikeja</Text>
                <Text style={styles.hubDesc}>
                  Express security seal applied. Courier allocation departure underway.
                </Text>
              </View>
              <View style={styles.hubIconBox}>
                <Building2 size={28} color={colors.brand} />
              </View>
            </View>

            {/* Call to Actions (Stitch Screen 6) */}
            <View style={styles.actionsList}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => {
                  if (orderId) {
                    navigation.replace("OrderTracking", { orderId });
                  } else {
                    navigation.navigate("Main", { screen: "Account" });
                  }
                }}
                activeOpacity={0.85}
              >
                <Zap size={18} color={colors.onPrimary} />
                <Text style={styles.primaryBtnText}>Track Live Order & Rider</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => navigation.navigate("Main", { screen: "Account" })}
                activeOpacity={0.85}
              >
                <Package size={18} color={colors.textPrimary} />
                <Text style={styles.secondaryBtnText}>View My Orders & History</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.textLinkBtn}
                onPress={() => navigation.navigate("Main", { screen: "Home" })}
                activeOpacity={0.7}
              >
                <Text style={styles.textLink}>Continue Shopping Slurge Catalog</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STATE 2: PROCESSING / PENDING VIEW */}
        {activeTab === "pending" && (
          <View style={styles.tabContent}>
            <View style={styles.heroBeacon}>
              <View style={[styles.beaconGlow, { backgroundColor: "rgba(234, 179, 8, 0.15)" }]}>
                <View style={[styles.beaconCircle, { backgroundColor: colors.warning }]}>
                  <Clock size={36} color={colors.onPrimary} />
                </View>
              </View>
              <Text style={[styles.beaconTag, { color: colors.warning }]}>
                AWAITING SETTLEMENT CONFIRMATION
              </Text>
              <Text style={styles.beaconTitle}>Verifying Your Transfer...</Text>
              <Text style={styles.beaconDesc}>
                Paystack is validating the settlement with your bank. This typically resolves within
                60–90 seconds.
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={[styles.pulseDot, { backgroundColor: colors.warning }]} />
                  <Text style={{ fontWeight: "700", color: colors.textPrimary, fontSize: 13 }}>
                    Interswitch / NIBSS Gateway Ping
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: "monospace" }}>
                  Attempt 2 of 4
                </Text>
              </View>

              <View style={styles.progressBarBg}>
                <View style={styles.progressBarFill} />
              </View>

              <View style={styles.amountPaidRow}>
                <Text style={styles.amountPaidLabel}>Order Total Held:</Text>
                <Text style={styles.amountPaidVal}>
                  {formatNaira(amountMinor || order?.total_minor || 0)}
                </Text>
              </View>

              <View style={styles.advisoryBox}>
                <ShieldCheck size={16} color={colors.brand} />
                <Text style={styles.advisoryText}>
                  Please do not close this window while Slurge verifies your funds with Paystack.
                </Text>
              </View>
            </View>

            <View style={styles.actionsList}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => {
                  if (reference) verifyTransaction(reference);
                }}
                activeOpacity={0.85}
              >
                <RefreshCw size={18} color={colors.onPrimary} />
                <Text style={styles.primaryBtnText}>Check Live Status Now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => setActiveTab("success")}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryBtnText}>Simulate Confirmed Receipt</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STATE 3: FAILED / DECLINED VIEW */}
        {activeTab === "failed" && (
          <View style={styles.tabContent}>
            <View style={styles.heroBeacon}>
              <View style={[styles.beaconGlow, { backgroundColor: "rgba(239, 68, 68, 0.15)" }]}>
                <View style={[styles.beaconCircle, { backgroundColor: colors.danger }]}>
                  <XCircle size={36} color={colors.onPrimary} />
                </View>
              </View>
              <Text style={[styles.beaconTag, { color: colors.danger }]}>TRANSACTION DECLINED</Text>
              <Text style={styles.beaconTitle}>Payment Could Not Complete</Text>
              <Text style={styles.beaconDesc}>
                {errorMessage ||
                  "Your issuing bank returned code: 51 - Insufficient Limit / Timeout. Your cart remains safely reserved."}
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={{ fontWeight: "700", color: colors.danger, fontSize: 13, marginBottom: 8 }}>
                Recommended Resolutions
              </Text>
              <View style={styles.resolutionItem}>
                <Zap size={16} color={colors.brand} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.resolutionTitle}>Switch to Direct Bank Transfer</Text>
                  <Text style={styles.resolutionDesc}>
                    Instant virtual account allocation with zero card authorization friction.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.actionsList}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => navigation.navigate("Checkout")}
                activeOpacity={0.85}
              >
                <RefreshCw size={18} color={colors.onPrimary} />
                <Text style={styles.primaryBtnText}>Retry with Paystack</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => navigation.navigate("Main", { screen: "Cart" })}
                activeOpacity={0.85}
              >
                <ShoppingBag size={18} color={colors.textPrimary} />
                <Text style={styles.secondaryBtnText}>Return to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
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
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  profileDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brand,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  stateTabs: {
    flexDirection: "row",
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  tabBtnActive: {
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  tabContent: {
    gap: spacing.lg,
  },
  heroBeacon: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  beaconGlow: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  beaconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  beaconTag: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: colors.success,
    marginBottom: 4,
  },
  beaconTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 6,
  },
  beaconDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 320,
  },
  beaconOrderBold: {
    fontWeight: "700",
    color: colors.textPrimary,
  },
  verifiedPeekCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  peekImageWrapper: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  peekImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  peekTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  peekTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    flex: 1,
  },
  qtyPill: {
    backgroundColor: colors.brandLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  qtyPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.brand,
  },
  peekSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  peekPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.brand,
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.base,
    gap: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  channelBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brandLight,
    alignItems: "center",
    justifyContent: "center",
  },
  channelLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  channelName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  cardMask: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  amountPaidRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  amountPaidLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  amountPaidVal: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  refRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  refCode: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "monospace",
    color: colors.textPrimary,
    marginTop: 2,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.brandLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.brand,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  addressText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: 2,
    lineHeight: 18,
  },
  dispatchBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.brandLight,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  dispatchTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.brand,
    letterSpacing: 0.8,
  },
  dispatchETA: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 2,
  },
  hubCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.base,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  hubActiveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  hubActiveText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.success,
  },
  hubName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  hubDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
    maxWidth: 240,
  },
  hubIconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brandLight,
    alignItems: "center",
    justifyContent: "center",
  },
  actionsList: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: colors.brand,
    height: 50,
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.onPrimary,
  },
  secondaryBtn: {
    backgroundColor: colors.surface,
    height: 48,
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  textLinkBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  textLink: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    width: "65%",
    height: "100%",
    backgroundColor: colors.warning,
  },
  advisoryBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  advisoryText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  resolutionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  resolutionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  resolutionDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
});
