import { FontAwesome6 } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type StatusColor = "green" | "red" | "amber" | "neutral";

const colors = {
  green: "#E4F5E8",
  red: "#FBE7E7",
  amber: "#FDF3D9",
  neutral: "#F1F2F4",
};

const textColors = {
  green: "#1F6B34",
  red: "#A32E2E",
  amber: "#8A6D1D",
  neutral: "#444",
};

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: StatusColor;
}) {
  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: colors[color],
        },
      ]}
    >
      <Text
        style={[
          styles.statText,
          {
            color: textColors[color],
          },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.statValue,
          {
            color: textColors[color],
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export default function DeviceScreen() {
  const router = useRouter();

  const { name, status } = useLocalSearchParams<{
    name: string;
    status: string;
  }>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome6
            name="arrow-left"
            size={22}
            color="#333"
          />
        </TouchableOpacity>

        <Text style={styles.title}>{name}</Text>

        <View style={{ width: 22 }} />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.deviceTitle}>Device 1</Text>

        <Text style={styles.battery}>Battery: 90%</Text>

        <Text
          style={[
            styles.status,
            {
              color:
                status === "Online"
                  ? "green"
                  : status === "Offline"
                  ? "red"
                  : "orange",
            },
          ]}
        >
          Status: {status}
        </Text>
      </View>

      <View style={styles.grid}>
        <StatCard title="Condition" value="Average" color="amber" />

        <StatCard title="Pulse" value="80 BPM" color="green" />

        <StatCard title="Temperature" value="25°C" color="green" />

        <StatCard title="Humidity" value="80%" color="red" />

        <StatCard title="Air Quality" value="Good" color="green" />

        <StatCard title="Acceleration" value="5 m/s²" color="neutral" />

        <StatCard title="Gyroscope" value="40°" color="neutral" />

        <StatCard title="Location" value="Unknown" color="neutral" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 50,
    marginBottom: 25,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
  },

  infoCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
  },

  deviceTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },

  battery: {
    fontSize: 17,
    marginTop: 8,
  },

  status: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  statCard: {
    width: "48%",
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
  },

  statText: {
    fontSize: 14,
    fontWeight: "600",
  },

  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
});