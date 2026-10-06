import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@/theme/tokens";
import { useAuth } from "@/context/AuthContext";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Fingerprint,
  Zap,
  Check,
  ShieldCheck,
} from "lucide-react-native";

export const AuthScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const {
    signIn,
    signUp,
    signInWithGoogle,
    quickBiometricAuth,
    isLoading,
    savedEmail,
    rememberDevice,
    setRememberDevice,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<"signIn" | "signUp">("signIn");
  const [identifier, setIdentifier] = useState<string>(savedEmail || "");
  const [fullName, setFullName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setFormError(null);
    if (!identifier.trim()) {
      setFormError("Please enter your email or Nigerian phone number");
      return;
    }
    if (!password) {
      setFormError("Please enter your password");
      return;
    }

    if (activeTab === "signIn") {
      const res = await signIn(identifier, password);
      if (!res.success) {
        setFormError(res.error || "Unable to sign in. Please verify your credentials.");
      } else {
        navigation.goBack();
      }
    } else {
      if (!fullName.trim()) {
        setFormError("Please enter your full name");
        return;
      }
      const res = await signUp(fullName, identifier, password);
      if (!res.success) {
        setFormError(res.error || "Unable to create account. Please try again.");
      } else {
        Alert.alert("Account Created", "Your account was successfully registered!", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    }
  };

  const handleBiometric = async () => {
    const res = await quickBiometricAuth();
    if (res.success) {
      if (savedEmail) setIdentifier(savedEmail);
      Alert.alert("Biometrics Recognized", `Session restored for ${savedEmail || "customer"}`);
      navigation.goBack();
    } else {
      Alert.alert("Biometric Unlock", res.error || "No saved session to restore");
    }
  };

  const handleGoogleSignIn = async () => {
    setFormError(null);
    const res = await signInWithGoogle();
    if (res.success) {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate("Main", { screen: "Home" });
      }
    } else if (res.error && res.error !== "Google sign-in was cancelled") {
      setFormError(res.error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.headerRow}>
          <View style={styles.brandGroup}>
            <View style={styles.logoBox}>
              <Zap size={18} color={colors.onPrimary} fill={colors.onPrimary} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <Text style={styles.brandTitle}>Slurge</Text>
              <Text style={styles.brandReg}>®</Text>
            </View>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Electronics Nigeria</Text>
          </View>
        </View>

        {/* Saved Session Peek Alert (Stitch Screen 1) */}
        {savedEmail && (
          <View style={styles.sessionAlert}>
            <ShieldCheck size={18} color={colors.warning} />
            <View style={{ flex: 1 }}>
              <Text style={styles.sessionAlertTitle}>Session Recovery Available</Text>
              <Text style={styles.sessionAlertSubtitle}>
                Previous login detected for {savedEmail}
              </Text>
            </View>
          </View>
        )}

        {/* Segmented Control Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "signIn" && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab("signIn");
              setFormError(null);
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === "signIn" && styles.tabTextActive]}>
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "signUp" && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab("signUp");
              setFormError(null);
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === "signUp" && styles.tabTextActive]}>
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Auth Form Card */}
        <View style={styles.card}>
          {formError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          )}

          {activeTab === "signUp" && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Ebuka Nwosu"
                  placeholderTextColor={colors.textPlaceholder}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email or Nigerian Phone</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color={colors.textPlaceholder} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { paddingLeft: 38 }]}
                placeholder="e.g. +234 803 123 4567 or you@domain.ng"
                placeholderTextColor={colors.textPlaceholder}
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.passwordLabelRow}>
              <Text style={styles.label}>Password</Text>
              {activeTab === "signIn" && (
                <TouchableOpacity onPress={() => Alert.alert("Password Recovery", "Please check your registered email for password reset instructions.")}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.inputWrapper}>
              <Lock size={18} color={colors.textPlaceholder} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { paddingLeft: 38, paddingRight: 40 }]}
                placeholder="Enter your security password"
                placeholderTextColor={colors.textPlaceholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                {showPassword ? (
                  <EyeOff size={18} color={colors.textPlaceholder} />
                ) : (
                  <Eye size={18} color={colors.textPlaceholder} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember Device Checkbox */}
          <View style={styles.rememberRow}>
            <TouchableOpacity
              style={styles.checkboxTouch}
              onPress={() => setRememberDevice(!rememberDevice)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, rememberDevice && styles.checkboxChecked]}>
                {rememberDevice && <Check size={12} color={colors.onPrimary} />}
              </View>
              <Text style={styles.rememberText}>Remember this device</Text>
            </TouchableOpacity>
            <Text style={styles.rememberSub}>30 days safe session</Text>
          </View>

          {/* Primary CTA */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <>
                <Text style={styles.primaryBtnText}>
                  {activeTab === "signIn" ? "Sign In to Slurge" : "Create Slurge Account"}
                </Text>
                <ArrowRight size={18} color={colors.onPrimary} />
              </>
            )}
          </TouchableOpacity>

          {/* Biometrics */}
          {activeTab === "signIn" && (
            <TouchableOpacity
              style={styles.biometricBtn}
              onPress={handleBiometric}
              activeOpacity={0.8}
            >
              <Fingerprint size={20} color={colors.brand} />
              <Text style={styles.biometricBtnText}>Quick Face ID / Biometrics</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Social Auth Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google OAuth Button */}
        <TouchableOpacity
          style={styles.googleBtn}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          <Image
            source={require("../../assets/google-icon.png")}
            style={styles.googleIcon}
            resizeMode="contain"
          />
          <Text style={styles.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Security Footnote */}
        <View style={styles.footnoteRow}>
          <ShieldCheck size={14} color={colors.success} />
          <Text style={styles.footnoteText}>
            Encrypted & Verified via Supabase Auth
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    paddingBottom: spacing.huge,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.base,
  },
  brandGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logoBox: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  brandReg: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textMuted,
    marginLeft: 2,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  sessionAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warningLight,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  sessionAlertTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.warning,
  },
  sessionAlertSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: colors.surfaceContainer,
    padding: 4,
    borderRadius: radius.md,
    marginBottom: spacing.base,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: radius.sm,
  },
  tabBtnActive: {
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  errorBox: {
    backgroundColor: colors.dangerLight,
    padding: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 6,
  },
  passwordLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.brand,
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 12,
    zIndex: 1,
  },
  input: {
    height: 46,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: "transparent",
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    padding: 4,
  },
  rememberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: spacing.md,
  },
  checkboxTouch: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  checkboxChecked: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  rememberText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  rememberSub: {
    fontSize: 11,
    color: colors.textMuted,
  },
  primaryBtn: {
    height: 48,
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  primaryBtnText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  biometricBtn: {
    height: 44,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: spacing.md,
  },
  biometricBtnText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  googleBtn: {
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  footnoteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: spacing.xl,
  },
  footnoteText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
});
