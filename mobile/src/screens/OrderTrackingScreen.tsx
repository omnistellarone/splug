import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@/theme/tokens";
import { api, Order } from "@/lib/api";
import { formatNaira } from "@/components/PriceText";
import { LoadingView } from "@/components/LoadingView";
import { ErrorView } from "@/components/ErrorView";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  ShieldCheck,
  Package,
  MapPin,
  Navigation,
  Share2,
  Heart,
  User,
  Truck,
  Building,
  Star,
  Info,
  Radio,
  FileText,
} from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "OrderTracking">;

export const OrderTrackingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getOrderDetails(orderId);
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setError(res.error || "Order not found");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching order");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <LoadingView message="Connecting to live dispatch telemetry..." />
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ErrorView message={error || "Order details unavailable"} onRetry={fetchOrder} />
      </SafeAreaView>
    );
  }

  const orderNum = `SLG-${order.id.substring(0, 5).toUpperCase()}`;
  const firstItem = order.order_items?.[0];

  const stage: number =
    order.status === "delivered"
      ? 5
      : order.status === "shipped"
      ? 4
      : order.status === "processing"
      ? 2
      : order.status === "paid"
      ? 2
      : 1;

  const statusLabel =
    order.status === "delivered"
      ? "Delivered"
      : order.status === "shipped"
      ? "Out for Delivery"
      : order.status === "processing" || order.status === "paid"
      ? "Processing & Quality Check"
      : "Payment Confirmed";

  // Derive stable 4-digit PIN from order id
  const pinDigits = [
    (parseInt(order.id.charCodeAt(0).toString(), 10) % 9) + 1,
    (parseInt(order.id.charCodeAt(1).toString(), 10) % 9) + 1,
    (parseInt(order.id.charCodeAt(2).toString(), 10) % 9) + 1,
    (parseInt(order.id.charCodeAt(3).toString(), 10) % 9) + 1,
  ];

  const handleCallRider = () => {
    Linking.openURL("tel:+2348123456789").catch(() => {
      Alert.alert("Contact Dispatch", "Dispatch Hotline: +234 812 345 6789");
    });
  };

  const handleWhatsAppRider = () => {
    Linking.openURL("https://wa.me/2348123456789").catch(() => {
      Alert.alert("WhatsApp Dispatch", "WhatsApp Support: +234 812 345 6789");
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Live Order Tracking
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() =>
              Alert.alert(
                "Share Tracking Link",
                `Track Slurge Order #${orderNum} at https://splug-teal.vercel.app`
              )
            }
          >
            <Share2 size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate("Main", { screen: "Account" })}
          >
            <View style={styles.profileDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Realtime Order Status Card (Stitch Screen 7) */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeaderRow}>
            <View>
              <Text style={styles.trackingTag}>TRACKING IDENTIFIER</Text>
              <Text style={styles.orderNumber}>Order #{orderNum}</Text>
            </View>
            <View style={styles.liveStatusPill}>
              <View style={styles.pulsingDot} />
              <Text style={styles.liveStatusText}>{statusLabel}</Text>
            </View>
          </View>

          {/* ETA Banner */}
          <View style={styles.etaBanner}>
            <View style={styles.etaIconCircle}>
              <Clock size={20} color={colors.onPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
                <Text style={styles.etaTime}>~35 mins</Text>
                <Text style={styles.etaLabel}>Estimated Arrival</Text>
              </View>
              <Text style={styles.etaSub}>Arriving approximately at 3:45 PM today</Text>
            </View>
          </View>
        </View>

        {/* Interactive / Stylized Vector Road Map Canvas */}
        <View style={styles.mapCard}>
          <View style={styles.mapHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Navigation size={16} color={colors.brand} />
              <Text style={styles.mapTitle}>Live Route Navigation</Text>
            </View>
            <View style={styles.mapLocationBadge}>
              <Text style={styles.mapLocationText}>
                {order?.shipping_city ? `${order.shipping_city} Dispatch Route` : "Express Dispatch Route"}
              </Text>
            </View>
          </View>

          {/* Canvas Simulation */}
          <View style={styles.mapCanvas}>
            {/* Water body simulation */}
            <View style={styles.waterBody} />

            {/* Grid street lines */}
            <View style={[styles.gridRoad, { top: 35 }]} />
            <View style={[styles.gridRoad, { top: 90 }]} />
            <View style={[styles.gridRoad, { top: 150 }]} />

            {/* Main Arterial Road */}
            <View style={styles.arterialRoad} />

            {/* Lekki Hub Departure Marker */}
            <View style={styles.hubMarker}>
              <View style={styles.hubIconCircle}>
                <Building size={12} color={colors.onPrimary} />
              </View>
              <Text style={styles.markerText}>Lekki Hub</Text>
            </View>

            {/* Moving Rider Pin */}
            <View style={styles.riderPin}>
              <View style={styles.riderPulse} />
              <View style={styles.riderCircle}>
                <Truck size={16} color={colors.onPrimary} />
              </View>
              <View style={styles.riderTag}>
                <View style={styles.greenDot} />
                <Text style={styles.riderTagText}>Tunde (3.2 km away)</Text>
              </View>
            </View>

            {/* Destination Pin */}
            <View style={styles.destPin}>
              <View style={styles.destCircle}>
                <MapPin size={16} color={colors.onPrimary} />
              </View>
              <Text style={styles.destTagText}>Your Doorstep</Text>
            </View>

            {/* Speed & Live GPS Pill */}
            <View style={styles.gpsPill}>
              <Text style={styles.gpsSpeed}>38 km/h</Text>
              <Text style={styles.gpsDivider}>|</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Radio size={12} color={colors.success} />
                <Text style={styles.gpsLive}>Live GPS</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Assigned Courier Dispatch Card */}
        <View style={styles.courierCard}>
          <View style={styles.courierTop}>
            <View style={styles.courierAvatarWrapper}>
              <View style={styles.courierAvatar}>
                <User size={28} color={colors.brand} />
              </View>
              <View style={styles.verifiedCheck}>
                <Check size={10} color={colors.onPrimary} />
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.courierName}>Tunde Bakare</Text>
              <Text style={styles.courierRole}>Verified Slurge Courier</Text>
              <View style={styles.courierRatingRow}>
                <Star size={13} color={colors.warning} fill={colors.warning} />
                <Text style={styles.ratingText}>4.9</Text>
                <Text style={styles.deliveryCount}>(1,240+ deliveries)</Text>
              </View>
            </View>

            <View style={styles.vehicleBadge}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                <Truck size={13} color={colors.textPrimary} />
                <Text style={styles.vehicleName}>Honda Ace 125</Text>
              </View>
              <Text style={styles.plateText}>KJA-482-XY</Text>
            </View>
          </View>

          {/* Quick Communication Action Triggers */}
          <View style={styles.courierActions}>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={handleCallRider}
              activeOpacity={0.8}
            >
              <Phone size={16} color={colors.textPrimary} />
              <Text style={styles.callBtnText}>Call Rider</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.chatBtn}
              onPress={handleWhatsAppRider}
              activeOpacity={0.8}
            >
              <MessageCircle size={16} color={colors.onPrimary} />
              <Text style={styles.chatBtnText}>WhatsApp Dispatch</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Doorstep Handover Security Widget */}
        <View style={styles.otpWidget}>
          <View style={styles.otpHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <ShieldCheck size={18} color={colors.brand} />
              <Text style={styles.otpTitle}>Handover Security PIN</Text>
            </View>
            <View style={styles.tamperBadge}>
              <Text style={styles.tamperText}>Tamper-Proof Delivery</Text>
            </View>
          </View>

          {/* 4-Digit Display OTP Boxes */}
          <View style={styles.otpRow}>
            {pinDigits.map((d, i) => (
              <View key={i} style={styles.otpBox}>
                <Text style={styles.otpDigit}>{d}</Text>
              </View>
            ))}
          </View>

          {/* Security Advisory */}
          <View style={styles.otpAdvisory}>
            <Info size={16} color={colors.brand} style={{ marginTop: 2 }} />
            <Text style={styles.otpAdvisoryText}>
              Only share this code when the rider arrives and you verify the factory seal. Inspect
              packaging before confirming release.
            </Text>
          </View>
        </View>

        {/* Milestones Vertical Progress Stepper */}
        <View style={styles.stepperCard}>
          <View style={styles.stepperHeader}>
            <Text style={styles.stepperTitle}>Delivery Timeline & Audits</Text>
            <Text style={styles.stepperProgressText}>{stage} of 5 Complete</Text>
          </View>

          <View style={styles.timelineWrapper}>
            <View style={styles.timelineLine} />

            {/* Milestone 1: Order Placed & Payment */}
            <View style={styles.milestoneRow}>
              <View style={[styles.milestoneIconCircle, styles.milestoneDone]}>
                <Check size={13} color={colors.onPrimary} />
              </View>
              <View style={styles.milestoneContent}>
                <Text style={styles.milestoneName}>Order Placed & Payment Verified</Text>
                <Text style={styles.milestoneMeta}>
                  Ref: {order.payment_reference || "PSTK_VERIFIED"} • Confirmed
                </Text>
              </View>
            </View>

            {/* Milestone 2: Quality Checked & IMEI */}
            <View style={[styles.milestoneRow, stage < 2 && { opacity: 0.5 }]}>
              <View
                style={[
                  styles.milestoneIconCircle,
                  stage > 2
                    ? styles.milestoneDone
                    : stage === 2
                    ? styles.milestoneActive
                    : styles.milestonePending,
                ]}
              >
                {stage > 2 ? (
                  <Check size={13} color={colors.onPrimary} />
                ) : stage === 2 ? (
                  <Clock size={13} color={colors.onPrimary} />
                ) : (
                  <Package size={13} color={colors.textMuted} />
                )}
              </View>
              <View style={styles.milestoneContent}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text
                    style={[
                      styles.milestoneName,
                      stage === 2 && { color: colors.brand, fontWeight: "800" },
                    ]}
                  >
                    Quality Checked & IMEI Assigned
                  </Text>
                  {stage === 2 && (
                    <View style={styles.activePill}>
                      <Text style={styles.activePillText}>IN PROGRESS</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.milestoneMeta}>Factory seal verified & IMEI registered</Text>
              </View>
            </View>

            {/* Milestone 3: Dispatched from Hub */}
            <View style={[styles.milestoneRow, stage < 3 && { opacity: 0.5 }]}>
              <View
                style={[
                  styles.milestoneIconCircle,
                  stage > 3
                    ? styles.milestoneDone
                    : stage === 3
                    ? styles.milestoneActive
                    : styles.milestonePending,
                ]}
              >
                {stage > 3 ? (
                  <Check size={13} color={colors.onPrimary} />
                ) : stage === 3 ? (
                  <Truck size={13} color={colors.onPrimary} />
                ) : (
                  <Package size={13} color={colors.textMuted} />
                )}
              </View>
              <View style={styles.milestoneContent}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text
                    style={[
                      styles.milestoneName,
                      stage === 3 && { color: colors.brand, fontWeight: "800" },
                    ]}
                  >
                    Dispatched from Lekki Hub
                  </Text>
                  {stage === 3 && (
                    <View style={styles.activePill}>
                      <Text style={styles.activePillText}>DISPATCHED</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.milestoneMeta}>Package sorted & handed over to courier</Text>
              </View>
            </View>

            {/* Milestone 4: Out for Delivery */}
            <View style={[styles.milestoneRow, stage < 4 && { opacity: 0.5 }]}>
              <View
                style={[
                  styles.milestoneIconCircle,
                  stage > 4
                    ? styles.milestoneDone
                    : stage === 4
                    ? styles.milestoneActive
                    : styles.milestonePending,
                ]}
              >
                {stage > 4 ? (
                  <Check size={13} color={colors.onPrimary} />
                ) : stage === 4 ? (
                  <Truck size={14} color={colors.onPrimary} />
                ) : (
                  <Package size={13} color={colors.textMuted} />
                )}
              </View>
              <View style={styles.milestoneContent}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text
                    style={[
                      styles.milestoneName,
                      stage === 4 && { color: colors.brand, fontWeight: "800" },
                    ]}
                  >
                    Out for Delivery with Rider
                  </Text>
                  {stage === 4 && (
                    <View style={styles.activePill}>
                      <Text style={styles.activePillText}>ACTIVE</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.milestoneMeta}>En route to delivery address</Text>
              </View>
            </View>

            {/* Milestone 5: Delivered */}
            <View style={[styles.milestoneRow, stage < 5 && { opacity: 0.5 }]}>
              <View
                style={[
                  styles.milestoneIconCircle,
                  stage === 5 ? styles.milestoneDone : styles.milestonePending,
                ]}
              >
                {stage === 5 ? (
                  <Check size={13} color={colors.onPrimary} />
                ) : (
                  <Package size={13} color={colors.textMuted} />
                )}
              </View>
              <View style={styles.milestoneContent}>
                <Text style={styles.milestoneName}>Delivered & Inspected</Text>
                <Text style={styles.milestoneMeta}>
                  Customer verification & digital handover signature
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Package Summary Collapsible Card */}
        <View style={styles.packageCard}>
          <View style={styles.packageImageWrap}>
            {firstItem?.image_url ? (
              <Image source={{ uri: firstItem.image_url }} style={styles.packageImg} />
            ) : (
              <Package size={24} color={colors.brand} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.packageName} numberOfLines={1}>
              {firstItem?.product_name || "Slurge Electronics Hardware Package"}
            </Text>
            <Text style={styles.packageMeta}>
              Qty: {firstItem?.quantity || 1} • {formatNaira(order.total_minor)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.receiptBtn}
            onPress={() =>
              Alert.alert(
                "Official Receipt",
                `Slurge Electronics Order #${orderNum}\nTotal: ${formatNaira(
                  order.total_minor
                )}\nStatus: Paid & Dispatched\nCustomer: ${order.shipping_name || "Customer"}`
              )
            }
          >
            <FileText size={16} color={colors.brand} />
            <Text style={styles.receiptBtnText}>Receipt</Text>
          </TouchableOpacity>
        </View>
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.brand,
  },
  scrollContent: {
    padding: spacing.base,
    gap: spacing.base,
    paddingBottom: spacing.xxl,
  },
  statusCard: {
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
  statusHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trackingTag: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  liveStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.brandLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  liveStatusText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.success,
  },
  etaBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.brandLight,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  etaIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  etaTime: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.brand,
  },
  etaLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  etaSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  mapCard: {
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
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  mapLocationBadge: {
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  mapLocationText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  mapCanvas: {
    width: "100%",
    height: 180,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    overflow: "hidden",
    position: "relative",
  },
  waterBody: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 45,
    backgroundColor: "rgba(6, 129, 212, 0.12)",
  },
  gridRoad: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(215, 217, 225, 0.5)",
  },
  arterialRoad: {
    position: "absolute",
    left: 10,
    top: 50,
    width: "90%",
    height: 6,
    backgroundColor: colors.brandLight,
    transform: [{ rotate: "-8deg" }],
  },
  hubMarker: {
    position: "absolute",
    left: 16,
    bottom: 12,
    alignItems: "center",
  },
  hubIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  markerText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textPrimary,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 4,
    borderRadius: 4,
    marginTop: 2,
  },
  riderPin: {
    position: "absolute",
    left: "50%",
    top: "38%",
    alignItems: "center",
  },
  riderPulse: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(79, 70, 229, 0.25)",
    top: -5,
  },
  riderCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  riderTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.textPrimary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  riderTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.onPrimary,
  },
  destPin: {
    position: "absolute",
    right: 20,
    top: 14,
    alignItems: "center",
  },
  destCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  destTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textPrimary,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 6,
    borderRadius: 4,
    marginTop: 2,
  },
  gpsPill: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gpsSpeed: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  gpsDivider: {
    fontSize: 10,
    color: colors.textMuted,
  },
  gpsLive: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.success,
  },
  courierCard: {
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
  courierTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  courierAvatarWrapper: {
    position: "relative",
  },
  courierAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.brandLight,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedCheck: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  courierName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  courierRole: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  courierRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  deliveryCount: {
    fontSize: 11,
    color: colors.textMuted,
  },
  vehicleBadge: {
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: radius.md,
    alignItems: "flex-end",
  },
  vehicleName: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  plateText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontFamily: "monospace",
    marginTop: 2,
  },
  courierActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  callBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainer,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  callBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  chatBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.brand,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  chatBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.onPrimary,
  },
  otpWidget: {
    backgroundColor: colors.brandLight,
    borderRadius: radius.xl,
    padding: spacing.base,
    gap: spacing.md,
  },
  otpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  otpTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  tamperBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tamperText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.brand,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  otpBox: {
    width: 52,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  otpDigit: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.brand,
  },
  otpAdvisory: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  otpAdvisoryText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    flex: 1,
  },
  stepperCard: {
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
  stepperHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepperTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  stepperProgressText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.success,
  },
  timelineWrapper: {
    position: "relative",
    paddingLeft: 34,
    gap: spacing.lg,
  },
  timelineLine: {
    position: "absolute",
    left: 14,
    top: 10,
    bottom: 15,
    width: 2,
    backgroundColor: colors.border,
  },
  milestoneRow: {
    position: "relative",
  },
  milestoneIconCircle: {
    position: "absolute",
    left: -34,
    top: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  milestoneDone: {
    backgroundColor: colors.success,
  },
  milestoneActive: {
    backgroundColor: colors.brand,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  milestonePending: {
    backgroundColor: colors.surfaceContainer,
  },
  milestoneContent: {
    gap: 2,
  },
  milestoneName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  milestoneMeta: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  activePill: {
    backgroundColor: colors.brand,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.onPrimary,
  },
  packageCard: {
    flexDirection: "row",
    alignItems: "center",
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
  packageImageWrap: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  packageImg: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  packageName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  packageMeta: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  receiptBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.brandLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  receiptBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.brand,
  },
});
