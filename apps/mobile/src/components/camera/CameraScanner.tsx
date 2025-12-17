import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView } from 'expo-camera';
import { ValidationBanner } from '@/components/ticket';

interface CameraScannerProps {
  onBarcodeScanned: (data: { data: string }) => void;
  onClose: () => void;
  banner?: {
    type: 'valid' | 'invalid';
    message: string;
  } | null;
}

export function CameraScanner({ onBarcodeScanned, onClose, banner }: CameraScannerProps) {
  return (
    <View style={styles.container}>
      <CameraView
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={onBarcodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      
      <ValidationBanner
        type={banner?.type || 'invalid'}
        message={banner?.message || 'Aponte a câmera para o QR Code'}
        visible={true}
      />
      
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 50,
  },
});
