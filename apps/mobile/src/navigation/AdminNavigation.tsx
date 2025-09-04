import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import Home from '@/screens/Home';
import EventDetails from '@/screens/EventDetails';
import Profile from '@/screens/Profile';
import Contact from '@/screens/Contact';

// Telas específicas para administradores (serão criadas depois)
import AdminDashboard from '@/screens/AdminDashboard';
import UserManagement from '@/screens/UserManagement';
import SystemAnalytics from '@/screens/SystemAnalytics';
import EventModeration from '@/screens/EventModeration';

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
