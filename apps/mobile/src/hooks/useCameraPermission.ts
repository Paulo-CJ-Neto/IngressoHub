import { useState } from 'react';
import { Alert } from 'react-native';
import { useCameraPermissions } from 'expo-camera';

export function useCameraPermission() {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const askForCameraPermission = async (): Promise<boolean> => {
    const res = await requestPermission();
    const granted = !!res?.granted;
    setHasPermission(granted);
    
    if (!granted) {
      Alert.alert(
        'Permissão necessária', 
        'Acesso à câmera é necessário para escanear QR Codes.'
      );
    }
    
    return granted;
  };

  const openCamera = async (): Promise<boolean> => {
    if (hasPermission === null) {
      const granted = await askForCameraPermission();
      return granted;
    }
    
    return hasPermission === true;
  };

  return {
    hasPermission,
    openCamera,
    askForCameraPermission
  };
}
