import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer, LinkingOptions } from "@react-navigation/native";
import { colors } from "@/theme/tokens";
import { HomeScreen } from "@/screens/HomeScreen";
import { ProductDetailsScreen } from "@/screens/ProductDetailsScreen";
import { CartScreen } from "@/screens/CartScreen";
import { CheckoutScreen } from "@/screens/CheckoutScreen";
import { PaymentStatusScreen } from "@/screens/PaymentStatusScreen";
import { OrderTrackingScreen } from "@/screens/OrderTrackingScreen";
import { AccountScreen } from "@/screens/AccountScreen";
import { AuthScreen } from "@/screens/AuthScreen";
import { useCart } from "@/context/CartContext";
import { Home, ShoppingBag, User } from "lucide-react-native";
import * as Linking from "expo-linking";

export type RootStackParamList = {
  Main: { screen?: "Home" | "Cart" | "Account" } | undefined;
  Home: undefined;
  Cart: undefined;
  Account: undefined;
  ProductDetails: { slug: string };
  Checkout: undefined;
  PaymentStatus: { reference?: string; failed?: boolean; orderId?: string };
  OrderTracking: { orderId: string };
  Auth: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: any = {
  prefixes: [Linking.createURL("/"), "slurge://", "https://splug-teal.vercel.app"],
  config: {
    screens: {
      Main: {
        screens: {
          Home: "home",
          Cart: "cart",
          Account: "account",
        },
      },
      ProductDetails: "product/:slug",
      Checkout: "checkout",
      PaymentStatus: "payment-status",
      OrderTracking: "tracking/:orderId",
      Auth: "auth",
    },
  },
  getStateFromPath: (path: string, options: any) => {
    if (path.includes("auth/callback")) {
      return {
        routes: [{ name: "Main", state: { routes: [{ name: "Home" }] } }],
      };
    }
    if (path.includes("payment-callback")) {
      const matchRef = path.match(/[?&]reference=([^&]+)/);
      const matchOrder = path.match(/[?&]orderId=([^&]+)/);
      const isFailed = path.includes("failed=true");
      return {
        routes: [
          {
            name: "PaymentStatus",
            params: {
              reference: matchRef ? decodeURIComponent(matchRef[1]) : undefined,
              orderId: matchOrder ? decodeURIComponent(matchOrder[1]) : undefined,
              failed: isFailed,
            },
          },
        ],
      };
    }
    const normalized = path.replace(/^\/?products\//, "product/");
    const { getStateFromPath: defaultGetStateFromPath } = require("@react-navigation/native");
    return defaultGetStateFromPath(normalized, options);
  },
};


function MainTabs() {
  const { totals } = useCart();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderTopColor: "rgba(226, 232, 240, 0.8)",
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Shop",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: "Cart",
          tabBarBadge: totals.itemCount > 0 ? totals.itemCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.brand,
            color: colors.onPrimary,
            fontSize: 10,
            fontWeight: "700",
          },
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarLabel: "Account",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="PaymentStatus" component={PaymentStatusScreen} />
        <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{
            presentation: "modal",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
