import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function SettingsScreen() {
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [locationServices, setLocationServices] = useState(true);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: darkMode ? "#121212" : "#F3F3F3",
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome6
            name="arrow-left"
            size={22}
            color={darkMode ? "#FFF" : "#333"}
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.title,
            { color: darkMode ? "#FFF" : "#222" },
          ]}
        >
          Settings
        </Text>

        <View style={{ width: 22 }} />
      </View>

      {/* Settings Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: darkMode ? "#1E1E1E" : "#FFF",
          },
        ]}
      >
        <SettingItem
          title="Dark Mode"
          value={darkMode}
          onValueChange={setDarkMode}
          dark={darkMode}
        />

        <SettingItem
          title="Notifications"
          value={notifications}
          onValueChange={setNotifications}
          dark={darkMode}
        />

        <SettingItem
          title="Auto Refresh"
          value={autoRefresh}
          onValueChange={setAutoRefresh}
          dark={darkMode}
        />

        <SettingItem
          title="Location Services"
          value={locationServices}
          onValueChange={setLocationServices}
          dark={darkMode}
        />

        <View
          style={[
            styles.divider,
            {
              backgroundColor: darkMode ? "#444" : "#DDD",
            },
          ]}
        />

        <Text
          style={[
            styles.aboutTitle,
            {
              color: darkMode ? "#FFF" : "#222",
            },
          ]}
        >
          About
        </Text>

        <Text
          style={[
            styles.aboutText,
            {
              color: darkMode ? "#CCC" : "#666",
            },
          ]}
        >
          App Name: Version X
        </Text>

        <Text
          style={[
            styles.aboutText,
            {
              color: darkMode ? "#CCC" : "#666",
            },
          ]}
        >
          Version: 1.0.0
        </Text>
      </View>

      <Text
        style={[
          styles.footer,
          {
            color: darkMode ? "#888" : "#777",
          },
        ]}
      >
        © 2026 Version X
      </Text>
    </View>
  );
}

function SettingItem({
  title,
  value,
  onValueChange,
  dark,
}: {
  title: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  dark: boolean;
}) {
  return (
    <View style={styles.settingRow}>
      <Text
        style={[
          styles.settingText,
          {
            color: dark ? "#FFF" : "#222",
          },
        ]}
      >
        {title}
      </Text>

      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  header: {
    marginTop: 55,
    marginBottom: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
  },

  card: {
    borderRadius: 18,
    padding: 20,
    elevation: 5,
  },

  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
  },

  settingText: {
    fontSize: 18,
    fontWeight: "500",
  },

  divider: {
    height: 1,
    marginVertical: 20,
  },

  aboutTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },

  aboutText: {
    fontSize: 16,
    marginBottom: 6,
  },

  footer: {
    textAlign: "center",
    marginTop: 25,
    fontSize: 14,
  },
});