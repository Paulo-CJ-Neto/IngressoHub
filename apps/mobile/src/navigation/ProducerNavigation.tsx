import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import Home from '@/screens/Home';
import EventDetails from '@/screens/EventDetails';
import Profile from '@/screens/Profile';
import Contact from '@/screens/Contact';

// Telas específicas para produtores (serão criadas depois)
import ProducerDashboard from '@/screens/ProducerDashboard';
import ManageEvents from '@/screens/ManageEvents';
import CreateEvent from '@/screens/CreateEvent';
import EventAnalytics from '@/screens/EventAnalytics';

export type ProducerDrawerParamList = {
  HomeStack: undefined;
  ProducerDashboard: undefined;
  ManageEvents: undefined;
  CreateEvent: undefined;
  EventAnalytics: undefined;
  Profile: undefined;
  Contact: undefined;
};

const Drawer = createDrawerNavigator<ProducerDrawerParamList>();
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

export default function ProducerNavigation() {
  return (
    <Drawer.Navigator
      initialRouteName="ProducerDashboard"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Drawer.Screen 
        name="ProducerDashboard" 
        component={ProducerDashboard} 
        options={{ 
          title: 'Dashboard',
          drawerIcon: ({ color, size }) => (<Ionicons name="grid-outline" color={color} size={size} />),
        }} 
      />
      <Drawer.Screen 
        name="ManageEvents" 
        component={ManageEvents} 
        options={{ 
          title: 'Gerenciar Eventos',
          drawerIcon: ({ color, size }) => (<Ionicons name="calendar-outline" color={color} size={size} />),
        }} 
      />
      <Drawer.Screen 
        name="CreateEvent" 
        component={CreateEvent} 
        options={{ 
          title: 'Criar Evento',
          drawerIcon: ({ color, size }) => (<Ionicons name="add-circle-outline" color={color} size={size} />),
        }} 
      />
      <Drawer.Screen 
        name="EventAnalytics" 
        component={EventAnalytics} 
        options={{ 
          title: 'Analytics',
          drawerIcon: ({ color, size }) => (<Ionicons name="analytics-outline" color={color} size={size} />),
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
