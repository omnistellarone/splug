import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { Zap, ShieldCheck } from "lucide-react-native";
import { colors, radius, spacing } from "@/theme/tokens";

interface AnimatedSplashScreenProps {
  onFinish?: () => void;
  minDurationMs?: number;
}

const { width } = Dimensions.get("window");

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({
  onFinish,
  minDurationMs = 2000,
}) => {
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(16)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Entrance animation
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Text reveal
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      // 3. Subtle logo breathing loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.05,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // 4. Smooth dismiss after minDurationMs
    const timer = setTimeout(() => {
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        onFinish?.();
      });
    }, minDurationMs);

    return () => clearTimeout(timer);
  }, [minDurationMs, onFinish]);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      {/* Background radial glow */}
      <View style={styles.radialGlow} />

      <View style={styles.centerBox}>
        {/* Animated Brand Emblem */}
        <Animated.View
          style={[
            styles.emblemWrapper,
            {
              opacity: logoOpacity,
              transform: [{ scale: Animated.multiply(logoScale, pulseScale) }],
            },
          ]}
        >
          <View style={styles.logoBadge}>
            <Zap size={36} color={colors.onPrimary} fill={colors.onPrimary} />
          </View>
        </Animated.View>

        {/* Text & Tagline */}
        <Animated.View
          style={[
            styles.textBox,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslateY }],
            },
          ]}
        >
          <View style={styles.brandRow}>
            <Text style={styles.brandName}>Slurge</Text>
            <Text style={styles.brandReg}>®</Text>
          </View>
          <Text style={styles.tagline}>OFFICIAL ELECTRONICS FLAGSHIP</Text>
        </Animated.View>
      </View>

      {/* Footer Assurance */}
      <Animated.View style={[styles.footer, { opacity: contentOpacity }]}>
        <ShieldCheck size={14} color={colors.brand} />
        <Text style={styles.footerText}>100% Genuine Tech • 1-Year Warranty</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  radialGlow: {
    position: "absolute",
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    backgroundColor: "rgba(79, 70, 229, 0.04)",
  },
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
  },
  emblemWrapper: {
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  logoBadge: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  textBox: {
    alignItems: "center",
    marginTop: spacing.lg,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  brandName: {
    fontSize: 34,
    fontWeight: "900",
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  brandReg: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.brand,
  },
  tagline: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textSecondary,
    letterSpacing: 2,
    marginTop: 6,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: "rgba(79, 70, 229, 0.05)",
  },
  footerText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
  },
});
