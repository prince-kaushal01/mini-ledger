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
import { dateAfterDays } from "../src/format";
import { colors, shadow } from "../src/theme";

export default function AddLoanScreen() {
  const { token } = useAuth();
  const [friendName, setFriendName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(dateAfterDays(7));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!token) return <Redirect href="/login" />;

  async function submit() {
    const parsedAmount = Number(amount);
    if (friendName.trim().length < 2) {
      setError("Please enter your friend’s name.");
      return;
    }
    if (!/^\d+(\.\d{1,2})?$/.test(amount) || parsedAmount <= 0) {
      setError("Enter a valid amount with up to two decimal places.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      setError("Use YYYY-MM-DD for the due date.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await api.createLoan(token!, { friendName: friendName.trim(), amount: parsedAmount, dueDate });
      router.replace({ pathname: "/home", params: { notice: "loan-added" } });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not save this loan");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenBackground />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}><Text style={styles.backText}>←</Text></Pressable>
            <View style={styles.headerCopy}>
              <Text style={styles.kicker}>A FRIENDLY REMINDER</Text>
              <Text style={styles.title}>Add a loan</Text>
            </View>
            <View style={styles.emoji}><Text style={styles.emojiText}>🤝</Text></View>
          </View>

          <Text style={styles.intro}>Capture the details now, so both you and your friendship can stay relaxed later.</Text>

          <View style={styles.card}>
            <Text style={styles.label}>WHO DID YOU HELP?</Text>
            <TextInput
              autoCapitalize="words"
              onChangeText={(value) => { setFriendName(value); setError(""); }}
              placeholder="e.g. Asha"
              placeholderTextColor="#AAA5BC"
              style={styles.input}
              value={friendName}
            />

            <Text style={[styles.label, styles.fieldGap]}>HOW MUCH?</Text>
            <View style={styles.amountRow}>
              <View style={styles.currency}><Text style={styles.currencyText}>₹</Text></View>
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={(value) => { setAmount(value.replace(/[^\d.]/g, "")); setError(""); }}
                placeholder="1,500"
                placeholderTextColor="#AAA5BC"
                style={[styles.input, styles.amountInput]}
                value={amount}
              />
            </View>

            <Text style={[styles.label, styles.fieldGap]}>WHEN IS IT DUE?</Text>
            <TextInput
              autoCapitalize="none"
              keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "default"}
              maxLength={10}
              onChangeText={(value) => { setDueDate(value); setError(""); }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#AAA5BC"
              style={styles.input}
              value={dueDate}
            />

            <View style={styles.chips}>
              {[7, 14, 30].map((days) => (
                <Pressable key={days} onPress={() => setDueDate(dateAfterDays(days))} style={styles.chip}>
                  <Text style={styles.chipText}>+{days} days</Text>
                </Pressable>
              ))}
            </View>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              disabled={isSubmitting}
              onPress={submit}
              style={({ pressed }) => [styles.saveButton, pressed && styles.pressed, isSubmitting && styles.disabled]}
            >
              {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.saveText}>Save to my ledger  ✦</Text>}
            </Pressable>
          </View>

          <View style={styles.tip}>
            <View style={styles.tipIcon}><Text>💡</Text></View>
            <Text style={styles.tipText}><Text style={styles.tipBold}>Need an overdue entry for the demo?</Text>{"\n"}Type any valid date before today.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: 20, paddingBottom: 40, maxWidth: 620, width: "100%", alignSelf: "center" },
  header: { flexDirection: "row", alignItems: "center" },
  backButton: { width: 45, height: 45, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  backText: { color: colors.ink, fontSize: 24, marginTop: -2 },
  headerCopy: { flex: 1, marginLeft: 13 },
  kicker: { color: colors.coral, fontSize: 9, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 27, fontWeight: "900", marginTop: 2 },
  emoji: { width: 50, height: 50, borderRadius: 18, backgroundColor: colors.yellowSoft, alignItems: "center", justifyContent: "center" },
  emojiText: { fontSize: 25 },
  intro: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 23, marginBottom: 19, maxWidth: 480 },
  card: { backgroundColor: colors.surface, borderRadius: 28, borderWidth: 1, borderColor: colors.border, padding: 20, ...shadow },
  label: { color: colors.muted, fontSize: 10, fontWeight: "900", letterSpacing: 1.1, marginBottom: 9 },
  fieldGap: { marginTop: 20 },
  input: { height: 56, borderRadius: 16, backgroundColor: "#F7F5FB", borderWidth: 1, borderColor: colors.border, color: colors.ink, paddingHorizontal: 16, fontSize: 16, fontWeight: "700" },
  amountRow: { flexDirection: "row", gap: 9 },
  currency: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.mintSoft, alignItems: "center", justifyContent: "center" },
  currencyText: { color: "#18825B", fontSize: 24, fontWeight: "900" },
  amountInput: { flex: 1, fontSize: 20 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.lavender },
  chipText: { color: colors.purpleDark, fontSize: 11, fontWeight: "800" },
  error: { color: colors.red, fontSize: 13, fontWeight: "600", marginTop: 14 },
  saveButton: { height: 57, borderRadius: 17, backgroundColor: colors.purple, alignItems: "center", justifyContent: "center", marginTop: 20 },
  saveText: { color: "white", fontSize: 15, fontWeight: "900" },
  tip: { flexDirection: "row", backgroundColor: colors.yellowSoft, borderRadius: 19, padding: 14, marginTop: 17, gap: 11, alignItems: "center" },
  tipIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: colors.yellow, alignItems: "center", justifyContent: "center" },
  tipText: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 17 },
  tipBold: { color: colors.ink, fontWeight: "800" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.65 },
});
