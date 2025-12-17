import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Event } from '@ingressohub/entities';
import { useAuth } from '@/context/AuthContext';
import { eventsService } from '@/services';
import { CameraScanner, EventSelector, ValidationActions } from '@/components';
import { useCameraPermission, useTicketValidation } from '@/hooks';

export default function ProducerValidateTicket() {
  const { user } = useAuth();
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [scanning, setScanning] = useState(false);
  
  const { openCamera } = useCameraPermission();
  const { banner, validateTicket } = useTicketValidation();

  useEffect(() => {
    const load = async () => {
      try {
        const events = await eventsService.getAllEvents();
        setAllEvents(events);
      } catch (e) {
        console.error(e);
        Alert.alert('Erro', 'Não foi possível carregar seus eventos');
      }
    };
    load();
  }, []);

  const producerEvents = useMemo(() => {
    if (!user) return [] as Event[];
    return allEvents.filter(e => (e as any).producer_id === user.id);
  }, [allEvents, user]);

  const handleOpenScanner = async () => {
    const hasPermission = await openCamera();
    if (hasPermission) {
      setScanning(true);
    }
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    await validateTicket(data);
  };

  if (scanning) {
    return (
      <CameraScanner
        onBarcodeScanned={handleBarcodeScanned}
        onClose={() => setScanning(false)}
        banner={banner}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <EventSelector
        events={producerEvents}
        selectedEvent={selectedEvent}
        onEventSelect={setSelectedEvent}
      />

      {selectedEvent && (
        <ValidationActions
          onOpenCamera={handleOpenScanner}
          onShowDetails={() => console.log("Carregar detalhes")}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
});
