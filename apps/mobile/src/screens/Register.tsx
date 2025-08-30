import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootDrawerParamList } from '../navigation';
import { useAuth } from '../context/AuthContext';

type RegisterNavigationProp = DrawerNavigationProp<RootDrawerParamList, 'Register'>;

export default function Register() {
  const navigation = useNavigation<RegisterNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { registerWithEmail, signInWithGoogle, signInWithApple } = useAuth();

  const handleEmailRegister = async () => {
    if (!email.trim()) {
      Alert.alert('Atenção', 'Informe um e-mail válido.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter ao menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }
    try {
      await registerWithEmail(email, password, email.split('@')[0]);
      navigation.navigate('MyTickets');
    } catch (e) {
      Alert.alert('E-mail já cadastrado');
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await signInWithGoogle();
      navigation.navigate('MyTickets');
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Falha ao fazer cadastro com Google');
    }
  };

  const handleAppleRegister = async () => {
    try {
      await signInWithApple();
      navigation.navigate('MyTickets');
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Falha ao fazer cadastro com Apple');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerIcon}>
        <Ionicons name="person-add-outline" size={28} color="#FFFFFF" />
      </View>
      <Text style={styles.title}>Cadastro</Text>
      <Text style={styles.subtitle}>Crie sua conta com um toque</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#94A3B8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#94A3B8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmar senha"
          placeholderTextColor="#94A3B8"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <TouchableOpacity style={[styles.primaryButton]} onPress={handleEmailRegister}>
          <Text style={styles.primaryButtonText}>Cadastrar com e-mail</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.authButton, { backgroundColor: '#DB4437' }]} onPress={handleGoogleRegister}>
        <Ionicons name="logo-google" size={18} color="#FFFFFF" />
        <Text style={styles.authButtonText}>Cadastrar com Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.authButton, { backgroundColor: '#000000' }]} onPress={handleAppleRegister}>
        <Ionicons name="logo-apple" size={18} color="#FFFFFF" />
        <Text style={styles.authButtonText}>Cadastrar com Apple</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkButtonText}>Já tem conta? Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  form: {
    width: '100%',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 12,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  linkButton: {
    marginTop: 8,
  },
  linkButtonText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
  },
});


