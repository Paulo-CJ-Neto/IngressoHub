import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

import Home from '@/screens/Home';
import EventDetails from '@/screens/EventDetails';
import Purchase from '@/screens/Purchase';
import TicketSuccess from '@/screens/TicketSuccess';
import MyTickets from '@/screens/MyTickets';
import ValidateTicket from '@/screens/ValidateTicket';
import Contact from '@/screens/Contact';
import Login from '@/screens/Login';
import Register from '@/screens/Register';
import Profile from '@/screens/Profile';
import PixPayment from '@/screens/PixPayment';

export type RootStackParamList = {
  Home: undefined;
  EventDetails: { id: string };
  Purchase: { eventId: string };
  TicketSuccess: { qrCode: string };
  PixPayment: { 
    qrCode: string, 
    pixCode: string, 
    amount: number, 
    eventName: string,
  };
};

export type RootDrawerParamList = {
  HomeStack: undefined;
  MyTickets: undefined;
  ValidateTicket: undefined;
  Contact: undefined;
  Login: undefined;
  Register: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<RootDrawerParamList>();

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
        <Stack.Screen 
          name="Purchase" 
          component={Purchase} 
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen 
          name="PixPayment" 
          component={PixPayment} 
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="TicketSuccess" component={TicketSuccess} />
      </Stack.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="HomeStack"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Drawer.Screen 
          name="HomeStack" 
          component={HomeStackNavigator} 
          options={{ 
            title: 'Início',
            drawerIcon: ({ color, size }) => (<Ionicons name="home-outline" color={color} size={size} />),
          }} 
        />
        <Drawer.Screen 
          name="MyTickets" 
          component={MyTickets} 
          options={{ 
            title: 'Meus Ingressos',
            drawerIcon: ({ color, size }) => (<Ionicons name="ticket-outline" color={color} size={size} />),
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
          name="ValidateTicket" 
          component={ValidateTicket} 
          options={{ 
            title: 'Validar Ingresso',
            drawerIcon: ({ color, size }) => (<Ionicons name="qr-code-outline" color={color} size={size} />),
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
        <Drawer.Screen 
          name="Login" 
          component={Login} 
          options={{ 
            title: 'Login', 
            drawerItemStyle: { display: 'none' },
            drawerIcon: ({ color, size }) => (<Ionicons name="log-in-outline" color={color} size={size} />),
          }} 
        />
        <Drawer.Screen 
          name="Register" 
          component={Register} 
          options={{ 
            title: 'Cadastro', 
            drawerItemStyle: { display: 'none' },
            drawerIcon: ({ color, size }) => (<Ionicons name="person-add-outline" color={color} size={size} />),
          }} 
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
