import { useCallback, useState } from "react";
import { Redirect, router, useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, type Loan, type Summary } from "../src/api";
import { useAuth } from "../src/auth-context";
import { LoanItem } from "../src/components/LoanItem";
import { ScreenBackground } from "../src/components/ScreenBackground";
import { SummaryCard } from "../src/components/SummaryCard";
import { colors, shadow } from "../src/theme";

export default function HomeScreen() {
  const { token, signOut } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (refreshing = false) => {
    if (!token) return;
    refreshing ? setIsRefreshing(true) : setIsLoading(true);
    setError("");
    try {
      const [loanResponse, summaryResponse] = await Promise.all([
        api.getLoans(token),
        api.getSummary(token),
      ]);
      setLoans(loanResponse.loans);
      setSummary(summaryResponse.summary);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load your ledger");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => {
    void loadDashboard();
  }, [loadDashboard]));

  if (!token) return <Redirect href="/login" />;

  function confirmRepayment(loan: Loan) {
    Alert.alert(
      "Money returned?",
      `Mark ${loan.friendName}'s loan as fully repaid?`,
      [
        { text: "Not yet", style: "cancel" },
        {
          text: "Yes, settled",
          onPress: async () => {
            setUpdatingId(loan.id);
            try {
              await api.markRepaid(token!, loan.id);
              await loadDashboard(true);
            } catch (requestError) {
              setError(requestError instanceof Error ? requestError.message : "Could not update the loan");
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ],
    );
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  const header = (
    <View>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.kicker}>YOUR MONEY, YOUR PEACE</Text>
          <Text style={styles.heading}>Hey there! <Text style={styles.wave}>👋</Text></Text>
        </View>
        <Pressable accessibilityLabel="Sign out" onPress={handleSignOut} style={styles.profileButton}>
          <Text style={styles.profileText}>↗</Text>
        </Pressable>
      </View>

      {summary && <SummaryCard summary={summary} />}

      <Pressable onPress={() => router.push("/add-loan")} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
        <View style={styles.plusCircle}><Text style={styles.plus}>＋</Text></View>
        <View style={styles.addCopy}>
          <Text style={styles.addTitle}>Lent something?</Text>
          <Text style={styles.addSubtitle}>Add it before it slips your mind</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
      </Pressable>

      <View style={styles.sectionRow}>
        <View>
          <Text style={styles.sectionTitle}>Your circle</Text>
          <Text style={styles.sectionSubtitle}>{loans.length} {loans.length === 1 ? "entry" : "entries"} in your ledger</Text>
        </View>
        <View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>UP TO DATE</Text></View>
      </View>

      {!!error && (
        <Pressable onPress={() => loadDashboard()} style={styles.errorCard}>
          <Text style={styles.errorTitle}>Couldn’t refresh the ledger</Text>
          <Text style={styles.errorText}>{error} · Tap to retry</Text>
        </Pressable>
      )}
    </View>
  );

  if (isLoading && !summary) {
    return (
      <SafeAreaView style={styles.center}>
        <ScreenBackground />
        <ActivityIndicator color={colors.purple} size="large" />
        <Text style={styles.loadingText}>Opening your ledger…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScreenBackground />
      <FlatList
        contentContainerStyle={styles.list}
        data={loans}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyEmoji}><Text style={styles.emptyEmojiText}>🌱</Text></View>
            <Text style={styles.emptyTitle}>A fresh ledger</Text>
            <Text style={styles.emptyText}>Your first friendly loan will appear here. Tap the colourful card above to add one.</Text>
          </View>
        }
        ListHeaderComponent={header}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadDashboard(true)} tintColor={colors.purple} />}
        renderItem={({ item }) => (
          <LoanItem loan={item} isUpdating={updatingId === item.id} onRepay={confirmRepayment} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  loadingText: { color: colors.muted, marginTop: 14, fontWeight: "700" },
  list: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 42, maxWidth: 720, width: "100%", alignSelf: "center" },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 22 },
  kicker: { color: colors.purple, fontSize: 10, fontWeight: "900", letterSpacing: 1.3 },
  heading: { color: colors.ink, fontSize: 29, fontWeight: "900", marginTop: 4, letterSpacing: -0.7 },
  wave: { fontSize: 25 },
  profileButton: { width: 46, height: 46, borderRadius: 17, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", ...shadow, shadowOpacity: 0.06 },
  profileText: { color: colors.coral, fontSize: 23, fontWeight: "900", transform: [{ rotate: "45deg" }] },
  addButton: { flexDirection: "row", alignItems: "center", marginTop: 18, padding: 15, borderRadius: 22, backgroundColor: colors.yellowSoft, borderWidth: 1, borderColor: "#F5E8A8" },
  plusCircle: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.yellow, alignItems: "center", justifyContent: "center" },
  plus: { color: colors.ink, fontSize: 25, fontWeight: "600", marginTop: -2 },
  addCopy: { flex: 1, marginLeft: 12 },
  addTitle: { color: colors.ink, fontSize: 15, fontWeight: "900" },
  addSubtitle: { color: colors.muted, fontSize: 11, marginTop: 3 },
  arrow: { color: colors.ink, fontSize: 22, marginRight: 4 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 31, marginBottom: 15 },
  sectionTitle: { color: colors.ink, fontSize: 21, fontWeight: "900" },
  sectionSubtitle: { color: colors.muted, fontSize: 12, marginTop: 3 },
  livePill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: colors.mintSoft, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.mint },
  liveText: { color: "#18825B", fontSize: 8, fontWeight: "900", letterSpacing: 0.5 },
  separator: { height: 12 },
  empty: { backgroundColor: colors.surface, borderRadius: 25, padding: 30, alignItems: "center", borderWidth: 1, borderColor: colors.border },
  emptyEmoji: { width: 64, height: 64, borderRadius: 24, backgroundColor: colors.mintSoft, alignItems: "center", justifyContent: "center" },
  emptyEmojiText: { fontSize: 31 },
  emptyTitle: { color: colors.ink, fontSize: 19, fontWeight: "900", marginTop: 15 },
  emptyText: { color: colors.muted, textAlign: "center", lineHeight: 20, fontSize: 13, marginTop: 7, maxWidth: 290 },
  errorCard: { backgroundColor: colors.redSoft, borderRadius: 16, padding: 13, marginBottom: 12 },
  errorTitle: { color: colors.red, fontSize: 13, fontWeight: "900" },
  errorText: { color: colors.red, fontSize: 11, marginTop: 2 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
});
