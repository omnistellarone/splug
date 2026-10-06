import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@/theme/tokens";
import { useAuth } from "@/context/AuthContext";
import { api, Order } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { formatNaira } from "@/components/PriceText";
import {
  User,
  Package,
  LogOut,
  Settings,
  ChevronRight,
  ShieldCheck,
  Server,
  RefreshCw,
  LogIn,
} from "lucide-react-native";

export const AccountScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await api.getOrders();
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out of Slurge?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          navigation.navigate("Auth");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <User size={32} color={colors.brand} />
          </View>
          {user ? (
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>
                {user.user_metadata?.full_name || user.email?.split("@")[0] || "Customer"}
              </Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={12} color={colors.success} />
                <Text style={styles.verifiedText}>Verified Account</Text>
              </View>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>Guest Shopper</Text>
              <Text style={styles.userEmail}>Sign in to sync your cart & track orders</Text>
              <TouchableOpacity
                style={styles.signInBtn}
                onPress={() => navigation.navigate("Auth")}
                activeOpacity={0.8}
              >
                <LogIn size={14} color={colors.onPrimary} />
                <Text style={styles.signInBtnText}>Sign In / Register</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Order History Section (Stitch Screen 8) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleRow}>
              <Package size={18} color={colors.brand} />
              <Text style={styles.sectionTitle}>Order History</Text>
            </View>
            {user && (
              <TouchableOpacity onPress={loadOrders} style={{ padding: 4 }}>
                <RefreshCw size={14} color={colors.brand} />
              </TouchableOpacity>
            )}
          </View>

          {!user ? (
            <View style={styles.loginPromptCard}>
              <Text style={styles.promptTitle}>View Your Past Orders</Text>
              <Text style={styles.promptSub}>
                Sign in to view your complete order history and real-time shipment updates.
              </Text>
              <TouchableOpacity
                style={styles.promptBtn}
                onPress={() => navigation.navigate("Auth")}
              >
                <Text style={styles.promptBtnText}>Sign In Now</Text>
              </TouchableOpacity>
            </View>
          ) : isLoadingOrders ? (
            <ActivityIndicator size="small" color={colors.brand} style={{ padding: 20 }} />
          ) : orders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No Orders Yet</Text>
              <Text style={styles.emptySub}>
                When you make an order, it will appear here with live fulfillment tracking.
              </Text>
            </View>
          ) : (
            <View style={styles.ordersList}>
              {orders.map((order) => {
                const dateStr = new Date(order.created_at).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                const itemCount =
                  order.order_items?.reduce((sum, i) => sum + i.quantity, 0) || 1;

                return (
                  <TouchableOpacity
                    key={order.id}
                    style={styles.orderCard}
                    onPress={() => navigation.navigate("OrderTracking", { orderId: order.id })}
                    activeOpacity={0.8}
                  >
                    <View style={styles.orderTopRow}>
                      <View>
                        <Text style={styles.orderId}>
                          #{order.id.substring(0, 8).toUpperCase()}
                        </Text>
                        <Text style={styles.orderDate}>{dateStr}</Text>
                      </View>
                      <StatusBadge status={order.status} />
                    </View>

                    <View style={styles.orderBottomRow}>
                      <Text style={styles.orderCount}>{itemCount} Item(s)</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Text style={styles.orderAmount}>{formatNaira(order.total_minor)}</Text>
                        <ChevronRight size={16} color={colors.textMuted} />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>



        {/* Sign Out Button */}
        {user && (
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
            <LogOut size={18} color={colors.danger} />
            <Text style={styles.signOutText}>Sign Out of Slurge</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.versionText}>Slurge Electronics Mobile • v1.0.0 (Release Build)</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.huge,
    gap: spacing.base,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.brandLight,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.success,
  },
  signInBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.brand,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  signInBtnText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  loginPromptCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    gap: 8,
  },
  promptTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  promptSub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  promptBtn: {
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: radius.md,
    marginTop: 4,
  },
  promptBtnText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    gap: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  ordersList: {
    gap: spacing.md,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  orderTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderId: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  orderDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  orderBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  orderCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.brand,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  configDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  urlInputRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  urlInput: {
    flex: 1,
    height: 42,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    fontSize: 13,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveUrlBtn: {
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  saveUrlBtnText: {
    color: colors.onPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.dangerLight,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  signOutText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "700",
  },
  versionText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.md,
  },
});
