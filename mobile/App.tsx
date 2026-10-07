import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { RootNavigator } from "@/navigation/RootNavigator";
import { AnimatedSplashScreen } from "@/components/AnimatedSplashScreen";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <StatusBar style="dark" />
          <RootNavigator />
          {showSplash && (
            <AnimatedSplashScreen
              onFinish={() => setShowSplash(false)}
              minDurationMs={2200}
            />
          )}
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
