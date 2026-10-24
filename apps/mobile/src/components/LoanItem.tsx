import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { Loan } from "../api";
import { formatCurrency, formatDate } from "../format";
import { colors, shadow } from "../theme";

interface Props {
  loan: Loan;
  isUpdating: boolean;
  onRepay: (loan: Loan) => void;
}

export function LoanItem({ loan, isUpdating, onRepay }: Props) {
  const accent = loan.isRepaid ? colors.mint : loan.isOverdue ? colors.red : colors.purple;
  const soft = loan.isRepaid ? colors.mintSoft : loan.isOverdue ? colors.redSoft : colors.lavender;
  const status = loan.isRepaid ? "REPAID" : loan.isOverdue ? "OVERDUE" : "ACTIVE";

  return (
    <View style={[styles.card, loan.isOverdue && styles.overdueCard]}>
      <View style={[styles.avatar, { backgroundColor: soft }]}>
        <Text style={[styles.avatarText, { color: accent }]}>{loan.friendName.charAt(0).toUpperCase()}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.name}>{loan.friendName}</Text>
          <Text style={styles.amount}>{formatCurrency(loan.amount)}</Text>
        </View>
        <View style={styles.metaRow}>
          <View style={[styles.badge, { backgroundColor: soft }]}>
            <Text style={[styles.badgeText, { color: accent }]}>{status}</Text>
          </View>
          <Text style={styles.date}>{loan.isRepaid ? "Settled" : "Due"} {formatDate(loan.dueDate)}</Text>
        </View>

        {!loan.isRepaid && (
          <Pressable
            disabled={isUpdating}
            onPress={() => onRepay(loan)}
            style={({ pressed }) => [styles.repayButton, pressed && styles.pressed]}
          >
            {isUpdating ? <ActivityIndicator color={colors.purple} /> : <Text style={styles.repayText}>✓ Mark as repaid</Text>}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 13,
    ...shadow,
    shadowOpacity: 0.07,
  },
  overdueCard: { borderColor: "#FFC8D1", backgroundColor: "#FFFBFC" },
  avatar: { width: 48, height: 48, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 20, fontWeight: "900" },
  content: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", gap: 8, alignItems: "center" },
  name: { color: colors.ink, fontSize: 17, fontWeight: "800", flex: 1 },
  amount: { color: colors.ink, fontSize: 17, fontWeight: "900" },
  metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 8 },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  date: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  repayButton: {
    alignSelf: "flex-start",
    marginTop: 13,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: colors.lavender,
    minWidth: 130,
    alignItems: "center",
  },
  repayText: { color: colors.purpleDark, fontSize: 12, fontWeight: "800" },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
});
