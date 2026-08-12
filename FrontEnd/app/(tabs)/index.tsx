import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const users = [
  { name: "Bob", status: "Offline" }
];
const router = useRouter();
export default function HomeScreen() {
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>HOME</Text>

        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.push("/(tabs)/settings")}
          >
          <FontAwesome6 name="gear" size={22} color="#333" />
          </TouchableOpacity>

            <View style={styles.searchBox}>
            <TextInput
              placeholder="Search"
              placeholderTextColor="#888"
              value={search}
              onChangeText={setSearch}
              style={styles.input}
            />
          <FontAwesome6
            name="magnifying-glass"
            size={18}
            color="#888"
          />
        </View>
      </View>

        {/* User List */}
        <View style={styles.userList}>
          {filteredUsers.map((user) => (
            <TouchableOpacity
              key={user.name}
              style={styles.userCard}
               onPress={() => {
                if (user.name === "Bob") {
                  router.push({
                  pathname: "/(tabs)/device",
                  params: {
                    name: user.name,
                    status: user.status
                  }
                });
                }
          }}
            >
              <View style={styles.left}>
                <Text style={styles.userName}>{user.name}</Text>
              </View>

              <View
                style={[
                  styles.status,
                  user.status === "Online"
                    ? styles.online
                    : user.status === "Offline"
                    ? styles.offline
                    : styles.away,
                ]}
              >
                <Text style={styles.statusText}>{user.status}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Navigation */}
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f3f3",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },

  title: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  iconBtn: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },

  searchBox: {
    flex: 1,
    marginLeft: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    paddingHorizontal: 15,
  },

  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },

  userList: {
    marginTop: 10,
  },

  userCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginBottom: 15,
    borderRadius: 15,
    backgroundColor: "#f7f7f7",
  },

  left: {
    flexDirection: "row"
  },

  userName: {
    fontSize: 18,
    fontWeight: "600",
  },

  status: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
  },

  statusText: {
    color: "white",
    fontWeight: "bold",
  },

  online: {
    backgroundColor: "green",
  },

  offline: {
    backgroundColor: "red",
  },

  away: {
    backgroundColor: "orange",
  }
});