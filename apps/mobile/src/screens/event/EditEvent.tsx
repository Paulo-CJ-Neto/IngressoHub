import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RouteProp, useNavigation, useRoute, DrawerActions, StackActions, useFocusEffect } from '@react-navigation/native';
import { DisableDrawerSwipe } from '@/components/layout';
import { eventsService } from '@/services';
import { Event, EventTicketType } from '@ingressohub/entities';
import { SafeAreaView } from 'react-native-safe-area-context';

type EditEventRoute = RouteProp<Record<'EditEvent', { eventId: string }>, 'EditEvent'>;

export default function EditEvent() {
  const route = useRoute<EditEventRoute>();
  const navigation = useNavigation();
  const { eventId } = route.params as { eventId: string };

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [ticketTypes, setTicketTypes] = useState<Array<Pick<EventTicketType, 'name' | 'quantity' | 'price' | 'sold'>>>([]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState<Date>(() => new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerValue, setTimePickerValue] = useState<Date>(() => {
    const now = new Date();
    now.setSeconds(0, 0);
    return now;
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const e = await eventsService.getEventById(eventId);
        if (!mounted) return;
        setEvent(e);
        const d = new Date(e.date);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        setFormData({
          name: e.name || '',
          description: e.description || '',
          date: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`,
          time: `${hh}:${mm}`,
          location: e.location || '',
        });
        setImages(e.image_urls || (e.image_url ? [e.image_url] : []));
        setTicketTypes(e.ticket_types?.map(t => ({ name: t.name, quantity: t.quantity, price: t.price, sold: t.sold })) || []);
      } catch (err) {
        Alert.alert('Erro', 'Não foi possível carregar o evento.');
        navigation.goBack();
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [eventId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTicketType = () => {
    setTicketTypes(prev => [...prev, { name: '', quantity: 0, price: 0, sold: 0 }]);
  };
  const removeTicketType = (idx: number) => {
    setTicketTypes(prev => prev.filter((_, i) => i !== idx));
  };
  const changeTicketType = (idx: number, field: keyof EventTicketType, value: string) => {
    setTicketTypes(prev => prev.map((t, i) => i === idx ? { ...t, [field]: field === 'name' ? value : Number(String(value).replace(/[^0-9,\.]/g, '').replace(',', '.')) } : t));
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };
  const pickImages = async () => {
    const allowed = 6 - images.length;
    if (allowed <= 0) return;
    const has = await requestMediaLibraryPermission();
    if (!has) return;
    const result = await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: true, selectionLimit: allowed, mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85 });
    if (result.canceled) return;
    const selected = result.assets?.map(a => a.uri).filter(Boolean) as string[];
    setImages(prev => [...prev, ...selected].slice(0, 6));
  };
  const removeImage = (uri: string) => setImages(prev => prev.filter(u => u !== uri));

  const getInitialDate = (): Date => {
    const [dd, mm, yyyy] = (formData.date || '').split('/');
    const d = new Date();
    const day = parseInt(dd || '');
    const month = parseInt(mm || '');
    const year = parseInt(yyyy || '');
    if (!Number.isNaN(day) && !Number.isNaN(month) && !Number.isNaN(year)) {
      d.setFullYear(year);
      d.setMonth(Math.max(0, month - 1));
      d.setDate(day);
    }
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const onDateChange = (_: any, selected?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selected) {
      const dd = String(selected.getDate()).padStart(2, '0');
      const mm = String(selected.getMonth() + 1).padStart(2, '0');
      const yyyy = String(selected.getFullYear());
      handleInputChange('date', `${dd}/${mm}/${yyyy}`);
      setDatePickerValue(selected);
    }
  };
  const getInitialTime = (): Date => {
    const [h, m] = (formData.time || '').split(':');
    const d = new Date();
    const hh = parseInt(h || '');
    const mm = parseInt(m || '');
    if (!Number.isNaN(hh) && !Number.isNaN(mm)) d.setHours(hh, mm, 0, 0);
    return d;
  };
  const onTimeChange = (_: any, selected?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (selected) {
      const hh = String(selected.getHours()).padStart(2, '0');
      const mm = String(selected.getMinutes()).padStart(2, '0');
      handleInputChange('time', `${hh}:${mm}`);
      setTimePickerValue(selected);
    }
  };

  const handleSave = async () => {
    try {
      if (!event) return;
      // converter para ISO
      const [dd, mm, yyyy] = formData.date.split('/');
      const iso = `${yyyy}-${mm}-${dd}T${formData.time}:00.000Z`;
      const updates: Partial<Event> = {
        name: formData.name,
        description: formData.description,
        date: iso,
        location: formData.location,
        image_url: images[0],
        image_urls: images,
        ticket_types: ticketTypes.map(t => ({ ...t })),
      };
      await eventsService.updateEvent(event.id, updates);
      Alert.alert('Sucesso', 'Evento atualizado com sucesso.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    }
  };

  const handleDelete = async () => {
    try {
      if (!event) return;
      Alert.alert('Excluir Evento', 'Tem certeza que deseja excluir este evento?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: async () => { await eventsService.deleteEvent(event.id); Alert.alert('Excluído', 'Evento excluído.'); navigation.goBack(); } },
      ]);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível excluir.');
    }
  };

  if (loading || !event) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#64748B' }}>Carregando…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <DisableDrawerSwipe />
      <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Abrir menu"
          >
            <Ionicons name="arrow-back" size={22} color="#1e293b" />
          </TouchableOpacity>
          <Text style={[styles.title, { marginBottom: 0 }]}>Editar Evento</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome</Text>
          <TextInput style={styles.input} value={formData.name} onChangeText={(v) => handleInputChange('name', v)} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput style={[styles.input, styles.textArea]} value={formData.description} onChangeText={(v) => handleInputChange('description', v)} multiline numberOfLines={4} />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Data</Text>
            <TouchableOpacity
              style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
              onPress={() => { setDatePickerValue(getInitialDate()); setShowDatePicker(true); }}
            >
              <Text style={{ fontSize: 16, color: formData.date ? '#0F172A' : '#94A3B8' }}>{formData.date || 'DD/MM/AAAA'}</Text>
              <Ionicons name="calendar" size={18} color="#64748B" />
            </TouchableOpacity>
            {Platform.OS === 'android' && showDatePicker && (
              <DateTimePicker value={datePickerValue} mode="date" display="default" onChange={onDateChange} />
            )}
            {Platform.OS === 'ios' && (
              <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Selecionar data</Text>
                    <DateTimePicker value={datePickerValue} mode="date" display="spinner" onChange={onDateChange} />
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
            <Text style={styles.label}>Hora</Text>
            <TouchableOpacity
              style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
              onPress={() => { setTimePickerValue(getInitialTime()); setShowTimePicker(true); }}
            >
              <Text style={{ fontSize: 16, color: formData.time ? '#0F172A' : '#94A3B8' }}>{formData.time || 'HH:MM'}</Text>
              <Ionicons name="time" size={18} color="#64748B" />
            </TouchableOpacity>
            {Platform.OS === 'android' && showTimePicker && (
              <DateTimePicker value={timePickerValue} mode="time" display="default" is24Hour onChange={onTimeChange} />
            )}
            {Platform.OS === 'ios' && (
              <Modal visible={showTimePicker} transparent animationType="fade" onRequestClose={() => setShowTimePicker(false)}>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Selecionar hora</Text>
                    <DateTimePicker value={timePickerValue} mode="time" display="spinner" is24Hour onChange={onTimeChange} />
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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Local</Text>
          <TextInput style={styles.input} value={formData.location} onChangeText={(v) => handleInputChange('location', v)} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Imagens (até 6)</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {images.map((uri) => (
              <View key={uri} style={{ position: 'relative' }}>
                <Image source={{ uri }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                <TouchableOpacity onPress={() => removeImage(uri)} style={{ position: 'absolute', top: -6, right: -6, backgroundColor: '#FFF', borderRadius: 10 }}>
                  <Ionicons name="close-circle" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 6 && (
              <TouchableOpacity onPress={pickImages} style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="image" size={18} color="#8B5CF6" />
                <Text style={{ color: '#8B5CF6', fontWeight: '600' }}>Adicionar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tipos de Ingresso</Text>
          {ticketTypes.map((t, idx) => (
            <View key={idx} style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ color: '#8B5CF6', fontWeight: '600' }}>Tipo {idx + 1}</Text>
                <TouchableOpacity onPress={() => removeTicketType(idx)}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.smallLabel}>Nome</Text>
                <TextInput value={t.name} onChangeText={(v) => changeTicketType(idx, 'name', v)} style={styles.input} />
              </View>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <Text style={styles.smallLabel}>Quantidade</Text>
                  <TextInput value={String(t.quantity)} onChangeText={(v) => changeTicketType(idx, 'quantity', v)} style={styles.input} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <Text style={styles.smallLabel}>Preço</Text>
                  <TextInput value={String(t.price)} onChangeText={(v) => changeTicketType(idx, 'price', v)} style={styles.input} keyboardType="numeric" />
                </View>
              </View>
            </View>
          ))}
          <TouchableOpacity onPress={addTicketType} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="add-circle" size={22} color="#8B5CF6" />
            <Text style={{ color: '#8B5CF6', fontWeight: '600' }}>Adicionar Tipo</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
          <TouchableOpacity onPress={handleSave} style={[styles.submitButton, { backgroundColor: '#8B5CF6' }]}>
            <Text style={styles.submitButtonText}>Salvar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={[styles.submitButton, { backgroundColor: '#EF4444' }]}>
            <Text style={styles.submitButtonText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16
  },
  menuButton: {
    paddingRight: 20,
  },
  form: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  smallLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
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
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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


