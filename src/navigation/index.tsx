import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import Home from '@/screens/Home';
import EventDetails from '@/screens/EventDetails';
import Purchase from '@/screens/Purchase';
import TicketSuccess from '@/screens/TicketSuccess';
import MyTickets from '../screens/MyTickets';
import ValidateTicket from '../screens/ValidateTicket';
import Contact from '../screens/Contact';

export type RootStackParamList = {
  Home: undefined;
  EventDetails: { id: string };
  Purchase: { eventId: string };
  TicketSuccess: { qrCode: string };
};

export type RootDrawerParamList = {
  HomeStack: undefined;
  MyTickets: undefined;
  ValidateTicket: undefined;
  Contact: undefined;
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
      }}
    >
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="EventDetails" component={EventDetails} />
      <Stack.Screen name="Purchase" component={Purchase} />
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
        <Drawer.Screen name="HomeStack" component={HomeStackNavigator} options={{ title: 'Início' }} />
        <Drawer.Screen name="MyTickets" component={MyTickets} options={{ title: 'Meus Ingressos' }} />
        <Drawer.Screen name="ValidateTicket" component={ValidateTicket} options={{ title: 'Validar Ingresso' }} />
        <Drawer.Screen name="Contact" component={Contact} options={{ title: 'Contato' }} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
