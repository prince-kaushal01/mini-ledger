import { StyleSheet, View } from "react-native";
import { colors } from "../theme";

export function ScreenBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.blob, styles.purpleBlob]} />
      <View style={[styles.blob, styles.yellowBlob]} />
      <View style={[styles.blob, styles.coralBlob]} />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.55,
  },
  purpleBlob: {
    width: 260,
    height: 260,
    backgroundColor: colors.lavender,
    top: -100,
    right: -100,
  },
  yellowBlob: {
    width: 170,
    height: 170,
    backgroundColor: colors.yellowSoft,
    top: 300,
    left: -100,
  },
  coralBlob: {
    width: 200,
    height: 200,
    backgroundColor: colors.coralSoft,
    bottom: -100,
    right: -80,
  },
});
