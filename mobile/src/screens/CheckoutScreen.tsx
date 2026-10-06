import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@/theme/tokens";
import { api, Address } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatNaira } from "@/components/PriceText";
import {
  ArrowLeft,
  MapPin,
  Plus,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  X,
} from "lucide-react-native";
import { WebView } from "react-native-webview";

export const CheckoutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const { items, totals, shippingMinor, finalTotalMinor, couponCode, clearCart } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState<boolean>(true);

  // Add Address Modal state
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [newFullName, setNewFullName] = useState<string>("");
  const [newPhone, setNewPhone] = useState<string>("");
  const [newLine1, setNewLine1] = useState<string>("");
  const [newCity, setNewCity] = useState<string>("");
  const [newState, setNewState] = useState<string>("Lagos State");
  const [newIsDefault, setNewIsDefault] = useState<boolean>(true);
  const [isSavingAddress, setIsSavingAddress] = useState<boolean>(false);

  // Paystack execution
  const [isInitializingPayment, setIsInitializingPayment] = useState<boolean>(false);
  const [paystackAuthUrl, setPaystackAuthUrl] = useState<string | null>(null);
  const [currentReference, setCurrentReference] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadAddresses();
      if (!newFullName && (user.user_metadata?.full_name || (user as any).name)) {
        setNewFullName(user.user_metadata?.full_name || (user as any).name || "");
      }
      if (!newPhone && user.phone) {
        setNewPhone(user.phone);
      }
    } else {
      setIsLoadingAddresses(false);
    }
  }, [user]);

  const loadAddresses = async () => {
    setIsLoadingAddresses(true);
    try {
      const res = await api.getAddresses();
      if (res.success && res.data) {
        setAddresses(res.data);
        const def = res.data.find((a) => a.is_default) || res.data[0];
        if (def) setSelectedAddressId(def.id);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const handleSaveNewAddress = async () => {
    if (!newFullName.trim() || !newPhone.trim() || !newLine1.trim() || !newCity.trim()) {
      Alert.alert("Missing Fields", "Please complete all address fields to proceed.");
      return;
    }

    setIsSavingAddress(true);
    try {
      const res = await api.saveAddress({
        full_name: newFullName.trim(),
        phone: newPhone.trim(),
        address_line1: newLine1.trim(),
        city: newCity.trim(),
        state: newState.trim(),
        country: "NG",
        is_default: newIsDefault,
      });

      if (res.success && res.data) {
        setShowAddressModal(false);
        await loadAddresses();
        setSelectedAddressId(res.data.id);
      } else {
        Alert.alert("Error", res.error || "Failed to save address");
      }
    } catch (err: unknown) {
      Alert.alert("Error", err instanceof Error ? err.message : "Network error");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handlePayWithPaystack = async () => {
    if (!user) {
      Alert.alert(
        "Sign In Required",
        "Please sign in or create an account to proceed with checkout and receive your order updates.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Sign In",
            onPress: () => navigation.navigate("Auth"),
          },
        ]
      );
      return;
    }

    if (items.length === 0) {
      Alert.alert("Cart is empty", "Add items to your cart before proceeding to checkout.");
      return;
    }

    if (addresses.length === 0 || !selectedAddressId) {
      Alert.alert(
        "Delivery Address Required",
        "Please add your delivery address to complete your order.",
        [
          {
            text: "Add Address",
            onPress: () => setShowAddressModal(true),
          },
        ]
      );
      setShowAddressModal(true);
      return;
    }

    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
    if (!selectedAddress) {
      setShowAddressModal(true);
      return;
    }

    setIsInitializingPayment(true);
    try {
      const res = await api.initCheckout({
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        shippingAddress: {
          full_name: selectedAddress.full_name,
          phone: selectedAddress.phone,
          address_line1: selectedAddress.address_line1,
          address_line2: selectedAddress.address_line2,
          city: selectedAddress.city,
          state: selectedAddress.state,
          country: selectedAddress.country || "NG",
        },
        couponCode: couponCode || undefined,
        callbackUrl: "slurge://payment-callback",
      });

      if (res.success && res.data) {
        setCurrentReference(res.data.reference);
        setPaystackAuthUrl(res.data.authorizationUrl);
      } else {
        Alert.alert("Checkout Error", res.error || "Failed to initialize payment.");
      }
    } catch (err: unknown) {
      Alert.alert("Checkout Error", err instanceof Error ? err.message : "Payment initialization failed.");
    } finally {
      setIsInitializingPayment(false);
    }
  };

  const paystackInjectedJS = `
    (function() {
      if (window.__paystackListenerAttached) return;
      window.__paystackListenerAttached = true;
      var notified = false;

      function notifySuccess(ref) {
        if (notified) return;
        notified = true;
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PAYSTACK_SUCCESS', reference: ref || '' }));
        }
      }

      // 1. Listen for Paystack's cross-window postMessage events
      window.addEventListener('message', function(event) {
        try {
          var data = event.data;
          if (typeof data === 'string') {
            try { data = JSON.parse(data); } catch(e) {}
          }
          if (data && (data.event === 'successful' || data.status === 'success' || data.trxref || data.reference)) {
            notifySuccess(data.reference || data.trxref || '');
          }
        } catch(e) {}
      });

      // 2. Poll DOM for Paystack success indicators
      var interval = setInterval(function() {
        if (notified) {
          clearInterval(interval);
          return;
        }
        var body = document.body ? (document.body.innerText || "") : "";
        var bodyLower = body.toLowerCase();
        if (
          bodyLower.indexOf("payment successful") !== -1 ||
          bodyLower.indexOf("payment completed") !== -1 ||
          bodyLower.indexOf("transaction successful") !== -1 ||
          (bodyLower.indexOf("successful") !== -1 && (bodyLower.indexOf("reference") !== -1 || bodyLower.indexOf("paid") !== -1 || bodyLower.indexOf("naira") !== -1))
        ) {
          notifySuccess('');
        }
      }, 500);

      // 3. Intercept click on any Close or Done buttons in Paystack success screen
      document.addEventListener('click', function(e) {
        var el = e.target;
        if (el) {
          var text = (el.innerText || el.textContent || "").toLowerCase();
          if (text.indexOf("close") !== -1 || text.indexOf("done") !== -1 || text.indexOf("return") !== -1) {
            notifySuccess('');
          }
        }
      }, true);
    })();
    true;
  `;

  const handleCompleteAndGoToOrders = async (ref?: string) => {
    setPaystackAuthUrl(null);
    clearCart();
    const referenceToVerify = ref || currentReference;
    if (referenceToVerify) {
      try {
        await api.verifyPayment(referenceToVerify);
      } catch {
        // webhook handles settlement
      }
    }
    navigation.navigate("Main", { screen: "Account" });
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data && (data.type === "PAYSTACK_SUCCESS" || data.event === "successful" || data.status === "success")) {
        handleCompleteAndGoToOrders(data.reference);
      }
    } catch {
      const raw = event.nativeEvent.data;
      if (raw && (raw.includes("SUCCESS") || raw.includes("success"))) {
        handleCompleteAndGoToOrders();
      }
    }
  };

  const handleInterceptPaymentUrl = (url: string) => {
    if (!url) return true;

    // Check if URL represents payment completion or callback
    const isCompleted =
      url.startsWith("slurge://payment-callback") ||
      url.includes("payment-callback") ||
      url.includes("payments/paystack/verify") ||
      url.includes("checkout/success") ||
      url.includes("standard.paystack.co/close") ||
      url.includes("status=success") ||
      (url.includes("trxref=") && !url.includes("checkout.paystack.com/pay/"));

    if (isCompleted) {
      handleCompleteAndGoToOrders();
      return false;
    } else if (
      url.includes("checkout/failure") ||
      url.includes("cancel")
    ) {
      setPaystackAuthUrl(null);
      navigation.replace("PaymentStatus", {
        reference: currentReference || undefined,
        failed: true,
      });
      return false;
    }
    return true;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Delivery & Payment</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step 1: Delivery Address */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MapPin size={18} color={colors.brand} />
              <Text style={styles.sectionTitle}>1. Delivery Address</Text>
            </View>
            <TouchableOpacity
              style={styles.addAddressBtn}
              onPress={() => setShowAddressModal(true)}
              activeOpacity={0.7}
            >
              <Plus size={14} color={colors.brand} />
              <Text style={styles.addAddressText}>Add New</Text>
            </TouchableOpacity>
          </View>

          {isLoadingAddresses ? (
            <ActivityIndicator size="small" color={colors.brand} style={{ padding: 16 }} />
          ) : addresses.length === 0 ? (
            <TouchableOpacity
              style={styles.emptyAddressBox}
              onPress={() => setShowAddressModal(true)}
              activeOpacity={0.8}
            >
              <Plus size={20} color={colors.brand} />
              <Text style={styles.emptyAddressText}>Tap to add your delivery address</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.addressList}>
              {addresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <TouchableOpacity
                    key={addr.id}
                    style={[styles.addressItem, isSelected && styles.addressItemActive]}
                    onPress={() => setSelectedAddressId(addr.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.radioRow}>
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Text style={styles.addressName}>{addr.full_name}</Text>
                          {addr.is_default && (
                            <View style={styles.defaultPill}>
                              <Text style={styles.defaultPillText}>DEFAULT</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.addressLine}>{addr.address_line1}</Text>
                        <Text style={styles.addressCity}>
                          {addr.city}, {addr.state}
                        </Text>
                        <Text style={styles.addressPhone}>{addr.phone}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Step 2: Payment Provider (Paystack) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <CreditCard size={18} color={colors.brand} />
            <Text style={styles.sectionTitle}>2. Payment Method</Text>
          </View>

          <View style={styles.paymentBox}>
            <View style={styles.paystackHeader}>
              <View style={styles.paystackPill}>
                <Text style={styles.paystackPillText}>PAYSTACK SECURE</Text>
              </View>
              <View style={styles.encryptionBadge}>
                <Lock size={12} color={colors.success} />
                <Text style={styles.encryptionText}>256-Bit TLS</Text>
              </View>
            </View>
            <Text style={styles.paymentChannels}>
              Debit & Credit Cards (Mastercard, Visa, Verve) • Bank Transfer • USSD
            </Text>
          </View>
        </View>

        {/* Step 3: Review Items Snapshot */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>3. Order Items ({totals.itemCount})</Text>
          <View style={styles.itemsList}>
            {items.map((item) => (
              <View key={item.variantId} style={styles.reviewItemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewItemName} numberOfLines={1}>
                    {item.productName}
                  </Text>
                  <Text style={styles.reviewItemSub}>
                    Qty: {item.quantity} • {formatNaira(item.priceMinor)}
                  </Text>
                </View>
                <Text style={styles.reviewItemTotal}>
                  {formatNaira(item.priceMinor * item.quantity)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Final Price Breakdown */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryVal}>{formatNaira(totals.subtotalMinor)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={[styles.summaryVal, shippingMinor === 0 && { color: colors.success }]}>
              {shippingMinor === 0 ? "FREE" : formatNaira(shippingMinor)}
            </Text>
          </View>
          {couponCode && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.success }]}>
                Coupon Discount ({couponCode})
              </Text>
              <Text style={[styles.summaryVal, { color: colors.success }]}>
                -{formatNaira(totals.subtotalMinor - finalTotalMinor + shippingMinor)}
              </Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalVal}>{formatNaira(finalTotalMinor)}</Text>
          </View>
        </View>

        <View style={styles.securityNote}>
          <ShieldCheck size={16} color={colors.success} />
          <Text style={styles.securityNoteText}>
            Protected by Paystack. Server-side verified & Mailgun confirmed.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Pay Button */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomBarLabel}>Total to Pay</Text>
          <Text style={styles.bottomBarAmount}>{formatNaira(finalTotalMinor)}</Text>
        </View>
        <TouchableOpacity
          style={styles.payBtn}
          onPress={handlePayWithPaystack}
          disabled={isInitializingPayment}
          activeOpacity={0.85}
        >
          {isInitializingPayment ? (
            <ActivityIndicator size="small" color={colors.onPrimary} />
          ) : (
            <Text style={styles.payBtnText}>Pay with Paystack</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Add Address Drawer (In-Screen Overlay for flawless Android & iOS keyboard avoidance) */}
      {showAddressModal && (
        <View style={styles.modalRootOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowAddressModal(false)}
          />
          <KeyboardAvoidingView
            style={styles.modalKeyboardAvoid}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Delivery Address</Text>
                <TouchableOpacity onPress={() => setShowAddressModal(false)} style={{ padding: 4 }}>
                  <X size={20} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.modalForm}
              >
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Recipient Full Name</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={newFullName}
                    onChangeText={setNewFullName}
                    placeholder="e.g. Ebuka Nwosu"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Nigerian Phone Number</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={newPhone}
                    onChangeText={setNewPhone}
                    placeholder="e.g. +234 803 123 4567"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Street Address</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={newLine1}
                    onChangeText={setNewLine1}
                    placeholder="e.g. Plot 14 Admiralty Way, Lekki"
                  />
                </View>

                <View style={styles.fieldRow}>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>City / Area</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={newCity}
                      onChangeText={setNewCity}
                      placeholder="e.g. Lekki"
                    />
                  </View>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>State</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={newState}
                      onChangeText={setNewState}
                      placeholder="e.g. Lagos State"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.defaultCheckRow}
                  onPress={() => setNewIsDefault(!newIsDefault)}
                >
                  <View style={[styles.checkbox, newIsDefault && styles.checkboxActive]}>
                    {newIsDefault && <CheckCircle2 size={12} color={colors.onPrimary} />}
                  </View>
                  <Text style={styles.defaultCheckText}>Set as default delivery address</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveAddressBtn}
                  onPress={handleSaveNewAddress}
                  disabled={isSavingAddress}
                  activeOpacity={0.85}
                >
                  {isSavingAddress ? (
                    <ActivityIndicator color={colors.onPrimary} />
                  ) : (
                    <Text style={styles.saveAddressBtnText}>Save Address</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}

      {/* Paystack In-App WebView Modal */}
      {paystackAuthUrl && (
        <Modal visible={true} animationType="slide" onRequestClose={() => setPaystackAuthUrl(null)}>
          <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
            <View style={styles.webViewHeader}>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert("Cancel Payment", "Are you sure you want to exit the payment screen?", [
                    { text: "No", style: "cancel" },
                    { text: "Exit", onPress: () => setPaystackAuthUrl(null) },
                  ]);
                }}
                style={{ padding: 4 }}
              >
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.webViewTitle}>Paystack Secure Payment</Text>
              <TouchableOpacity
                onPress={() => handleCompleteAndGoToOrders()}
                style={styles.doneBtn}
                activeOpacity={0.8}
              >
                <CheckCircle2 size={13} color={colors.onPrimary} />
                <Text style={styles.doneBtnText}>I've Paid</Text>
              </TouchableOpacity>
            </View>

            <WebView
              source={{ uri: paystackAuthUrl }}
              injectedJavaScriptBeforeContentLoaded={paystackInjectedJS}
              injectedJavaScript={paystackInjectedJS}
              onMessage={handleWebViewMessage}
              onShouldStartLoadWithRequest={(req) => handleInterceptPaymentUrl(req.url)}
              onNavigationStateChange={(nav) => handleInterceptPaymentUrl(nav.url)}
              startInLoadingState
              renderLoading={() => (
                <View style={styles.webLoading}>
                  <ActivityIndicator size="large" color={colors.brand} />
                  <Text style={{ marginTop: 12, color: colors.textSecondary }}>
                    Connecting to Paystack...
                  </Text>
                </View>
              )}
            />
          </SafeAreaView>
        </Modal>
      )}
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
    paddingBottom: 110,
    gap: spacing.md,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  addAddressBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.brandLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  addAddressText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.brand,
  },
  emptyAddressBox: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: "center",
    gap: 8,
  },
  emptyAddressText: {
    fontSize: 13,
    color: colors.brand,
    fontWeight: "600",
  },
  addressList: {
    gap: 8,
  },
  addressItem: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  addressItemActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brandLight,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  radioCircleActive: {
    borderColor: colors.brand,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand,
  },
  addressName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  defaultPill: {
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  defaultPillText: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.textSecondary,
  },
  addressLine: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addressCity: {
    fontSize: 12,
    color: colors.textMuted,
  },
  addressPhone: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  paymentBox: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 6,
  },
  paystackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  paystackPill: {
    backgroundColor: colors.brandDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  paystackPillText: {
    color: colors.onPrimary,
    fontSize: 10,
    fontWeight: "800",
  },
  encryptionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  encryptionText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: "600",
  },
  paymentChannels: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  itemsList: {
    gap: 8,
    marginTop: 6,
  },
  reviewItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewItemName: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  reviewItemSub: {
    fontSize: 11,
    color: colors.textMuted,
  },
  reviewItemTotal: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
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
  summaryVal: {
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
  totalVal: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.brand,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: spacing.sm,
  },
  securityNoteText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  bottomBar: {
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
  },
  bottomBarLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  bottomBarAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  payBtn: {
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.xl,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 170,
  },
  payBtnText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  modalRootOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    elevation: 30,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  modalKeyboardAvoid: {
    width: "100%",
    maxHeight: "88%",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.base,
    maxHeight: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 25,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.base,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  modalForm: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  field: {
    gap: 4,
  },
  fieldRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  fieldInput: {
    height: 44,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    fontSize: 13,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  defaultCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  defaultCheckText: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  saveAddressBtn: {
    backgroundColor: colors.brand,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  saveAddressBtnText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  webViewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  doneBtn: {
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  doneBtnText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
  webViewTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  webLoading: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
});
