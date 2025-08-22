import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootDrawerParamList } from '../navigation';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';

export default function Contact() {
  const navigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  const contactMethods = [
    {
      icon: 'logo-whatsapp' as const,
      title: 'WhatsApp',
      description: 'Atendimento rápido via WhatsApp',
      contact: '+55 (11) 99999-9999',
      action: 'Iniciar conversa',
      href: 'https://wa.me/5511999999999',
      color: '#10B981',
    },
    {
      icon: 'mail-outline' as const,
      title: 'E-mail',
      description: 'Envie sua dúvida por e-mail',
      contact: 'contato@ticketwave.com.br',
      action: 'Enviar e-mail',
      href: 'mailto:contato@ticketwave.com.br',
      color: '#0EA5E9',
    },
    {
      icon: 'call-outline' as const,
      title: 'Telefone',
      description: 'Ligue para nosso atendimento',
      contact: '(11) 3333-4444',
      action: 'Ligar agora',
      href: 'tel:+551133334444',
      color: '#6366F1',
    },
  ];

  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
    } catch {
      // noop
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
          accessibilityRole="button"
          accessibilityLabel="Abrir menu"
        >
          <Ionicons name="menu" size={22} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <Ionicons name="headset-outline" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.headerTitle}>Fale Conosco</Text>
        <Text style={styles.headerSubtitle}>Estamos aqui para ajudar! Entre em contato pelos canais abaixo</Text>
      </View>

      <View style={styles.content}>
        {/* Contact Methods */}
        <View style={styles.methodsGrid}>
          {contactMethods.map((method) => (
            <Card key={method.title} style={styles.methodCard}>
              <CardContent>
                <View style={[styles.methodIcon, { backgroundColor: method.color }]}>
                  <Ionicons name={method.icon} size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.methodTitle}>{method.title}</Text>
                <Text style={styles.methodDesc}>{method.description}</Text>
                <Text style={styles.methodContact}>{method.contact}</Text>
                <Button style={[styles.methodButton, { backgroundColor: method.color }]} onPress={() => openLink(method.href)}>
                  <Text style={styles.methodButtonText}>{method.action}</Text>
                </Button>
              </CardContent>
            </Card>
          ))}
        </View>

        {/* Business Hours + Office */}
        <Card style={styles.infoCard}>
          <CardContent>
            <View style={styles.infoGrid}>
              <View>
                <View style={styles.infoHeaderRow}>
                  <Ionicons name="time-outline" size={22} color="#8B5CF6" />
                  <Text style={styles.infoTitle}>Horário de Atendimento</Text>
                </View>
                <View style={styles.rows}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.rowLabel}>Segunda a Sexta:</Text>
                    <Text style={styles.rowValue}>09:00 às 18:00</Text>
                  </View>
                  <View style={styles.rowBetween}>
                    <Text style={styles.rowLabel}>Sábado:</Text>
                    <Text style={styles.rowValue}>09:00 às 14:00</Text>
                  </View>
                  <View style={styles.rowBetween}>
                    <Text style={styles.rowLabel}>Domingo:</Text>
                    <Text style={styles.rowValue}>Fechado</Text>
                  </View>
                </View>
              </View>

              <View>
                <View style={styles.infoHeaderRow}>
                  <Ionicons name="location-outline" size={22} color="#6366F1" />
                  <Text style={styles.infoTitle}>Escritório</Text>
                </View>
                <View>
                  <Text style={styles.officeText}>Av. Paulista, 1000</Text>
                  <Text style={styles.officeText}>Bela Vista - São Paulo/SP</Text>
                  <Text style={[styles.officeText, { marginBottom: 8 }]}>CEP: 01310-100</Text>
                  <Text style={styles.officeNote}>* Atendimento apenas por agendamento</Text>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card style={styles.faqCard}>
          <CardContent>
            <Text style={styles.faqTitle}>Perguntas Frequentes</Text>
            <View style={styles.faqGrid}>
              <View style={styles.faqItem}>
                <Text style={styles.faqItemTitle}>Como comprar ingressos?</Text>
                <Text style={styles.faqItemText}>Navegue pelos eventos, selecione o desejado, preencha seus dados e finalize a compra via PIX.</Text>
              </View>
              <View style={styles.faqItem}>
                <Text style={styles.faqItemTitle}>Posso cancelar meu ingresso?</Text>
                <Text style={styles.faqItemText}>Entre em contato conosco através dos canais acima para solicitar o cancelamento.</Text>
              </View>
              <View style={styles.faqItem}>
                <Text style={styles.faqItemTitle}>E se eu perder meu QR Code?</Text>
                <Text style={styles.faqItemText}>Acesse "Meus Ingressos" no app ou entre em contato conosco com seu CPF e e-mail.</Text>
              </View>
              <View style={styles.faqItem}>
                <Text style={styles.faqItemTitle}>Como funciona a entrada?</Text>
                <Text style={styles.faqItemText}>Apresente o QR Code do seu ingresso na entrada do evento junto com um documento de identidade.</Text>
              </View>
            </View>
          </CardContent>
        </Card>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    alignItems: 'center', paddingTop: 40, paddingBottom: 24, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  menuButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#8B5CF6', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 6 },
  headerSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', paddingHorizontal: 20 },
  content: { padding: 20 },
  methodsGrid: { gap: 12 },
  methodCard: { borderRadius: 16 },
  methodIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  methodTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 6 },
  methodDesc: { fontSize: 14, color: '#64748B', marginBottom: 8 },
  methodContact: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 12 },
  methodButton: { borderRadius: 12 },
  methodButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  infoCard: { marginTop: 12 },
  infoGrid: { gap: 16 },
  infoHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  rows: { gap: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { color: '#64748B', fontSize: 14 },
  rowValue: { color: '#1E293B', fontSize: 14, fontWeight: '600' },
  officeText: { color: '#374151', fontSize: 14, marginBottom: 2 },
  officeNote: { color: '#6B7280', fontSize: 12, fontStyle: 'italic' },
  faqCard: { marginTop: 12 },
  faqTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#1E293B', marginBottom: 12 },
  faqGrid: { gap: 10 },
  faqItem: { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 16, padding: 16 },
  faqItemTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 6 },
  faqItemText: { fontSize: 14, color: '#64748B' },
});



