import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootDrawerParamList } from '../navigation';
import { authService } from '../services/authService';
import { SafeAreaView } from 'react-native-safe-area-context';

type EmailVerificationNavigationProp = DrawerNavigationProp<RootDrawerParamList, 'EmailVerification'>;

interface RouteParams {
  email: string;
  fullName: string;
}

export default function EmailVerification() {
  const navigation = useNavigation<EmailVerificationNavigationProp>();
  const route = useRoute();
  const { email, fullName } = route.params as RouteParams;

  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [hasCheckedEmail, setHasCheckedEmail] = useState(false);

  // Contador regressivo para reenvio
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleResendVerification = async () => {
    if (resendCountdown > 0) {
      Alert.alert('Aguarde', `Você pode solicitar um novo email em ${resendCountdown} segundos.`);
      return;
    }

    setIsResending(true);
    try {
      await authService.resendVerification(email);

      // Iniciar contador de 60 segundos
      setResendCountdown(60);

      Alert.alert(
        'Email reenviado! 📧',
        'Email de verificação reenviado com sucesso! Verifique sua caixa de entrada e pasta de spam.',
        [
          {
            text: 'OK',
            onPress: () => {
              setHasCheckedEmail(false);
            }
          }
        ]
      );
    } catch (error: any) {
      let errorMessage = 'Erro ao reenviar verificação';

      if (error.message.includes('Email já foi verificado')) {
        errorMessage = 'Este email já foi verificado. Você pode fazer login normalmente.';
        navigation.navigate('Login');
        return;
      } else if (error.message.includes('Usuário não encontrado')) {
        errorMessage = 'Usuário não encontrado. Verifique se o email está correto.';
      }

      Alert.alert('Erro no reenvio', errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    Alert.alert(
      'Voltar para login',
      'Tem certeza que deseja voltar? Você precisará verificar seu email para fazer login.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sim, voltar',
          onPress: () => navigation.navigate('Login')
        }
      ]
    );
  };

  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.headerIcon}>
            <Ionicons name="mail-outline" size={28} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>Verifique seu Email</Text>
          <Text style={styles.subtitle}>
            Enviamos um link de verificação para:
          </Text>
          <Text style={styles.email}>{email}</Text>

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>📧 Como verificar seu email:</Text>
            <Text style={styles.instructions}>
              1. Abra seu aplicativo de email
            </Text>
            <Text style={styles.instructions}>
              2. Procure por um email do IngressoHub
            </Text>
            <Text style={styles.instructions}>
              3. Clique no botão "Confirmar Email" no email
            </Text>
            <Text style={styles.instructions}>
              4. Aguarde a confirmação e volte aqui
            </Text>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              (isResending || resendCountdown > 0) && styles.disabledButton
            ]}
            onPress={handleResendVerification}
            disabled={isResending || resendCountdown > 0}
          >
            <Ionicons name="refresh-outline" size={18} color="#8B5CF6" />
            <Text style={styles.secondaryButtonText}>
              {isResending ? 'Reenviando...' :
                resendCountdown > 0 ? `Reenviar em ${resendCountdown}s` : 'Reenviar email'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={handleBackToLogin}>
            <Text style={styles.linkButtonText}>Voltar para o login</Text>
          </TouchableOpacity>

          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>Precisa de ajuda?</Text>
            <Text style={styles.helpText}>
              • Verifique se digitou o email correto{'\n'}
              • Procure na pasta de spam/lixo eletrônico{'\n'}
              • Aguarde alguns minutos para o email chegar{'\n'}
              • Se não receber, use o botão "Reenviar email"{'\n'}
              • Clique no link "Confirmar Email" no email recebido
            </Text>
          </View>

          {resendCountdown > 0 && (
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownText}>
                ⏰ Próximo reenvio disponível em: {resendCountdown}s
              </Text>
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: '100%',
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 24,
    textAlign: 'center',
  },
  instructionsContainer: {
    backgroundColor: '#F1F5F9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
    lineHeight: 20,
  },
  actionButtons: {
    width: '100%',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  successButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#94A3B8',
    fontSize: 14,
  },
  linkButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  linkButtonText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
  },
  helpContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownContainer: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  tipContainer: {
    backgroundColor: '#E0F2FE',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCE5FF',
    width: '100%',
    marginTop: 16,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007BFF',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#0056B3',
    lineHeight: 20,
  },
});
