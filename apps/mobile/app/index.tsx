import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../src/auth-context";
import { ScreenBackground } from "../src/components/ScreenBackground";
import { colors } from "../src/theme";

export default function IndexScreen() {
  const { token, isLoading } = useAuth();

  if (!isLoading) {
    return <Redirect href={token ? "/home" : "/login"} />;
  }

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <View style={styles.logo}><Text style={styles.logoText}>₹</Text></View>
      <Text style={styles.name}>MiniLedger</Text>
      <ActivityIndicator color={colors.purple} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  logo: { width: 78, height: 78, borderRadius: 28, backgroundColor: colors.purple, alignItems: "center", justifyContent: "center" },
  logoText: { color: "white", fontSize: 38, fontWeight: "900" },
  name: { marginTop: 18, color: colors.ink, fontSize: 26, fontWeight: "900" },
  spinner: { marginTop: 24 },
});
