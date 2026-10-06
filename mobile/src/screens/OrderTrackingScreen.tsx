import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@/theme/tokens";
import { api, Order } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { formatNaira } from "@/components/PriceText";
import { LoadingView } from "@/components/LoadingView";
import { ErrorView } from "@/components/ErrorView";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  MapPin,
  ShieldCheck,
  PhoneCall,
  UserCheck,
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
        <LoadingView message="Loading order milestones..." />
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

  // Determine active milestone step index
  const statusLevels: Record<string, number> = {
    pending: 1,
    payment_init: 1,
    paid: 2,
    processing: 3,
    shipped: 4,
    delivered: 5,
  };
  const currentLevel = statusLevels[order.status] || 2;

  const milestones = [
    { title: "Order Placed", desc: "Order registered and inventory reserved", level: 1 },
    { title: "Payment Verified", desc: "Paystack authorization cleared server-side", level: 2 },
    { title: "Processing & Quality Check", desc: "Picked & verified at Slurge Lagos fulfillment center", level: 3 },
    { title: "Dispatched with Courier", desc: "Handed over for nationwide delivery", level: 4 },
    { title: "Delivered", desc: "Package signed for and delivered", level: 5 },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Live Order Tracking</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusCardTop}>
            <View>
              <Text style={styles.orderNumberLabel}>Order ID</Text>
              <Text style={styles.orderNumber}>#{order.id.substring(0, 8).toUpperCase()}</Text>
            </View>
            <StatusBadge status={order.status} />
          </View>
          <View style={styles.statusCardBottom}>
            <Text style={styles.estDeliveryText}>
              Estimated Delivery: <Text style={{ fontWeight: "700", color: colors.textPrimary }}>Within 24–48 Hours</Text>
            </Text>
          </View>
        </View>

        {/* Vertical Timeline Milestones (Stitch Screen 7) */}
        <View style={styles.milestoneCard}>
          <Text style={styles.sectionTitle}>Fulfillment Progress</Text>

          <View style={styles.timelineList}>
            {milestones.map((m, idx) => {
              const isCompleted = currentLevel >= m.level;
              const isCurrent = currentLevel === m.level;
              const isLast = idx === milestones.length - 1;

              return (
                <View key={idx} style={styles.timelineRow}>
                  {/* Left Indicator column */}
                  <View style={styles.indicatorCol}>
                    <View
                      style={[
                        styles.dotCircle,
                        isCompleted && styles.dotCircleCompleted,
                        isCurrent && styles.dotCircleCurrent,
                      ]}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={14} color={colors.onPrimary} />
                      ) : (
                        <View style={styles.dotPending} />
                      )}
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.timelineLine,
                          currentLevel > m.level && styles.timelineLineCompleted,
                        ]}
                      />
                    )}
                  </View>

                  {/* Right Content */}
                  <View style={styles.timelineContent}>
                    <Text
                      style={[
                        styles.milestoneTitle,
                        isCurrent && { color: colors.brand, fontWeight: "700" },
                      ]}
                    >
                      {m.title}
                    </Text>
                    <Text style={styles.milestoneDesc}>{m.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Courier & Dispatch Information */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Truck size={18} color={colors.brand} />
            <Text style={styles.sectionTitle}>Logistics Courier</Text>
          </View>
          <View style={styles.courierInfoBox}>
            <View style={styles.courierRow}>
              <Text style={styles.courierLabel}>Carrier</Text>
              <Text style={styles.courierVal}>GIG Logistics Express NG</Text>
            </View>
            <View style={styles.courierRow}>
              <Text style={styles.courierLabel}>Service</Text>
              <Text style={styles.courierVal}>Fragile Electronics Priority</Text>
            </View>
            {order.payment_reference && (
              <View style={styles.courierRow}>
                <Text style={styles.courierLabel}>Tracking Ref</Text>
                <Text style={styles.courierVal}>{order.payment_reference}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Delivery Address Destination */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <MapPin size={18} color={colors.brand} />
            <Text style={styles.sectionTitle}>Destination Address</Text>
          </View>
          <Text style={styles.destName}>{order.shipping_name || order.shipping_full_name}</Text>
          <Text style={styles.destAddress}>
            {order.shipping_address1 || order.shipping_address_line1}
          </Text>
          <Text style={styles.destCity}>
            {order.shipping_city}, {order.shipping_state}
          </Text>
          <Text style={styles.destPhone}>{order.shipping_phone}</Text>
        </View>

        {/* Ordered Line Items Snapshot */}
        {order.order_items && order.order_items.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <Package size={18} color={colors.brand} />
              <Text style={styles.sectionTitle}>Ordered Devices ({order.order_items.length})</Text>
            </View>
            <View style={styles.lineItemsList}>
              {order.order_items.map((item, idx) => (
                <View key={idx} style={styles.lineItem}>
                  {item.image_url && (
                    <Image source={{ uri: item.image_url }} style={styles.lineItemImg} resizeMode="contain" />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.lineItemName}>{item.product_name}</Text>
                    <Text style={styles.lineItemQty}>
                      Qty: {item.quantity} • {formatNaira(item.unit_price_minor)}
                    </Text>
                  </View>
                  <Text style={styles.lineItemTotal}>
                    {formatNaira(item.line_total_minor || item.unit_price_minor * item.quantity)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalVal}>{formatNaira(order.total_minor)}</Text>
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
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    paddingBottom: spacing.huge,
    gap: spacing.md,
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  orderNumberLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  statusCardBottom: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  estDeliveryText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  milestoneCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  timelineList: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  indicatorCol: {
    alignItems: "center",
    width: 24,
    marginRight: 12,
  },
  dotCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  dotCircleCompleted: {
    backgroundColor: colors.success,
  },
  dotCircleCurrent: {
    backgroundColor: colors.brand,
  },
  dotPending: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.outlineVariant,
  },
  timelineLine: {
    width: 2,
    height: 38,
    backgroundColor: colors.border,
  },
  timelineLineCompleted: {
    backgroundColor: colors.success,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
  },
  milestoneTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  milestoneDesc: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: spacing.sm,
  },
  courierInfoBox: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 6,
  },
  courierRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  courierLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  courierVal: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  destName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  destAddress: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  destCity: {
    fontSize: 12,
    color: colors.textMuted,
  },
  destPhone: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  lineItemsList: {
    gap: 10,
    marginBottom: spacing.md,
  },
  lineItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  lineItemImg: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceContainerLow,
  },
  lineItemName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  lineItemQty: {
    fontSize: 11,
    color: colors.textMuted,
  },
  lineItemTotal: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  totalVal: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.brand,
  },
});
