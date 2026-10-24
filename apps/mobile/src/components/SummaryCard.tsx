import { StyleSheet, Text, View } from "react-native";
import type { Summary } from "../api";
import { formatCurrency } from "../format";
import { colors, shadow } from "../theme";

interface Props {
  summary: Summary;
}

function MiniStat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <View style={styles.stat}>
      <View style={[styles.dot, { backgroundColor: tone }]} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text numberOfLines={1} adjustsFontSizeToFit style={styles.statValue}>
        {formatCurrency(value)}
      </Text>
    </View>
  );
}

export function SummaryCard({ summary }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>STILL WITH FRIENDS</Text>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.total}>
            {formatCurrency(summary.outstanding)}
          </Text>
        </View>
        <View style={styles.sparkle}><Text style={styles.sparkleText}>✦</Text></View>
      </View>

      <View style={styles.divider} />
      <View style={styles.statRow}>
        <MiniStat label="Lent" value={summary.totalLent} tone={colors.yellow} />
        <MiniStat label="Repaid" value={summary.totalRepaid} tone={colors.mint} />
        <MiniStat label="Overdue" value={summary.overdueAmount} tone={colors.coral} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.purple,
    borderRadius: 30,
    padding: 24,
    overflow: "hidden",
    ...shadow,
  },
  glowOne: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.10)",
    right: -45,
    top: -70,
  },
  glowTwo: {
    position: "absolute",
    width: 95,
    height: 95,
    borderRadius: 50,
    backgroundColor: "rgba(255,209,102,0.18)",
    left: -30,
    bottom: -50,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eyebrow: { color: "rgba(255,255,255,0.72)", fontSize: 11, fontWeight: "800", letterSpacing: 1.4 },
  total: { color: "white", fontSize: 34, fontWeight: "900", marginTop: 6, maxWidth: 250 },
  sparkle: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  sparkleText: { color: colors.yellow, fontSize: 24 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.18)", marginVertical: 20 },
  statRow: { flexDirection: "row", gap: 8 },
  stat: { flex: 1, minWidth: 0 },
  dot: { width: 8, height: 8, borderRadius: 4, marginBottom: 6 },
  statLabel: { color: "rgba(255,255,255,0.68)", fontSize: 11, fontWeight: "700" },
  statValue: { color: "white", fontSize: 15, fontWeight: "800", marginTop: 3 },
});
