import { useState } from "react";
import { Redirect, router } from "expo-router";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../src/api";
import { useAuth } from "../src/auth-context";
import { ScreenBackground } from "../src/components/ScreenBackground";
import { colors, shadow } from "../src/theme";

export default function LoginScreen() {
  const { token, signIn } = useAuth();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (token) return <Redirect href="/home" />;

  async function requestOtp() {
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await api.requestOtp(phone);
      setStep("otp");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not request an OTP");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyOtp() {
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the six-digit OTP from the API terminal.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const response = await api.verifyOtp(phone, otp);
      await signIn(response.token);
      router.replace("/home");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not verify the OTP");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenBackground />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.brandRow}>
            <View style={styles.logo}><Text style={styles.logoText}>₹</Text></View>
            <View>
              <Text style={styles.brand}>MiniLedger</Text>
              <Text style={styles.tagline}>Little loans, clearly remembered.</Text>
            </View>
          </View>

          <View style={styles.hero}>
            <Text style={styles.heroEmoji}>{step === "phone" ? "👋" : "🔐"}</Text>
            <Text style={styles.title}>{step === "phone" ? "Welcome to your circle" : "Check the terminal"}</Text>
            <Text style={styles.subtitle}>
              {step === "phone"
                ? "Keep track of friendly loans without awkward spreadsheets or forgotten dates."
                : `We printed a six-digit mock OTP for ${phone} in the backend terminal.`}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>{step === "phone" ? "PHONE NUMBER" : "SIX-DIGIT OTP"}</Text>
            {step === "phone" ? (
              <View style={styles.phoneRow}>
                <View style={styles.country}><Text style={styles.countryText}>🇮🇳 +91</Text></View>
                <TextInput
                  accessibilityLabel="Phone number"
                  keyboardType="phone-pad"
                  maxLength={14}
                  onChangeText={(value) => { setPhone(value); setError(""); }}
                  onSubmitEditing={requestOtp}
                  placeholder="98765 43210"
                  placeholderTextColor="#AAA5BC"
                  style={[styles.input, styles.phoneInput]}
                  value={phone}
                />
              </View>
            ) : (
              <TextInput
                accessibilityLabel="One-time password"
                autoFocus
                keyboardType="number-pad"
                maxLength={6}
                onChangeText={(value) => { setOtp(value.replace(/\D/g, "")); setError(""); }}
                onSubmitEditing={verifyOtp}
                placeholder="• • • • • •"
                placeholderTextColor="#AAA5BC"
                style={[styles.input, styles.otpInput]}
                value={otp}
              />
            )}

            {!!error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              disabled={isSubmitting}
              onPress={step === "phone" ? requestOtp : verifyOtp}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, isSubmitting && styles.disabled]}
            >
              {isSubmitting
                ? <ActivityIndicator color="white" />
                : <Text style={styles.primaryText}>{step === "phone" ? "Send my OTP  →" : "Open my ledger  →"}</Text>}
            </Pressable>

            {step === "otp" && (
              <Pressable onPress={() => { setStep("phone"); setOtp(""); setError(""); }} style={styles.linkButton}>
                <Text style={styles.linkText}>← Change phone number</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.note}>
            <Text style={styles.noteIcon}>✦</Text>
            <Text style={styles.noteText}>Demo mode: no SMS is sent. The OTP appears in the backend log.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 22, paddingVertical: 18, justifyContent: "center", maxWidth: 520, width: "100%", alignSelf: "center" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 42 },
  logo: { width: 48, height: 48, borderRadius: 17, backgroundColor: colors.purple, alignItems: "center", justifyContent: "center", transform: [{ rotate: "-5deg" }] },
  logoText: { color: "white", fontSize: 25, fontWeight: "900" },
  brand: { color: colors.ink, fontSize: 20, fontWeight: "900" },
  tagline: { color: colors.muted, fontSize: 11, marginTop: 1 },
  hero: { marginBottom: 25 },
  heroEmoji: { fontSize: 34, marginBottom: 13 },
  title: { color: colors.ink, fontSize: 34, lineHeight: 40, fontWeight: "900", letterSpacing: -1 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 23, marginTop: 11, maxWidth: 430 },
  card: { backgroundColor: colors.surface, borderRadius: 28, padding: 20, borderWidth: 1, borderColor: colors.border, ...shadow },
  label: { color: colors.muted, fontSize: 11, fontWeight: "900", letterSpacing: 1.2, marginBottom: 10 },
  phoneRow: { flexDirection: "row", gap: 9 },
  country: { paddingHorizontal: 13, height: 56, borderRadius: 16, backgroundColor: colors.lavender, justifyContent: "center" },
  countryText: { color: colors.purpleDark, fontWeight: "800" },
  input: { height: 56, borderRadius: 16, backgroundColor: "#F6F4FB", borderWidth: 1, borderColor: colors.border, color: colors.ink, fontSize: 17, fontWeight: "700", paddingHorizontal: 16 },
  phoneInput: { flex: 1 },
  otpInput: { textAlign: "center", letterSpacing: 8, fontSize: 23 },
  error: { color: colors.red, fontSize: 13, fontWeight: "600", marginTop: 10 },
  primaryButton: { backgroundColor: colors.purple, height: 56, borderRadius: 17, marginTop: 16, alignItems: "center", justifyContent: "center" },
  primaryText: { color: "white", fontSize: 15, fontWeight: "900" },
  linkButton: { alignItems: "center", paddingTop: 16 },
  linkText: { color: colors.purple, fontSize: 13, fontWeight: "700" },
  note: { flexDirection: "row", marginTop: 22, paddingHorizontal: 8, alignItems: "center", gap: 9 },
  noteIcon: { color: colors.coral, fontSize: 16 },
  noteText: { color: colors.muted, fontSize: 12, lineHeight: 18, flex: 1 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.65 },
});
