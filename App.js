import { StyleSheet, View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import ClassSchedule from "./screens/Home/ClassSchedule";
import EditScheduleWeekly from "./screens/Admin/EditScheduleWeekly";
import { loginUser } from "./util/auth";
import { authCredentials } from "./secrets";

const Stack = createNativeStackNavigator();

function AuthenticatedStack() {
  const BottomTab = createBottomTabNavigator();

  const BottomTabNavigator = () => {
    return (
      <BottomTab.Navigator
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: "#000000",
          tabBarInactiveTintColor: "#666666",
        }}
      >
        <BottomTab.Screen
          name="ClassSchedule"
          component={ClassSchedule}
          options={{
            headerShown: false,
            tabBarLabel: "Schedule",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
          }}
        />
        <BottomTab.Screen
          name="EditScheduleWeekly"
          component={EditScheduleWeekly}
          options={{
            headerShown: false,
            tabBarLabel: "Edit Schedule",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="create-outline" size={size} color={color} />
            ),
          }}
        />
      </BottomTab.Navigator>
    );
  };

  return (
    <>
      <StatusBar style="auto" />
      <Stack.Navigator
        screenOptions={{
          headerTitleStyle: {
            fontSize: 30,
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={BottomTabNavigator}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </>
  );
}

function Navigation() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-login on app start
  useEffect(() => {
    const autoLogin = async () => {
      try {
        // Credentials are loaded from secrets.js (gitignored)
        await loginUser(authCredentials.email, authCredentials.password);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auto-login failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    autoLogin();
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated && <AuthenticatedStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <Navigation />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 65,
    paddingBottom: 10,
    paddingTop: 5,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
});
