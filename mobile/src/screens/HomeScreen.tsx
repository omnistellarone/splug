import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@/theme/tokens";
import { api, Product, Category } from "@/lib/api";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { LoadingView } from "@/components/LoadingView";
import { ErrorView } from "@/components/ErrorView";
import { Search, X, Sparkles, Filter } from "lucide-react-native";

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [catRes, prodRes] = await Promise.all([
        api.getCategories(),
        api.getProducts({
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          query: searchQuery.trim() || undefined,
        }),
      ]);

      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
      if (prodRes.success && prodRes.data) {
        setProducts(prodRes.data);
      } else {
        setError(prodRes.error || "Could not retrieve products");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const renderHeader = () => (
    <View>
      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={18} color={colors.textPlaceholder} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search iPhones, MacBooks, Audio..."
            placeholderTextColor={colors.textPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} activeOpacity={0.7}>
              <X size={16} color={colors.textPlaceholder} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Promotional Hero Banner (Stitch Screen 2) */}
      <View style={styles.heroBanner}>
        <View style={styles.heroBadge}>
          <Sparkles size={12} color="#F59E0B" />
          <Text style={styles.heroBadgeText}>NIGERIA'S OFFICIAL FLAGSHIP STORE</Text>
        </View>
        <Text style={styles.heroTitle}>Supercharge Your Tech</Text>
        <Text style={styles.heroSubtitle}>
          Authentic Apple, Samsung & Sony devices with 1-Year warranty & rapid nationwide delivery.
        </Text>
        <TouchableOpacity
          style={styles.heroCta}
          onPress={() => setSelectedCategory("all")}
          activeOpacity={0.8}
        >
          <Text style={styles.heroCtaText}>Explore Collection</Text>
        </TouchableOpacity>
      </View>

      {/* Category Pills Filter */}
      <View style={styles.categoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          <TouchableOpacity
            style={[
              styles.categoryPill,
              selectedCategory === "all" && styles.categoryPillActive,
            ]}
            onPress={() => setSelectedCategory("all")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.categoryPillText,
                selectedCategory === "all" && styles.categoryPillTextActive,
              ]}
            >
              All Products
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryPill,
                selectedCategory === cat.slug && styles.categoryPillActive,
              ]}
              onPress={() => setSelectedCategory(cat.slug)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  selectedCategory === cat.slug && styles.categoryPillTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Catalog Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === "all" ? "Featured Electronics" : `${selectedCategory.toUpperCase()}`}
        </Text>
        <Text style={styles.productCount}>{products.length} Items</Text>
      </View>
    </View>
  );

  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Header onPressCart={() => navigation.navigate("Main", { screen: "Cart" })} />
        <LoadingView message="Loading Slurge catalog..." />
      </SafeAreaView>
    );
  }

  if (error && products.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Header onPressCart={() => navigation.navigate("Main", { screen: "Cart" })} />
        <ErrorView message={error} onRetry={loadData} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header onPressCart={() => navigation.navigate("Main", { screen: "Cart" })} />

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.brand]} />
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ProductCard
              product={item}
              onPress={() => navigation.navigate("ProductDetails", { slug: item.slug })}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No matching products</Text>
            <Text style={styles.emptySubtitle}>
              Try searching for a different keyword or resetting your category filter.
            </Text>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              <Text style={styles.resetBtnText}>Clear Search & Filters</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.huge,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  cardWrapper: {
    width: "48%",
  },
  searchRow: {
    marginVertical: spacing.sm,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  heroBanner: {
    backgroundColor: colors.brandDark,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginVertical: spacing.md,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
  },
  heroBadgeText: {
    color: "#FCD34D",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.onPrimary,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    color: "#D1D5DB",
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  heroCta: {
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.base,
    paddingVertical: 8,
    borderRadius: radius.md,
    alignSelf: "flex-start",
  },
  heroCtaText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
  categoriesSection: {
    marginBottom: spacing.md,
  },
  categoryScroll: {
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.pill,
  },
  categoryPillActive: {
    backgroundColor: colors.brand,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  categoryPillTextActive: {
    color: colors.onPrimary,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  productCount: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textMuted,
  },
  emptyContainer: {
    paddingVertical: spacing.huge,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  resetBtn: {
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: spacing.base,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.brand,
  },
});
