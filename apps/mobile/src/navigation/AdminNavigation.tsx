import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { Home } from '@/screens/event';
import { EventDetails } from '@/screens/event';
import { Profile } from '@/screens/profile';
import { Contact } from '@/screens/profile';

// Telas específicas para administradores (serão criadas depois)
import { AdminDashboard } from '@/screens/admin';
import { UserManagement } from '@/screens/admin';
import { SystemAnalytics } from '@/screens/admin';
import { EventModeration } from '@/screens/admin';

export type AdminDrawerParamList = {
  HomeStack: undefined;
  AdminDashboard: undefined;
  UserManagement: undefined;
  SystemAnalytics: undefined;
  EventModeration: undefined;
  Profile: undefined;
  Contact: undefined;
};

const Drawer = createDrawerNavigator<AdminDrawerParamList>();
const Stack = createStackNavigator();

function HomeStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#F8FAFC' },
        gestureEnabled: false,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
        transitionSpec: {
          open: {
            animation: 'spring',
            config: {
              stiffness: 1000,
              damping: 500,
              mass: 3,
              overshootClamping: false,
              restDisplacementThreshold: 0.01,
              restSpeedThreshold: 0.01,
            },
          },
          close: {
            animation: 'spring',
            config: {
              stiffness: 1000,
              damping: 500,
              mass: 3,
              overshootClamping: false,
              restDisplacementThreshold: 0.01,
              restSpeedThreshold: 0.01,
            },
          },
        },
      }}
    >
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen 
        name="EventDetails" 
        component={EventDetails} 
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}

export default function AdminNavigation() {
  return (
    <Drawer.Navigator
      initialRouteName="AdminDashboard"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Drawer.Screen 
        name="AdminDashboard" 
        component={AdminDashboard} 
        options={{ 
          title: 'Dashboard Admin',
          drawerIcon: ({ color, size }) => (<Ionicons name="shield-outline" color={color} size={size} />),
        }} 
      />
      <Drawer.Screen 
        name="UserManagement" 
        component={UserManagement} 
        options={{ 
          title: 'Gestão de Usuários',
          drawerIcon: ({ color, size }) => (<Ionicons name="people-outline" color={color} size={size} />),
        }} 
      />
      <Drawer.Screen 
        name="EventModeration" 
        component={EventModeration} 
        options={{ 
          title: 'Moderação de Eventos',
          drawerIcon: ({ color, size }) => (<Ionicons name="checkmark-circle-outline" color={color} size={size} />),
        }} 
      />
      <Drawer.Screen 
        name="SystemAnalytics" 
        component={SystemAnalytics} 
        options={{ 
          title: 'Analytics do Sistema',
          drawerIcon: ({ color, size }) => (<Ionicons name="bar-chart-outline" color={color} size={size} />),
        }} 
      />
      <Drawer.Screen 
        name="Profile" 
        component={Profile} 
        options={{ 
          title: 'Perfil',
          drawerIcon: ({ color, size }) => (<Ionicons name="person-circle-outline" color={color} size={size} />),
        }} 
      />
      <Drawer.Screen 
        name="Contact" 
        component={Contact} 
        options={{ 
          title: 'Contato',
          drawerIcon: ({ color, size }) => (<Ionicons name="chatbubbles-outline" color={color} size={size} />),
        }} 
      />
    </Drawer.Navigator>
  );
}
