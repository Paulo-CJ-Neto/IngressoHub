import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { ProducerDrawerParamList } from '../navigation/ProducerNavigation';

type CreateEventNavigationProp = DrawerNavigationProp<ProducerDrawerParamList, 'CreateEvent'>;

export default function CreateEvent() {
  const navigation = useNavigation<CreateEventNavigationProp>();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
    address: '',
    totalTickets: '',
    price: '',
    category: 'music'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Validação básica
    if (!formData.name || !formData.date || !formData.time || !formData.location || !formData.totalTickets || !formData.price) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Aqui você faria a chamada para a API para criar o evento
    Alert.alert(
      'Evento Criado! 🎉',
      'Seu evento foi criado com sucesso e está disponível para venda de ingressos.',
      [
        {
          text: 'Ver Eventos',
          onPress: () => navigation.navigate('ManageEvents')
        },
        {
          text: 'Criar Outro',
          onPress: () => setFormData({
            name: '',
            description: '',
            date: '',
            time: '',
            location: '',
            address: '',
            totalTickets: '',
            price: '',
            category: 'music'
          })
        }
      ]
    );
  };

  const categories = [
    { id: 'music', label: 'Música', icon: 'musical-notes' },
    { id: 'theater', label: 'Teatro', icon: 'theater-masks' },
    { id: 'sports', label: 'Esportes', icon: 'football' },
    { id: 'business', label: 'Negócios', icon: 'briefcase' },
    { id: 'education', label: 'Educação', icon: 'school' },
    { id: 'other', label: 'Outros', icon: 'ellipsis-horizontal' }
  ];

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Criar Evento</Text>
          <Text style={styles.subtitle}>Preencha as informações do seu evento</Text>
        </View>

        <View style={styles.form}>
          {/* Nome do Evento */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do Evento *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Ex: Show de Rock"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Descrição */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Descreva seu evento..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Categoria */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoria</Text>
            <View style={styles.categoryContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    formData.category === category.id && styles.categoryButtonActive
                  ]}
                  onPress={() => handleInputChange('category', category.id)}
                >
                  <Ionicons 
                    name={category.icon as any} 
                    size={20} 
                    color={formData.category === category.id ? '#FFFFFF' : '#64748B'} 
                  />
                  <Text style={[
                    styles.categoryButtonText,
                    formData.category === category.id && styles.categoryButtonTextActive
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Data e Hora */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Data *</Text>
              <TextInput
                style={styles.input}
                value={formData.date}
                onChangeText={(value) => handleInputChange('date', value)}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Hora *</Text>
              <TextInput
                style={styles.input}
                value={formData.time}
                onChangeText={(value) => handleInputChange('time', value)}
                placeholder="HH:MM"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Local */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Local *</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(value) => handleInputChange('location', value)}
              placeholder="Ex: Arena Show"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Endereço */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Endereço</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="Endereço completo"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Ingressos e Preço */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Total de Ingressos *</Text>
              <TextInput
                style={styles.input}
                value={formData.totalTickets}
                onChangeText={(value) => handleInputChange('totalTickets', value)}
                placeholder="100"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Preço *</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(value) => handleInputChange('price', value)}
                placeholder="R$ 0,00"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Botão de Envio */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Criar Evento</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#8B5CF6',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#0F172A',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
