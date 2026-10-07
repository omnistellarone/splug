import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { colors, radius, spacing } from "@/theme/tokens";
import { Product } from "@/lib/api";
import { PriceText } from "./PriceText";
import { Plus, Star } from "lucide-react-native";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const { addToCart } = useCart();
  const primaryVariant = product.variants?.[0];
  const priceMinor = primaryVariant?.price_minor || product.min_price_minor || (product as any).minPriceMinor || 0;
  const compareAtMinor = primaryVariant?.compare_at_price_minor || (product as any).compareAtMinor;
  const inStock = (primaryVariant?.stock || (product as any).totalStock || 0) > 0;

  const imageUri =
    product.primary_image ||
    (product as any).primaryImage ||
    product.images?.find((img: any) => img.is_primary)?.storage_path ||
    product.images?.[0]?.storage_path;

  const handleQuickAdd = (e: any) => {
    e.stopPropagation?.();
    if (!primaryVariant) return;

    addToCart(
      {
        variantId: primaryVariant.id,
        productId: product.id,
        productName: product.name,
        variantSku: primaryVariant.sku,
        variantOptions: primaryVariant.options || {},
        priceMinor: primaryVariant.price_minor,
        image: imageUri,
        maxStock: primaryVariant.stock || 10,
      },
      1
    );
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={product.name}
    >
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        <View style={styles.tagRow}>
          <View style={styles.ratingBadge}>
            <Star size={10} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.ratingText}>4.9</Text>
          </View>
          {inStock ? (
            <View style={styles.stockBadge}>
              <Text style={styles.stockBadgeText}>In Stock</Text>
            </View>
          ) : (
            <View style={[styles.stockBadge, styles.stockBadgeOutOfStock]}>
              <Text style={[styles.stockBadgeText, { color: colors.danger }]}>Out of Stock</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.priceContainer}>
            <PriceText amountMinor={priceMinor} compareAtMinor={compareAtMinor} stacked />
          </View>

          <TouchableOpacity
            style={[styles.addBtn, !inStock && styles.addBtnDisabled]}
            onPress={handleQuickAdd}
            disabled={!inStock}
            activeOpacity={0.7}
            accessibilityLabel={`Add ${product.name} to cart`}
          >
            <Plus size={16} color={colors.onPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.85)",
    overflow: "hidden",
    marginBottom: spacing.md,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  imageContainer: {
    width: "100%",
    height: 160,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    padding: 0,
    overflow: "hidden",
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceContainer,
  },
  placeholderText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  tagRow: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 2,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.pill,
    gap: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  stockBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.pill,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  stockBadgeOutOfStock: {
    backgroundColor: "rgba(254, 242, 242, 0.95)",
    borderColor: "rgba(254, 202, 202, 0.8)",
  },
  stockBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#16A34A",
  },
  details: {
    padding: 12,
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    lineHeight: 18,
    height: 36,
    marginBottom: spacing.xs,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: "auto",
    minHeight: 34,
  },
  priceContainer: {
    flex: 1,
    marginRight: 6,
    justifyContent: "flex-end",
  },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  addBtnDisabled: {
    backgroundColor: colors.outlineVariant,
    shadowOpacity: 0,
  },
});
