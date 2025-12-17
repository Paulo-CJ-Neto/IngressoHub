import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { Home } from '@/screens/event';
import { EventDetails } from '@/screens/event';
import { Profile } from '@/screens/profile';
import { Contact } from '@/screens/profile';
import { Purchase } from '@/screens/payment';

import { CreateEvent } from '@/screens/event';
import { ProducerValidateTicket } from '@/screens/ticket';
import { ProducerMyEvents } from '@/screens/producer';
import { EditEvent } from '@/screens/event';

export type ProducerDrawerParamList = {
  HomeStack: undefined;
  ProducerValidateTicket: undefined;
  CreateEvent: undefined;
  MyEventsStack: undefined;
  Profile: undefined;
  Contact: undefined;
  Purchase: undefined;
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
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
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
        options={{ 
          gestureEnabled: true,
          gestureDirection: 'horizontal',
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
        }}
      />
      <Stack.Screen
        name="Purchase"
        component={Purchase}
        options={{ 
          gestureEnabled: true,
          gestureDirection: 'horizontal',
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
        }}
      />
    </Stack.Navigator>
  );
}

function MyEventsStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="ProducerMyEvents"
      screenOptions={{ 
        headerShown: false, 
        cardStyle: { backgroundColor: '#F8FAFC' }, 
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
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
      {/* @ts-ignore */}
      <Stack.Screen name="ProducerMyEvents" component={ProducerMyEvents} />
      {/* @ts-ignore */}
      <Stack.Screen 
        name="EditEvent" 
        component={EditEvent}
        options={{
          gestureEnabled: true,
          gestureDirection: 'horizontal',
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
        }}
      />
    </Stack.Navigator>
  );
}

export default function ProducerNavigation() {
  return (
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
        name="MyEventsStack"
        component={MyEventsStackNavigator}
        options={{
          title: 'Meus Eventos',
          drawerIcon: ({ color, size }) => (<Ionicons name="albums-outline" color={color} size={size} />),
        }}
      />
      <Drawer.Screen
        name="ProducerValidateTicket"
        component={ProducerValidateTicket}
        options={{
          title: 'Validar Ingresso',
          drawerIcon: ({ color, size }) => (<Ionicons name="qr-code-outline" color={color} size={size} />),
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
