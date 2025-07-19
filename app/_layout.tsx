import "../global.css";

import { Slot } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AuthProvider } from "../contexts/AuthContext";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
          <StatusBar style="light" /> {/* Recommended for consistent status bar theme */}
          <Slot /> {/* Automatically renders routes */}
        </SafeAreaView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
