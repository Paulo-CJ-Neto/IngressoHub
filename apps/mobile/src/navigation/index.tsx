import React from 'react';
import { NavigationContainer, useNavigation, useFocusEffect } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators, StackNavigationProp } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';

import { Home } from '@/screens/event';
import { EventDetails } from '@/screens/event';
import { Purchase } from '@/screens/payment';
import { TicketSuccess } from '@/screens/ticket';
import { MyTickets } from '@/screens/ticket';
import { ValidateTicket } from '@/screens/ticket';
import { Contact } from '@/screens/profile';
import { Login } from '@/screens/auth';
import { Register } from '@/screens/auth';
import { EmailVerification } from '@/screens/auth';
import { Profile } from '@/screens/profile';
import { PixPayment } from '@/screens/payment';

// Navegações específicas por tipo de usuário
import ProducerNavigation from './ProducerNavigation';
import AdminNavigation from './AdminNavigation';

export type RootStackParamList = {
  Home: undefined;
  EventDetails: { id: string };
  Purchase: { eventId: string };
  TicketSuccess: { 
    qrCode?: string;
    ticketId?: string;
    ticket?: any;
    paymentApproved?: boolean;
  };
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
  Contact: undefined;
  Login: undefined;
  Register: undefined;
  EmailVerification: { email: string; fullName: string };
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
      <Stack.Screen
        name="PixPayment"
        component={PixPayment}
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
        name="TicketSuccess"
        component={TicketSuccess}
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

export default function Navigation() {
  const { user, isClient, isProducer, isAdmin, loading } = useAuth();
  const [homeStackKey, setHomeStackKey] = React.useState(0);

  // Mostrar tela de loading enquanto verifica autenticação
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // Renderizar navegação baseada no tipo de usuário
  if (isProducer) {
    return (
      <NavigationContainer>
        <ProducerNavigation />
      </NavigationContainer>
    );
  }

  if (isAdmin) {
    return (
      <NavigationContainer>
        <AdminNavigation />
      </NavigationContainer>
    );
  }

  // Navegação padrão para clientes
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="HomeStack"
        screenOptions={{
          headerShown: false,
        }}
        screenListeners={{
          drawerItemPress: (e) => {
            // Não precisamos fazer nada aqui - o useFocusEffect no HomeStackNavigator
            // vai detectar quando o drawer screen receber foco e resetar a stack
            // Apenas permitir a navegação normal
          },
        }}
      >
        <Drawer.Screen
          name="HomeStack"
          options={{
            title: 'Início',
            drawerIcon: ({ color, size }) => (<Ionicons name="home-outline" color={color} size={size} />),
          }}
        >
          {() => <HomeStackNavigator key={homeStackKey} />}
        </Drawer.Screen>
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
        <Drawer.Screen
          name="EmailVerification"
          component={EmailVerification}
          options={{
            title: 'Verificação de Email',
            drawerItemStyle: { display: 'none' },
            drawerIcon: ({ color, size }) => (<Ionicons name="mail-outline" color={color} size={size} />),
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});
