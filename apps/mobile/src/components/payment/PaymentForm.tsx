import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TicketType } from '@/components/ticket';
import { useAuth } from '@/context/AuthContext';

interface BuyerInfo {
  name: string;
  cpf: string;
  email: string;
}

interface PaymentFormProps {
  buyerInfo: BuyerInfo;
  onBuyerInfoChange: (field: keyof BuyerInfo, value: string) => void;
  user: any;
  onLogin: () => void;
  paymentMethod: 'pix' | 'credit' | 'debit';
  onPaymentMethodChange: (method: 'pix' | 'credit' | 'debit') => void;
  hasSelectedTickets: () => boolean;
  getTotalPrice: () => number;
  formatPrice: (price: number) => string;
  processing: boolean;
  onPurchase: () => void;
}

export default function PaymentForm({
  buyerInfo,
  onBuyerInfoChange,
  user,
  onLogin,
  paymentMethod,
  onPaymentMethodChange,
  hasSelectedTickets,
  getTotalPrice,
  formatPrice,
  processing,
  onPurchase,
}: PaymentFormProps) {
  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
    }
    return value;
  };

  const isProducer = useAuth().isProducer;

  const handleCPFChange = (value: string) => {
    onBuyerInfoChange('cpf', formatCPF(value));
  };

  // Função para verificar se o CPF é válido (tem 11 dígitos)
  const isCPFValid = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, '');
    return cleanCPF.length === 11;
  };

  // Função para verificar se o formulário está válido
  const isFormValid = (): boolean => {
    return (
      hasSelectedTickets() &&
      !!buyerInfo.name?.trim() &&
      !!buyerInfo.email?.trim() &&
      isCPFValid(buyerInfo.cpf)
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="cart" size={24} color="#8B5CF6" />
        <Text style={styles.title}>Dados do Comprador</Text>
      </View>

      {!user && (
        <View style={styles.loginPrompt}>
          <Text style={styles.loginText}>
            Já tem uma conta? Faça login para agilizar sua compra!
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
            <MaterialIcons name="person" size={20} color="#8B5CF6" />
            <Text style={styles.loginButtonText}>Entrar com Google</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.formFields}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Nome completo *</Text>
          <TextInput
            style={styles.input}
            value={buyerInfo.name}
            onChangeText={(text) => onBuyerInfoChange('name', text)}
            placeholder="Seu nome completo"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>E-mail *</Text>
          <TextInput
            style={[styles.input, user && styles.inputDisabled]}
            value={buyerInfo.email}
            onChangeText={(text) => onBuyerInfoChange('email', text)}
            placeholder="seu@email.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            editable={!user}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>CPF *</Text>
          <TextInput
            style={styles.input}
            value={buyerInfo.cpf}
            onChangeText={handleCPFChange}
            placeholder="000.000.000-00"
            placeholderTextColor="#9CA3AF"
            maxLength={14}
            keyboardType="numeric"
          />
        </View>

        {/* Payment Method Selector */}
        <View style={styles.paymentMethodContainer}>
          <Text style={styles.paymentMethodLabel}>Forma de Pagamento *</Text>
          
          <View style={styles.paymentMethodCard}>
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'pix' && styles.paymentOptionSelected]}
              onPress={() => onPaymentMethodChange('pix')}
            >
              <View style={styles.paymentOptionContent}>
                <MaterialCommunityIcons 
                  name="qrcode-scan" 
                  size={24} 
                  color={paymentMethod === 'pix' ? '#8B5CF6' : '#9CA3AF'} 
                />
                <View style={styles.paymentOptionText}>
                  <Text style={[styles.paymentOptionTitle, paymentMethod === 'pix' && styles.paymentOptionTitleSelected]}>
                    PIX
                  </Text>
                  <Text style={[styles.paymentOptionSubtitle, paymentMethod === 'pix' ? styles.paymentOptionSubtitleSelected : styles.paymentOptionSubtitleDisabled]}>
                    Pagamento instantâneo
                  </Text>
                </View>
              </View>
              <View style={[styles.radioButton, paymentMethod === 'pix' && styles.radioButtonSelected]}>
                {paymentMethod === 'pix' && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>

            {/* Credit Card Option */}
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'credit' && styles.paymentOptionSelected]}
              onPress={() => onPaymentMethodChange('credit')}
              disabled={true}
            >
              <View style={styles.paymentOptionContent}>
                <MaterialCommunityIcons 
                  name="credit-card" 
                  size={24} 
                  color={paymentMethod === 'credit' ? '#8B5CF6' : '#9CA3AF'} 
                />
                <View style={styles.paymentOptionText}>
                  <Text style={[styles.paymentOptionTitle, paymentMethod === 'credit' && styles.paymentOptionTitleSelected]}>
                    Cartão de Crédito
                  </Text>
                  <Text style={[styles.paymentOptionSubtitle, paymentMethod === 'credit' ? styles.paymentOptionSubtitleSelected : styles.paymentOptionSubtitleDisabled]}>
                    Em breve
                  </Text>
                </View>
              </View>
              <View style={[styles.radioButtonDisabled, paymentMethod === 'credit' && styles.radioButtonSelected]}>
                {paymentMethod === 'credit' && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>

            {/* Debit Card Option */}
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'debit' && styles.paymentOptionSelected]}
              onPress={() => onPaymentMethodChange('debit')}
              disabled={true}
            >
              <View style={styles.paymentOptionContent}>
                <MaterialCommunityIcons 
                  name="credit-card-outline" 
                  size={24} 
                  color={paymentMethod === 'debit' ? '#8B5CF6' : '#9CA3AF'} 
                />
                <View style={styles.paymentOptionText}>
                  <Text style={[styles.paymentOptionTitle, paymentMethod === 'debit' && styles.paymentOptionTitleSelected]}>
                    Cartão de Débito
                  </Text>
                  <Text style={[styles.paymentOptionSubtitle, paymentMethod === 'debit' ? styles.paymentOptionSubtitleSelected : styles.paymentOptionSubtitleDisabled]}>
                    Em breve
                  </Text>
                </View>
              </View>
              <View style={[styles.radioButtonDisabled, paymentMethod === 'debit' && styles.radioButtonSelected]}>
                {paymentMethod === 'debit' && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>
          </View>

          {/* Payment Limitation Notice */}
          <View style={[styles.paymentNotice, { backgroundColor: '#FEF9C3', borderColor: '#FACC15' }]}>
            <MaterialCommunityIcons name="alert-circle" size={20} color="#F59E42" />
            <Text style={[styles.paymentNoticeText, { color: '#B45309' }]}>
              No momento, só temos a opção de pagamento via PIX disponível. Não é possível pagar com cartão de crédito ou débito.
            </Text>
          </View>
        </View>

        <View style={styles.paymentInfo}>
          <View style={styles.paymentHeader}>
            <MaterialCommunityIcons 
              name={paymentMethod === 'pix' ? 'qrcode-scan' : 'credit-card'} 
              size={20} 
              color={paymentMethod === 'pix' ? '#8B5CF6' : '#2563EB'} 
            />
            <Text style={styles.paymentTitle}>
              Pagamento via {paymentMethod === 'pix' ? 'PIX' : paymentMethod === 'credit' ? 'Cartão de Crédito' : 'Cartão de Débito'}
            </Text>
          </View>
          <Text style={styles.paymentText}>
            {paymentMethod === 'pix' 
              ? 'Após confirmar a compra, você receberá as instruções de pagamento via PIX e seu ingresso será liberado automaticamente.'
              : 'Após confirmar a compra, você será redirecionado para a tela de pagamento seguro.'
            }
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.purchaseButton,
            (!isFormValid() || processing) && styles.purchaseButtonDisabled
          ]}
          onPress={() => {
            if (isProducer) {
              Alert.alert(
                'Ação não permitida',
                'Produtores não podem finalizar compra de ingresso. Acesse uma conta de cliente para comprar ingressos.'
              );
              return;
            }
            if (!isFormValid()) {
              Alert.alert('Campos inválidos', 'Por favor, preencha todos os campos corretamente.');
              return;
            }
            onPurchase();
          }}
          disabled={processing || !isFormValid()}
        >
          <Text style={styles.purchaseButtonText}>
            {processing ? 'Processando...' : `Finalizar Compra - R$ ${formatPrice(getTotalPrice())}`}
          </Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          Ao finalizar a compra, você concorda com nossos termos de uso
          e política de privacidade.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    marginLeft: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  loginPrompt: {
    margin: 20,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  loginText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  loginButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  formFields: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  paymentMethodContainer: {
    marginBottom: 20,
  },
  paymentMethodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  paymentMethodCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  paymentOptionSelected: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentOptionText: {
    marginLeft: 12,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  paymentOptionTitleSelected: {
    color: '#8B5CF6',
  },
  paymentOptionSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  paymentOptionSubtitleSelected: {
    color: '#8B5CF6',
  },
  paymentOptionSubtitleDisabled: {
    color: '#9CA3AF',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonDisabled: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    backgroundColor: '#8B5CF6',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  paymentNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  paymentNoticeText: {
    marginLeft: 8,
    marginRight: 8,
    fontSize: 13,
    color: '#065F46',
    lineHeight: 18,
  },
  paymentInfo: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 20,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  paymentText: {
    fontSize: 14,
    color: '#2563EB',
    lineHeight: 20,
  },
  purchaseButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  purchaseButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
});
