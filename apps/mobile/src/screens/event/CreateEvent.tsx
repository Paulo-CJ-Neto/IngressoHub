import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Keyboard,
  Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { ProducerDrawerParamList } from '@/navigation/ProducerNavigation';
import { useAuth } from '@/context/AuthContext';
import { eventsService } from '@/services';
import { UploadService } from '@/services/uploadService';
import { Event } from '@ingressohub/entities';

type CreateEventNavigationProp = DrawerNavigationProp<ProducerDrawerParamList, 'CreateEvent'>;

interface TicketType {
  id: string;
  name: string;
  quantity: string;
  price: string;
}

export default function CreateEvent() {
  const navigation = useNavigation<CreateEventNavigationProp>();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
    address: '',
    category: 'funk'
  });

  const [images, setImages] = useState<string[]>([]);

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    { id: '1', name: 'Pista', quantity: '', price: '' }
  ]);

  type NominatimAddress = {
    road?: string;
    house_number?: string;
    neighbourhood?: string;
    suburb?: string;
    quarter?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    postcode?: string;
  };
  type NominatimPlace = { place_id: number; display_name: string; lat: string; lon: string; name?: string; address?: NominatimAddress };
  const [locationSuggestions, setLocationSuggestions] = useState<NominatimPlace[]>([]);
  const [addressSuggestions, setAddressSuggestions] = useState<NominatimPlace[]>([]);
  const [focusedField, setFocusedField] = useState<'location' | 'address' | null>(null);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerValue, setTimePickerValue] = useState<Date>(() => {
    const now = new Date();
    now.setSeconds(0, 0);
    return now;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState<Date>(() => new Date());

  const getInitialTimeDate = (): Date => {
    const now = new Date();
    const [h, m] = (formData.time || '').split(':');
    const hours = Number.parseInt(h || '', 10);
    const minutes = Number.parseInt(m || '', 10);
    if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
      now.setHours(hours, minutes, 0, 0);
    } else {
      now.setSeconds(0, 0);
    }
    return now;
  };

  const onTimeChange = (_event: any, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selected) {
      const hh = String(selected.getHours()).padStart(2, '0');
      const mm = String(selected.getMinutes()).padStart(2, '0');
      handleInputChange('time', `${hh}:${mm}`);
      setTimePickerValue(selected);
    }
  };

  const getInitialDate = (): Date => {
    const [dd, mm, yyyy] = (formData.date || '').split('/');
    const day = Number.parseInt(dd || '', 10);
    const month = Number.parseInt(mm || '', 10);
    const year = Number.parseInt(yyyy || '', 10);
    if (!Number.isNaN(day) && !Number.isNaN(month) && !Number.isNaN(year)) {
      const d = new Date();
      d.setFullYear(year);
      d.setMonth(Math.max(0, month - 1));
      d.setDate(day);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  };

  const formatDateDDMMYYYY = (dateObj: Date): string => {
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yyyy = String(dateObj.getFullYear());
    return `${dd}/${mm}/${yyyy}`;
  };

  const onDateChange = (_event: any, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selected) {
      handleInputChange('date', formatDateDDMMYYYY(selected));
      setDatePickerValue(selected);
    }
  };

  const getPrimaryLabel = (place: NominatimPlace): string => {
    if (place.name && place.name.trim().length > 0) return place.name;
    const first = place.display_name?.split(',')[0]?.trim();
    return first || place.display_name || '';
  };

  const formatAddressBR = (place: NominatimPlace): string => {
    const addr = place.address || {};
    const street = addr.road || (place.name && place.name.trim()) || (place.display_name?.split(',')[0]?.trim() || '');
    const number = addr.house_number ? `, ${addr.house_number}` : '';
    const bairro = addr.suburb || addr.neighbourhood || addr.quarter || '';
    const cidade = addr.city || addr.town || addr.village || addr.municipality || '';
    const cep = addr.postcode || '';

    const parts: string[] = [];
    const streetWithNumber = `${street}${number}`.trim();
    if (streetWithNumber) parts.push(streetWithNumber);
    if (bairro) parts.push(bairro);
    if (cidade) parts.push(cidade);
    if (cep) parts.push(cep);
    return parts.join(', ');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTicketTypeChange = (id: string, field: string, value: string) => {
    setTicketTypes(prev => 
      prev.map(ticket => 
        ticket.id === id ? { ...ticket, [field]: value } : ticket
      )
    );
  };

  const addTicketType = () => {
    const newId = (ticketTypes.length + 1).toString();
    setTicketTypes(prev => [...prev, { 
      id: newId, 
      name: '', 
      quantity: '', 
      price: '' 
    }]);
  };

  const removeTicketType = (id: string) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(prev => prev.filter(ticket => ticket.id !== id));
    }
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para selecionar imagens.');
      return false;
    }
    return true;
  };

  const pickImages = async () => {
    if (images.length >= 5) {
      Alert.alert('Limite atingido', 'Você pode adicionar até 5 imagens.');
      return;
    }

    const selectedImages = await UploadService.selectImages(5 - images.length);
    if (selectedImages.length === 0) return;

    const newList = [...images, ...selectedImages].slice(0, 5);
    setImages(newList);
  };

  const removeImage = (uri: string) => {
    setImages(prev => prev.filter(item => item !== uri));
  };

  const handleSubmit = async () => {
    // Validação básica dos campos do evento
    if (!formData.name || !formData.date || !formData.time || !formData.location) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os campos obrigatórios do evento.');
      return;
    }

    // Validação dos tipos de ingresso
    const hasInvalidTicket = ticketTypes.some(ticket => 
      !ticket.name || !ticket.quantity || !ticket.price
    );
    
    if (hasInvalidTicket) {
      Alert.alert('Tipos de Ingresso', 'Por favor, preencha todos os campos dos tipos de ingresso.');
      return;
    }

    try {
      if (!user) {
        Alert.alert('Sessão', 'Você precisa estar logado.');
        return;
      }

      const isoDate = `${formData.date.split('/').reverse().join('-')}T${formData.time}:00.000Z`;
      
      // Calcula o total de ingressos e preço médio
      const totalTickets = ticketTypes.reduce((sum, ticket) => sum + Number(ticket.quantity), 0);
      const averagePrice = ticketTypes.reduce((sum, ticket) => 
        sum + (Number(String(ticket.price).replace(/[^0-9,\.]/g, '').replace(',', '.')) || 0), 0
      ) / ticketTypes.length;

      const eventData: Partial<Event> = {
        name: formData.name,
        description: formData.description,
        date: isoDate,
        location: formData.location,
        price: averagePrice,
        max_tickets: totalTickets,
        sold_tickets: 0,
        status: 'active',
        producer_id: user.id,
        ticket_types: ticketTypes.map(ticket => ({
          name: ticket.name,
          quantity: Number(ticket.quantity),
          price: Number(String(ticket.price).replace(/[^0-9,\.]/g, '').replace(',', '.')) || 0,
          sold: 0
        }))
      };

      // Criar evento com upload de imagens se houver imagens
      const created = images.length > 0 
        ? await eventsService.createEventWithImages(eventData, images)
        : await eventsService.createEvent(eventData);

      Alert.alert(
        'Evento Criado! 🎉',
        'Seu evento foi criado com sucesso e está disponível para venda de ingressos.',
        [
          { text: 'OK', onPress: () => navigation.navigate('HomeStack' as any) }
        ]
      );
      
      setFormData({
        name: '', 
        description: '', 
        date: '', 
        time: '', 
        location: '', 
        address: '', 
        category: 'funk'
      });
      
      setTicketTypes([
        { id: '1', name: 'Pista', quantity: '', price: '' }
      ]);
      setImages([]);
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível criar o evento.');
    }
  };

  // Buscar sugestões (Nominatim) para Local
  useEffect(() => {
    if (focusedField !== 'location') return;
    const query = formData.location?.trim() || '';
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }
    const controller = new AbortController();
    setIsSearchingLocation(true);
    const timeoutId = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&namedetails=1&countrycodes=br&limit=8&q=${encodeURIComponent(query)}`;
        const response = await fetch(url, {
          headers: {
            'Accept-Language': 'pt-BR',
            'User-Agent': 'IngressoHubApp/1.0'
          },
          signal: controller.signal
        });
        const data = (await response.json()) as NominatimPlace[];
        if (Array.isArray(data)) {
          const seen = new Set<string>();
          const unique = data.filter((item) => {
            const label = getPrimaryLabel(item).toLowerCase();
            if (!label) return false;
            if (seen.has(label)) return false;
            seen.add(label);
            return true;
          });
          setLocationSuggestions(unique);
        } else {
          setLocationSuggestions([]);
        }
      } catch (_) {
        setLocationSuggestions([]);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 400);
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
      setIsSearchingLocation(false);
    };
  }, [formData.location, focusedField]);

  // Buscar sugestões (Nominatim) para Endereço
  useEffect(() => {
    if (focusedField !== 'address') return;
    const query = formData.address?.trim() || '';
    if (query.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    const controller = new AbortController();
    setIsSearchingAddress(true);
    const timeoutId = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&namedetails=1&countrycodes=br&limit=8&q=${encodeURIComponent(query)}`;
        const response = await fetch(url, {
          headers: {
            'Accept-Language': 'pt-BR',
            'User-Agent': 'IngressoHubApp/1.0'
          },
          signal: controller.signal
        });
        const data = (await response.json()) as NominatimPlace[];
        if (Array.isArray(data)) {
          const seen = new Set<string>();
          const unique = data.filter((item) => {
            const label = formatAddressBR(item).toLowerCase();
            if (!label) return false;
            if (seen.has(label)) return false;
            seen.add(label);
            return true;
          });
          setAddressSuggestions(unique);
        } else {
          setAddressSuggestions([]);
        }
      } catch (_) {
        setAddressSuggestions([]);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 400);
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
      setIsSearchingAddress(false);
    };
  }, [formData.address, focusedField]);

  const categories = [
    { id: 'funk', label: 'Funk', icon: 'musical-notes' }, 
    { id: 'trap', label: 'Trap', icon: 'musical-notes' }, 
    { id: 'pagode', label: 'Pagode', icon: 'musical-notes' }, 
    { id: 'sertanejo', label: 'Sertanejo', icon: 'musical-notes' }, 
    { id: 'mpb', label: 'MPB', icon: 'musical-notes' }, 
    { id: 'rock', label: 'Rock', icon: 'musical-notes' }, 
    { id: 'outros', label: 'Outros', icon: 'apps' } 
  ];

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.openDrawer()}
            accessibilityRole="button"
            accessibilityLabel="Abrir menu"
          >
            <Ionicons name="menu" size={22} color="#FFFFFF" />
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
              <TouchableOpacity
                style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                onPress={() => {
                  setDatePickerValue(getInitialDate());
                  setShowDatePicker(true);
                }}
                accessibilityRole="button"
                accessibilityLabel="Selecionar data"
              >
                <Text style={{ fontSize: 16, color: formData.date ? '#0F172A' : '#94A3B8' }}>
                  {formData.date || 'DD/MM/AAAA'}
                </Text>
                <Ionicons name="calendar" size={18} color="#64748B" />
              </TouchableOpacity>

              {Platform.OS === 'android' && showDatePicker && (
                <DateTimePicker
                  value={datePickerValue}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}

              {Platform.OS === 'ios' && (
                <Modal
                  visible={showDatePicker}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setShowDatePicker(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <Text style={styles.modalTitle}>Selecionar data</Text>
                      <DateTimePicker
                        value={datePickerValue}
                        mode="date"
                        display="spinner"
                        onChange={onDateChange}
                        textColor='#000000'
                      />
                      <View style={styles.modalActions}>
                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                          <Text style={styles.modalActionConfirm}>Concluir</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>
              )}
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Hora *</Text>
              <TouchableOpacity
                style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                onPress={() => {
                  setTimePickerValue(getInitialTimeDate());
                  setShowTimePicker(true);
                }}
                accessibilityRole="button"
                accessibilityLabel="Selecionar hora"
              >
                <Text style={{ fontSize: 16, color: formData.time ? '#0F172A' : '#94A3B8' }}>
                  {formData.time || 'HH:MM'}
                </Text>
                <Ionicons name="time" size={18} color="#64748B" />
              </TouchableOpacity>

              {Platform.OS === 'android' && showTimePicker && (
                <DateTimePicker
                  value={timePickerValue}
                  mode="time"
                  display="default"
                  is24Hour
                  onChange={onTimeChange}
                />
              )}

              {Platform.OS === 'ios' && (
                <Modal
                  visible={showTimePicker}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setShowTimePicker(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <Text style={styles.modalTitle}>Selecionar hora</Text>
                      <DateTimePicker
                        value={timePickerValue}
                        mode="time"
                        display="spinner"
                        is24Hour
                        onChange={onTimeChange}
                        textColor='#000000'
                      />
                      <View style={styles.modalActions}>
                        <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                          <Text style={styles.modalActionConfirm}>Concluir</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>
              )}
            </View>
          </View>

          {/* Local */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Local *</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(value) => handleInputChange('location', value)}
              onFocus={() => setFocusedField('location')}
              placeholder="Ex: Arena Show"
              placeholderTextColor="#94A3B8"
            />
            {focusedField === 'location' && (formData.location?.trim()?.length || 0) >= 3 && (isSearchingLocation || locationSuggestions.length > 0) && (
              <View style={styles.suggestionsContainer}>
                {isSearchingLocation ? (
                  <Text style={styles.suggestionLoading}>Buscando…</Text>
                ) : (
                  <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 200 }}>
                    {locationSuggestions.map((s, idx) => (
                      <TouchableOpacity
                        key={s.place_id ?? idx}
                        style={styles.suggestionItem}
                        onPress={() => {
                          handleInputChange('location', getPrimaryLabel(s));
                          setLocationSuggestions([]);
                          setFocusedField(null);
                          Keyboard.dismiss();
                        }}
                      >
                        <Text style={styles.suggestionText}>{getPrimaryLabel(s)}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
          </View>

          {/* Endereço */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Endereço</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              onFocus={() => setFocusedField('address')}
              placeholder="Endereço completo"
              placeholderTextColor="#94A3B8"
            />
            {focusedField === 'address' && (formData.address?.trim()?.length || 0) >= 3 && (isSearchingAddress || addressSuggestions.length > 0) && (
              <View style={styles.suggestionsContainer}>
                {isSearchingAddress ? (
                  <Text style={styles.suggestionLoading}>Buscando…</Text>
                ) : (
                  <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 200 }}>
                    {addressSuggestions.map((s, idx) => (
                      <TouchableOpacity
                        key={s.place_id ?? idx}
                        style={styles.suggestionItem}
                        onPress={() => {
                          handleInputChange('address', formatAddressBR(s));
                          setAddressSuggestions([]);
                          setFocusedField(null);
                          Keyboard.dismiss();
                        }}
                      >
                        <Text style={styles.suggestionText}>{formatAddressBR(s)}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
          </View>

          {/* Imagens do Evento */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Imagens do Evento (até 5)</Text>
            <View style={styles.imagesRow}>
              {images.map((uri) => (
                <View key={uri} style={styles.imageThumbWrapper}>
                  <Image source={{ uri }} style={styles.imageThumb} />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(uri)}>
                    <Ionicons name="close-circle" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}

              {images.length < 5 && (
                <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
                  <Ionicons name="image" size={22} color="#8B5CF6" />
                  <Text style={styles.addImageText}>Adicionar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Tipos de Ingresso */}
          <View style={styles.inputGroup}>
            <View style={styles.ticketTypesHeader}>
              <Text style={styles.label}>Tipos de Ingresso *</Text>
              <TouchableOpacity 
                style={styles.addTicketButton}
                onPress={addTicketType}
              >
                <Ionicons name="add-circle" size={24} color="#8B5CF6" />
                <Text style={styles.addTicketButtonText}>Adicionar Tipo</Text>
              </TouchableOpacity>
            </View>

            {ticketTypes.map((ticket, index) => (
              <View key={ticket.id} style={styles.ticketTypeCard}>
                <View style={styles.ticketTypeHeader}>
                  <Text style={styles.ticketTypeTitle}>
                    Tipo {index + 1}
                  </Text>
                  {ticketTypes.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeTicketType(ticket.id)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.ticketLabel}>Nome do Ingresso *</Text>
                  <TextInput
                    style={styles.input}
                    value={ticket.name}
                    onChangeText={(value) => handleTicketTypeChange(ticket.id, 'name', value)}
                    placeholder="Ex: Pista, VIP, Camarote"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.ticketLabel}>Quantidade *</Text>
                    <TextInput
                      style={styles.input}
                      value={ticket.quantity}
                      onChangeText={(value) => handleTicketTypeChange(ticket.id, 'quantity', value)}
                      placeholder="100"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.ticketLabel}>Preço *</Text>
                    <TextInput
                      style={styles.input}
                      value={ticket.price}
                      onChangeText={(value) => handleTicketTypeChange(ticket.id, 'price', value)}
                      placeholder="R$ 0,00"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            ))}
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
  menuButton: {
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
  ticketLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
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
  ticketTypesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addTicketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addTicketButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  ticketTypeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ticketTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  removeButton: {
    padding: 4,
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
  imagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageThumbWrapper: {
    position: 'relative',
  },
  imageThumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  removeImageBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
  addImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  addImageText: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  suggestionText: {
    color: '#0F172A',
    fontSize: 14,
  },
  suggestionLoading: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#64748B',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 8,
  },
  modalActionConfirm: {
    color: '#8B5CF6',
    fontWeight: '600',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});