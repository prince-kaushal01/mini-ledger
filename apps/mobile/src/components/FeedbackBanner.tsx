import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

interface Props {
  message: string;
  tone: "success" | "error";
  onDismiss: () => void;
}

export function FeedbackBanner({ message, tone, onDismiss }: Props) {
  const isSuccess = tone === "success";

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.banner, { backgroundColor: isSuccess ? colors.mintSoft : colors.redSoft }]}
    >
      <View style={[styles.icon, { backgroundColor: isSuccess ? colors.mint : colors.red }]}>
        <Text style={styles.iconText}>{isSuccess ? "✓" : "!"}</Text>
      </View>
      <Text style={[styles.message, { color: isSuccess ? "#176B4E" : colors.red }]}>{message}</Text>
      <Pressable accessibilityLabel="Dismiss message" accessibilityRole="button" onPress={onDismiss} style={styles.close}>
        <Text style={styles.closeText}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 17,
    padding: 11,
    gap: 10,
    marginBottom: 16,
  },
  icon: { width: 28, height: 28, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  iconText: { color: "white", fontSize: 14, fontWeight: "900" },
  message: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: "700" },
  close: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  closeText: { color: colors.muted, fontSize: 21, lineHeight: 23 },
});
