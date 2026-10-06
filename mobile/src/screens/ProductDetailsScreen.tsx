import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@/theme/tokens";
import { api, Product, ProductVariant } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { PriceText, formatNaira } from "@/components/PriceText";
import { LoadingView } from "@/components/LoadingView";
import { ErrorView } from "@/components/ErrorView";
import {
  ArrowLeft,
  Share2,
  Heart,
  Star,
  ShieldCheck,
  Truck,
  Minus,
  Plus,
  ShoppingBag,
  Check,
} from "lucide-react-native";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "ProductDetails">;

export const ProductDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { slug } = route.params;
  const { user } = useAuth();
  const { addToCart, totals } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [addedToast, setAddedToast] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.getProductBySlug(slug);
        if (res.success && res.data) {
          setProduct(res.data);
          const activeVariants = res.data.variants?.filter((v) => v.is_active) || [];
          const initialVariant = activeVariants[0] || null;
          setSelectedVariant(initialVariant);
          const fallbackImg =
            res.data.primary_image ||
            (res.data as any).primaryImage ||
            res.data.images?.[0]?.storage_path ||
            null;
          setSelectedImage(fallbackImg);
        } else {
          setError((res as any).error || "Product not found");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [slug]);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <LoadingView message="Loading product details..." />
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ErrorView message={error || "Product not found"} onRetry={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const currentPriceMinor = selectedVariant?.price_minor || product.min_price_minor || 0;
  const compareAtMinor = selectedVariant?.compare_at_price_minor;
  const inStock = (selectedVariant?.stock || 0) > 0;
  const maxStock = selectedVariant?.stock || 0;

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      Alert.alert("Selection required", "Please choose a product variant first.");
      return;
    }

    await addToCart(
      {
        variantId: selectedVariant.id,
        productId: product.id,
        productName: product.name,
        variantSku: selectedVariant.sku,
        variantOptions: selectedVariant.options || {},
        priceMinor: selectedVariant.price_minor,
        image: selectedImage || product.primary_image,
        maxStock: selectedVariant.stock,
      },
      quantity
    );

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      const url = `https://splug-teal.vercel.app/products/${product.slug}`;
      await Share.share({
        title: product.name,
        message: `Check out ${product.name} on Slurge Electronics!\n${url}`,
        url,
      });
    } catch {
      // Ignore dismiss
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) {
      Alert.alert("Selection required", "Please choose a product variant first.");
      return;
    }

    if (!user) {
      Alert.alert(
        "Sign In Required",
        "Please sign in or create an account to proceed with your purchase.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Sign In / Register",
            onPress: async () => {
              await handleAddToCart();
              navigation.navigate("Auth");
            },
          },
        ]
      );
      return;
    }

    await handleAddToCart();
    navigation.navigate("Checkout");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.topBarActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleShare}
            activeOpacity={0.7}
            accessibilityLabel="Share Product"
          >
            <Share2 size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate("Main", { screen: "Cart" })}
            activeOpacity={0.7}
            accessibilityLabel="Shopping Cart"
          >
            <ShoppingBag size={20} color={colors.textPrimary} />
            {totals.itemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totals.itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Product Image Carousel View */}
        <View style={styles.galleryCard}>
          <View style={styles.mainImageWrapper}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.mainImage} resizeMode="contain" />
            ) : (
              <View style={styles.placeholderBox}>
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            )}
          </View>

          {/* Thumbnail Strip */}
          {product.images && product.images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbStrip}
            >
              {product.images.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.thumbBox,
                    selectedImage === img.storage_path && styles.thumbBoxActive,
                  ]}
                  onPress={() => setSelectedImage(img.storage_path)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: img.storage_path }} style={styles.thumbImg} resizeMode="contain" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Product Info Card */}
        <View style={styles.infoCard}>
          {/* Trust Badges */}
          <View style={styles.badgeRow}>
            <View style={styles.officialBadge}>
              <ShieldCheck size={12} color={colors.brand} />
              <Text style={styles.officialBadgeText}>Official Store</Text>
            </View>
            <View style={[styles.stockBadge, !inStock && { backgroundColor: colors.dangerLight }]}>
              <Text style={[styles.stockBadgeText, !inStock && { color: colors.danger }]}>
                {inStock ? `In Stock (${maxStock} units)` : "Out of Stock"}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{product.name}</Text>

          {/* Rating Row */}
          <View style={styles.ratingRow}>
            <View style={styles.starGroup}>
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingScore}>4.9</Text>
            </View>
            <Text style={styles.ratingCount}>•  128 Verified Ratings</Text>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <PriceText amountMinor={currentPriceMinor} compareAtMinor={compareAtMinor} style={{ fontSize: 24 }} />
          </View>

          {/* Warranty & Delivery Guarantee */}
          <View style={styles.guaranteeBox}>
            <View style={styles.guaranteeItem}>
              <Truck size={16} color={colors.brand} />
              <Text style={styles.guaranteeText}>Next-Day Delivery Available</Text>
            </View>
            <View style={styles.guaranteeItem}>
              <ShieldCheck size={16} color={colors.success} />
              <Text style={styles.guaranteeText}>1-Year Brand Warranty</Text>
            </View>
          </View>

          {/* Variant Selector: Options (e.g. Storage, Color) */}
          {product.variants && product.variants.length > 0 && (
            <View style={styles.variantSection}>
              <Text style={styles.sectionHeading}>Select Edition / Variant</Text>
              <View style={styles.variantPillsGrid}>
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const label =
                    Object.values(v.options || {}).join(" • ") || v.sku || "Standard";

                  return (
                    <TouchableOpacity
                      key={v.id}
                      style={[
                        styles.variantPill,
                        isSelected && styles.variantPillActive,
                        !v.is_active && styles.variantPillDisabled,
                      ]}
                      onPress={() => setSelectedVariant(v)}
                      disabled={!v.is_active}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.variantPillText,
                          isSelected && styles.variantPillTextActive,
                        ]}
                      >
                        {label}
                      </Text>
                      <Text
                        style={[
                          styles.variantPillPrice,
                          isSelected && styles.variantPillPriceActive,
                        ]}
                      >
                        {formatNaira(v.price_minor)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Quantity Controls */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionHeading}>Quantity</Text>
            <View style={styles.counterBox}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus size={16} color={quantity <= 1 ? colors.outlineVariant : colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.quantityNum}>{quantity}</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setQuantity(Math.min(maxStock, quantity + 1))}
                disabled={quantity >= maxStock}
              >
                <Plus size={16} color={quantity >= maxStock ? colors.outlineVariant : colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description & Key Specs */}
          <View style={styles.descSection}>
            <Text style={styles.sectionHeading}>Product Overview</Text>
            <Text style={styles.descText}>
              {product.description ||
                "Engineered for unparalleled performance, next-generation display fidelity, premium aerospace-grade materials, and industry-leading battery efficiency."}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Added Toast Notification */}
      {addedToast && (
        <View style={styles.toast}>
          <Check size={16} color={colors.onPrimary} />
          <Text style={styles.toastText}>Added to cart successfully!</Text>
        </View>
      )}

      {/* Sticky Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cartActionBtn}
          onPress={handleAddToCart}
          disabled={!inStock}
          activeOpacity={0.85}
        >
          <ShoppingBag size={18} color={colors.brand} />
          <Text style={styles.cartActionBtnText}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buyActionBtn, !inStock && styles.buyActionBtnDisabled]}
          onPress={handleBuyNow}
          disabled={!inStock}
          activeOpacity={0.85}
        >
          <Text style={styles.buyActionBtnText}>Buy Now</Text>
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
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  topBarActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: colors.brand,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: colors.onPrimary,
    fontSize: 9,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: 100,
  },
  galleryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  mainImageWrapper: {
    width: "100%",
    height: 240,
    alignItems: "center",
    justifyContent: "center",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  placeholderBox: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceContainerLow,
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  thumbStrip: {
    gap: 8,
    marginTop: spacing.md,
  },
  thumbBox: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 3,
    backgroundColor: colors.surfaceContainerLow,
  },
  thumbBoxActive: {
    borderColor: colors.brand,
  },
  thumbImg: {
    width: "100%",
    height: "100%",
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: spacing.sm,
  },
  officialBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.brandLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  officialBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.brand,
  },
  stockBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  stockBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.success,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.md,
  },
  starGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingScore: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  ratingCount: {
    fontSize: 12,
    color: colors.textMuted,
  },
  priceRow: {
    marginBottom: spacing.md,
  },
  guaranteeBox: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 8,
    marginBottom: spacing.base,
  },
  guaranteeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  guaranteeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  variantSection: {
    marginBottom: spacing.base,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  variantPillsGrid: {
    gap: 8,
  },
  variantPill: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  variantPillActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brandLight,
  },
  variantPillDisabled: {
    opacity: 0.5,
  },
  variantPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  variantPillTextActive: {
    color: colors.brand,
  },
  variantPillPrice: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  variantPillPriceActive: {
    color: colors.brand,
    fontWeight: "700",
  },
  quantitySection: {
    marginBottom: spacing.base,
  },
  counterBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceContainerLow,
  },
  counterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  quantityNum: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    paddingHorizontal: 12,
  },
  descSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  descText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
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
    gap: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  cartActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.brand,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.surface,
  },
  cartActionBtnText: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: "700",
  },
  buyActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  buyActionBtnDisabled: {
    backgroundColor: colors.outlineVariant,
  },
  buyActionBtnText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  toast: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: colors.success,
    padding: spacing.md,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  toastText: {
    color: colors.onPrimary,
    fontWeight: "700",
    fontSize: 13,
  },
});
