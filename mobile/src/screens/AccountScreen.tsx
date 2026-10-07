import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Linking,
  Switch,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { colors, radius, spacing } from "@/theme/tokens";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { api, Order } from "@/lib/api";
import { formatNaira } from "@/components/PriceText";
import {
  Zap,
  MapPin,
  Bell,
  ShoppingBag,
  User,
  ShieldCheck,
  Package,
  Heart,
  FileText,
  Clock,
  Truck,
  Phone,
  RotateCcw,
  CreditCard,
  Fingerprint,
  ChevronRight,
  LogOut,
  RefreshCw,
  Award,
  CheckCircle2,
} from "lucide-react-native";

export const AccountScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, signOut, rememberDevice, setRememberDevice } = useAuth();
  const { totals, addToCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState<boolean>(rememberDevice);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (user && isFocused) {
      loadOrders();
    }
  }, [user, isFocused]);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out of Slurge?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          setOrders([]);
          navigation.navigate("Main", { screen: "Home" });
        },
      },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Zap size={18} color={colors.onPrimary} fill={colors.onPrimary} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 2 }}>
              <Text style={styles.brandTitle}>Slurge</Text>
              <Text style={styles.brandReg}>®</Text>
            </View>
          </View>
        </View>

        <View style={styles.guestContainer}>
          <View style={styles.guestIconCircle}>
            <User size={44} color={colors.brand} />
          </View>
          <Text style={styles.guestTitle}>Sign In to Your Account</Text>
          <Text style={styles.guestSub}>
            Sign in or create an account to view your live orders, delivery updates, and saved addresses.
          </Text>

          <TouchableOpacity
            style={styles.guestPrimaryBtn}
            onPress={() => navigation.navigate("Auth")}
            activeOpacity={0.85}
          >
            <Text style={styles.guestPrimaryBtnText}>Sign In / Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestSecondaryBtn}
            onPress={() => navigation.navigate("Main", { screen: "Home" })}
            activeOpacity={0.85}
          >
            <Text style={styles.guestSecondaryBtnText}>Browse Shop</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const activeOrder = orders.find(
    (o) => o.status === "paid" || o.status === "processing" || o.status === "shipped" || o.status === "pending"
  );

  const pastOrders = activeOrder ? orders.filter((o) => o.id !== activeOrder.id) : orders;

  const displayName =
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split("@")[0] : "Customer");

  const displayEmail = user?.email || "";
  const displayPhone = user?.phone || user?.user_metadata?.phone || "";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top Header (Stitch Screen 8) */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Zap size={18} color={colors.onPrimary} fill={colors.onPrimary} />
          </View>
          <View>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 2 }}>
              <Text style={styles.brandTitle}>Slurge</Text>
              <Text style={styles.brandReg}>®</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <MapPin size={11} color={colors.brand} />
              <Text style={styles.locationText}>Lagos, NG</Text>
            </View>
          </View>
        </View>

        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => Alert.alert("Notifications", "You have no unread notifications.")}
          >
            <Bell size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate("Main", { screen: "Cart" })}
          >
            <ShoppingBag size={20} color={colors.textSecondary} />
            {totals.itemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totals.itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.headerAvatar}>
            <User size={16} color={colors.onPrimary} />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.brand]}
            tintColor={colors.brand}
          />
        }
      >
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarBox}>
                <User size={36} color={colors.brand} />
              </View>
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={12} color={colors.onPrimary} />
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{displayName}</Text>
              {orders.length > 0 && (
                <View style={styles.vipBadge}>
                  <Award size={12} color={colors.brand} />
                  <Text style={styles.vipBadgeText}>Verified Customer</Text>
                </View>
              )}
              {displayEmail ? <Text style={styles.userEmail}>{displayEmail}</Text> : null}
              {displayPhone ? <Text style={styles.userPhone}>{displayPhone}</Text> : null}
            </View>
          </View>

          {/* Quick Metrics Bento Bar */}
          <View style={styles.bentoBar}>
            <View style={styles.bentoCol}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={styles.bentoVal}>{orders.length}</Text>
                {activeOrder && <View style={styles.activeDot} />}
              </View>
              <Text style={styles.bentoLabel}>Total Orders</Text>
            </View>

            <View style={styles.bentoDivider} />

            <View style={styles.bentoCol}>
              <Text style={styles.bentoVal}>{activeOrder ? 1 : 0}</Text>
              <Text style={styles.bentoLabel}>Active Orders</Text>
            </View>
          </View>
        </View>

        {/* Active Order Spotlight Card */}
        {activeOrder ? (
          <View style={styles.spotlightSection}>
            <View style={styles.spotlightHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={[styles.activeDot, { width: 8, height: 8 }]} />
                <Text style={styles.spotlightTag}>
                  {activeOrder.status === "shipped"
                    ? "IN-TRANSIT SHIPMENT"
                    : "ACTIVE ORDER"}
                </Text>
              </View>
              <Text style={styles.priorityText}>Priority Express</Text>
            </View>

            <View style={styles.spotlightCard}>
              <View style={styles.spotlightTop}>
                <View style={styles.spotlightImgWrap}>
                  {activeOrder.order_items?.[0]?.image_url ? (
                    <Image
                      source={{ uri: activeOrder.order_items[0].image_url }}
                      style={styles.spotlightImg}
                    />
                  ) : (
                    <Package size={28} color={colors.brand} />
                  )}
                  <View style={styles.imeiTag}>
                    <Text style={styles.imeiTagText}>IMEI OK</Text>
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={styles.spotlightOrderId}>
                      #SLG-{activeOrder.id.substring(0, 5).toUpperCase()}
                    </Text>
                    <View style={styles.statusPill}>
                      <View style={[styles.activeDot, { width: 6, height: 6 }]} />
                      <Text style={styles.statusPillText}>
                        {activeOrder.status === "shipped"
                          ? "Out for Delivery"
                          : activeOrder.status === "paid" || activeOrder.status === "processing"
                          ? "Processing & Inspection"
                          : "Order Confirmed"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.spotlightTitle} numberOfLines={1}>
                    {activeOrder.order_items?.[0]?.product_name || "Slurge Hardware Package"}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                    <Clock size={14} color={colors.brand} />
                    <Text style={styles.etaText}>
                      Total: {formatNaira(activeOrder.total_minor)}
                    </Text>
                    <Text style={styles.etaSub}>• Lagos Dispatch</Text>
                  </View>
                </View>
              </View>

              {/* Micro Delivery Pulse Progress Bar */}
              <View style={styles.pulseProgressBox}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Truck size={12} color={colors.brand} />
                    <Text style={styles.riderText}>
                      {activeOrder.status === "shipped"
                        ? "Courier En Route"
                        : "Lekki Fulfillment Center"}
                    </Text>
                  </View>
                  <Text style={styles.pointText}>
                    {activeOrder.status === "shipped"
                      ? "Dispatched"
                      : "Verified & Packaging"}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: activeOrder.status === "shipped" ? "80%" : "45%",
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.spotlightActions}>
                <TouchableOpacity
                  style={styles.liveTrackBtn}
                  onPress={() => navigation.navigate("OrderTracking", { orderId: activeOrder.id })}
                  activeOpacity={0.85}
                >
                  <MapPin size={16} color={colors.onPrimary} />
                  <Text style={styles.liveTrackText}>Live Track</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.callRiderBtn}
                  onPress={() => Linking.openURL("tel:+2348123456789")}
                  activeOpacity={0.8}
                >
                  <Phone size={18} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : orders.length === 0 && !isLoadingOrders ? (
          <View style={styles.emptyOrdersCard}>
            <View style={styles.emptyIconCircle}>
              <Package size={28} color={colors.brand} />
            </View>
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySubtitle}>
              You have no active orders yet. When you make a purchase, your real-time delivery milestones and IMEI tracking will appear here.
            </Text>
            <TouchableOpacity
              style={styles.startShoppingBtn}
              onPress={() => navigation.navigate("Main", { screen: "Home" })}
              activeOpacity={0.85}
            >
              <Text style={styles.startShoppingBtnText}>Browse Electronics Catalog</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Past Orders Section */}
        {orders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Past Orders</Text>
              <TouchableOpacity onPress={loadOrders}>
                <Text style={styles.sectionLink}>View All ({orders.length})</Text>
              </TouchableOpacity>
            </View>

            {isLoadingOrders ? (
              <ActivityIndicator size="small" color={colors.brand} style={{ padding: 16 }} />
            ) : pastOrders.length > 0 ? (
              pastOrders.map((ord) => {
                const item = ord.order_items?.[0];
                return (
                  <View key={ord.id} style={styles.pastOrderCard}>
                    <View style={{ flexDirection: "row", gap: spacing.md, alignItems: "center" }}>
                      <View style={styles.pastOrderImgWrap}>
                        {item?.image_url ? (
                          <Image source={{ uri: item.image_url }} style={styles.pastOrderImg} />
                        ) : (
                          <Package size={22} color={colors.brand} />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                          <Text style={styles.pastOrderNum}>#SLG-{ord.id.substring(0, 5).toUpperCase()}</Text>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                            <CheckCircle2 size={12} color={colors.success} />
                            <Text style={styles.deliveredText}>
                              {ord.status === "delivered" ? "Delivered" : ord.status}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.pastOrderName} numberOfLines={1}>
                          {item?.product_name || "Slurge Electronics Item"}
                        </Text>
                        <Text style={styles.pastOrderPrice}>{formatNaira(ord.total_minor)}</Text>
                      </View>
                    </View>

                    <View style={styles.pastOrderActions}>
                      <TouchableOpacity
                        style={styles.invoiceBtn}
                        onPress={() =>
                          Alert.alert(
                            "Invoice PDF",
                            `Official Tax Invoice #SLG-${ord.id.substring(0, 5).toUpperCase()}\nAmount: ${formatNaira(
                              ord.total_minor
                            )}\nStatus: Settled`
                          )
                        }
                      >
                        <FileText size={14} color={colors.textSecondary} />
                        <Text style={styles.invoiceBtnText}>Invoice (PDF)</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.buyAgainBtn}
                        onPress={() => {
                          if (item?.variant_id) {
                            addToCart(
                              {
                                variantId: item.variant_id,
                                productId: item.variant_id,
                                productName: item.product_name,
                                variantSku: item.variant_sku || "SKU-REORDER",
                                variantOptions: item.variant_options || {},
                                priceMinor: item.unit_price_minor,
                                image: item.image_url,
                                maxStock: 99,
                              },
                              1
                            );
                            Alert.alert("Item Added", "Re-added to your shopping bag!");
                          } else {
                            navigation.navigate("Main", { screen: "Home" });
                          }
                        }}
                      >
                        <RotateCcw size={14} color={colors.brand} />
                        <Text style={styles.buyAgainText}>Buy Again</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyPastOrderBox}>
                <Text style={styles.emptyPastOrderText}>
                  Your active order is tracked above. Previous completed purchases will appear here.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Account & Preferences Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Preferences</Text>
          <View style={styles.menuCard}>
            {/* Delivery Addresses */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("Checkout")}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconBox}>
                <MapPin size={18} color={colors.brand} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>Delivery Addresses</Text>
                <Text style={styles.menuSub}>Manage saved delivery locations</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* Saved Payment Cards */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                Alert.alert(
                  "Payment Security",
                  "All payments are securely tokenized and processed via Paystack."
                )
              }
              activeOpacity={0.7}
            >
              <View style={styles.menuIconBox}>
                <CreditCard size={18} color={colors.brand} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={styles.menuTitle}>Saved Payment Cards</Text>
                  <View style={styles.paystackTag}>
                    <Text style={styles.paystackTagText}>Paystack</Text>
                  </View>
                </View>
                <Text style={styles.menuSub}>Encrypted card tokenization</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* Warranties */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                Alert.alert(
                  "Official Warranties",
                  orders.length > 0
                    ? `${orders.length} Registered warranty under your Slurge account.`
                    : "Official manufacturer warranties and Slurge Shield apply automatically to all hardware purchases."
                )
              }
              activeOpacity={0.7}
            >
              <View style={styles.menuIconBox}>
                <ShieldCheck size={18} color={colors.brand} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={styles.menuTitle}>Official Warranties & Certs</Text>
                  {orders.length > 0 && <View style={[styles.activeDot, { width: 6, height: 6 }]} />}
                </View>
                <Text style={styles.menuSub}>
                  {orders.length > 0
                    ? `${orders.length} Active Warranty on hardware`
                    : "Manufacturer warranties apply on purchase"}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* Biometrics Toggle */}
            <View style={styles.menuItem}>
              <View style={styles.menuIconBox}>
                <Fingerprint size={18} color={colors.brand} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>Biometric Login & Security</Text>
                <Text style={styles.menuSub}>FaceID / Fingerprint Quick Checkout</Text>
              </View>
              <Switch
                value={biometricsEnabled}
                onValueChange={(val) => {
                  setBiometricsEnabled(val);
                  setRememberDevice(val);
                }}
                trackColor={{ false: colors.border, true: colors.brand }}
                thumbColor={colors.onPrimary}
              />
            </View>

            <View style={styles.menuDivider} />

            {/* Sign Out Button */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleSignOut}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: "rgba(239, 68, 68, 0.1)" }]}>
                <LogOut size={18} color={colors.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuTitle, { color: colors.danger }]}>Sign Out</Text>
                <Text style={styles.menuSub}>Clear credentials and local session</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
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
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  brandReg: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.brand,
  },
  locationText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.onPrimary,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  scrollContent: {
    padding: spacing.base,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.base,
    gap: spacing.base,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  profileTop: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  vipBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.brandLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  vipBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.brand,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  userPhone: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  bentoBar: {
    flexDirection: "row",
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  bentoCol: {
    flex: 1,
    alignItems: "center",
  },
  bentoVal: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  bentoLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bentoDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  spotlightSection: {
    gap: spacing.xs,
  },
  spotlightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  spotlightTag: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: colors.textPrimary,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.brand,
  },
  spotlightCard: {
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
  spotlightTop: {
    flexDirection: "row",
    gap: spacing.md,
  },
  spotlightImgWrap: {
    width: 68,
    height: 68,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  spotlightImg: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  imeiTag: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#1D1C5C",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  imeiTagText: {
    fontSize: 8,
    fontWeight: "800",
    color: colors.onPrimary,
  },
  spotlightOrderId: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.success,
  },
  spotlightTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 2,
  },
  etaText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  etaSub: {
    fontSize: 11,
    color: colors.textMuted,
  },
  pulseProgressBox: {
    backgroundColor: colors.brandLight,
    padding: 10,
    borderRadius: radius.md,
    gap: 6,
  },
  riderText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.brand,
  },
  pointText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  progressBar: {
    height: 5,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.brand,
  },
  spotlightActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  liveTrackBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.brand,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  liveTrackText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.onPrimary,
  },
  callRiderBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.brand,
  },
  pastOrderCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.base,
    gap: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: spacing.sm,
  },
  pastOrderImgWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  pastOrderImg: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  pastOrderNum: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },
  deliveredText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  pastOrderName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 2,
  },
  pastOrderPrice: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textPrimary,
    marginTop: 2,
  },
  pastOrderActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  invoiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  invoiceBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  buyAgainBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.brandLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  buyAgainText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.brand,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.base,
    gap: spacing.md,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  menuSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  paystackTag: {
    backgroundColor: "rgba(6, 129, 212, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  paystackTagText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#0681D4",
  },
  emptyOrdersCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginVertical: spacing.sm,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.brandLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  startShoppingBtn: {
    backgroundColor: colors.brand,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  startShoppingBtnText: {
    color: colors.onPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  emptyPastOrderBox: {
    padding: spacing.base,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  emptyPastOrderText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  guestContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  guestIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.brandLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  guestSub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.xl,
    maxWidth: 280,
  },
  guestPrimaryBtn: {
    backgroundColor: colors.brand,
    width: "100%",
    paddingVertical: 14,
    borderRadius: radius.lg,
    alignItems: "center",
    marginBottom: spacing.md,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  guestPrimaryBtnText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  guestSecondaryBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    width: "100%",
    paddingVertical: 14,
    borderRadius: radius.lg,
    alignItems: "center",
  },
  guestSecondaryBtnText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
});
