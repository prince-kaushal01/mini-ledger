import { useCallback, useEffect, useState } from "react";
import { Redirect, router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
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
import { ConfirmModal } from "../src/components/ConfirmModal";
import { FeedbackBanner } from "../src/components/FeedbackBanner";
import { LoanItem } from "../src/components/LoanItem";
import { ScreenBackground } from "../src/components/ScreenBackground";
import { SummaryCard } from "../src/components/SummaryCard";
import { formatCurrency } from "../src/format";
import { colors, shadow } from "../src/theme";

export default function HomeScreen() {
  const { token, signOut } = useAuth();
  const { notice } = useLocalSearchParams<{ notice?: string }>();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [repayTarget, setRepayTarget] = useState<Loan | null>(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; tone: "success" | "error" } | null>(null);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (refreshing = false, announce = false) => {
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
      setLastUpdated(new Date());
      if (announce) {
        setFeedback({ message: "Your ledger is up to date.", tone: "success" });
      }
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Could not load your ledger";
      setError(message);
      if (refreshing) {
        setFeedback({ message, tone: "error" });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => {
    void loadDashboard();
  }, [loadDashboard]));

  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(null), 3500);
    return () => clearTimeout(timeout);
  }, [feedback]);

  useEffect(() => {
    if (notice !== "loan-added") return;
    setFeedback({ message: "Loan added to your ledger.", tone: "success" });
    router.setParams({ notice: undefined });
  }, [notice]);

  if (!token) return <Redirect href="/login" />;

  async function handleRepayment() {
    if (!repayTarget) return;

    const loan = repayTarget;
    setUpdatingId(loan.id);
    try {
      await api.markRepaid(token!, loan.id);
      setRepayTarget(null);
      setFeedback({ message: `${loan.friendName}'s loan was marked as repaid.`, tone: "success" });
      await loadDashboard(true);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Could not update the loan";
      setError(message);
      setFeedback({ message, tone: "error" });
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
      setIsLogoutOpen(false);
      router.replace("/login");
    } catch {
      setFeedback({ message: "Could not log out. Please try again.", tone: "error" });
    } finally {
      setIsSigningOut(false);
    }
  }

  const header = (
    <View>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.kicker}>YOUR MONEY, YOUR PEACE</Text>
          <Text style={styles.heading}>Hey there! <Text style={styles.wave}>👋</Text></Text>
        </View>
        <Pressable
          accessibilityLabel="Log out of MiniLedger"
          accessibilityRole="button"
          onPress={() => setIsLogoutOpen(true)}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      {feedback && (
        <FeedbackBanner
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
          tone={feedback.tone}
        />
      )}

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
        <View style={styles.sectionActions}>
          {lastUpdated && (
            <Text style={styles.updatedText}>
              Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
          )}
          <Pressable
            accessibilityLabel="Refresh loans and summary"
            accessibilityRole="button"
            disabled={isRefreshing}
            onPress={() => void loadDashboard(true, true)}
            style={({ pressed }) => [styles.refreshButton, pressed && styles.pressed, isRefreshing && styles.disabled]}
          >
            {isRefreshing
              ? <ActivityIndicator color={colors.purple} size="small" />
              : <Text style={styles.refreshText}>↻ Refresh</Text>}
          </Pressable>
        </View>
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
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadDashboard(true, true)} tintColor={colors.purple} />}
        renderItem={({ item }) => (
          <LoanItem loan={item} isUpdating={updatingId === item.id} onRepay={setRepayTarget} />
        )}
      />

      <ConfirmModal
        confirmLabel="Yes, mark repaid"
        description={repayTarget
          ? `Confirm that ${repayTarget.friendName} returned ${formatCurrency(repayTarget.amount)}. This will update every summary total.`
          : ""}
        isLoading={Boolean(repayTarget && updatingId === repayTarget.id)}
        onCancel={() => setRepayTarget(null)}
        onConfirm={() => void handleRepayment()}
        title="Money returned?"
        visible={Boolean(repayTarget)}
      />

      <ConfirmModal
        confirmLabel="Logout"
        description="You will return to the phone login screen. Your loans remain safely stored in the database."
        isLoading={isSigningOut}
        onCancel={() => setIsLogoutOpen(false)}
        onConfirm={() => void handleSignOut()}
        title="Log out of MiniLedger?"
        tone="danger"
        visible={isLogoutOpen}
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
  logoutButton: { height: 44, borderRadius: 15, backgroundColor: colors.coralSoft, borderWidth: 1, borderColor: "#FFD1C4", paddingHorizontal: 15, alignItems: "center", justifyContent: "center", ...shadow, shadowOpacity: 0.05 },
  logoutText: { color: colors.coral, fontSize: 12, fontWeight: "900" },
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
  sectionActions: { alignItems: "flex-end", gap: 6 },
  updatedText: { color: colors.muted, fontSize: 9, fontWeight: "600" },
  refreshButton: { minWidth: 92, height: 36, borderRadius: 12, backgroundColor: colors.lavender, alignItems: "center", justifyContent: "center", paddingHorizontal: 11 },
  refreshText: { color: colors.purpleDark, fontSize: 11, fontWeight: "900" },
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
  disabled: { opacity: 0.6 },
});
