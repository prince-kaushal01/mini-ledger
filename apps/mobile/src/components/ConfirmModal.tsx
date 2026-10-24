import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, shadow } from "../theme";

interface Props {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({
  visible,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "primary",
  isLoading = false,
  onCancel,
  onConfirm,
}: Props) {
  const confirmColor = tone === "danger" ? colors.red : colors.purple;

  return (
    <Modal
      animationType="fade"
      onRequestClose={isLoading ? undefined : onCancel}
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="Close confirmation"
          disabled={isLoading}
          onPress={onCancel}
          style={StyleSheet.absoluteFill}
        />
        <View accessibilityViewIsModal style={styles.card}>
          <View style={[styles.icon, { backgroundColor: tone === "danger" ? colors.redSoft : colors.lavender }]}>
            <Text style={styles.iconText}>{tone === "danger" ? "↗" : "✓"}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={isLoading}
              onPress={onCancel}
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={isLoading}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.confirmButton,
                { backgroundColor: confirmColor },
                pressed && styles.pressed,
                isLoading && styles.disabled,
              ]}
            >
              {isLoading
                ? <ActivityIndicator color="white" />
                : <Text style={styles.confirmText}>{confirmLabel}</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(25, 20, 45, 0.68)",
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
    ...shadow,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { color: colors.purpleDark, fontSize: 22, fontWeight: "900" },
  title: { color: colors.ink, fontSize: 22, fontWeight: "900", marginTop: 16 },
  description: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
  actions: { flexDirection: "row", gap: 10, marginTop: 23 },
  cancelButton: {
    flex: 1,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  confirmButton: { flex: 1.4, height: 50, alignItems: "center", justifyContent: "center", borderRadius: 15 },
  cancelText: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  confirmText: { color: "white", fontSize: 13, fontWeight: "900" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.65 },
});
