import api from './api';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export interface UploadResponse {
  success: boolean;
  imageUrl?: string;
  imageUrls?: string[];
  error?: string;
}

export interface EventData {
  name: string;
  date: string;
  location: string;
  price: number;
  producer_id: string;
  description?: string;
  max_tickets?: number;
}

export class UploadService {
  /**
   * Solicitar permissões para acessar a galeria
   */
  static async requestMediaLibraryPermission(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à sua galeria para selecionar imagens.'
      );
      return false;
    }
    return true;
  }

  /**
   * Selecionar imagens da galeria
   */
  static async selectImages(maxImages: number = 5): Promise<string[]> {
    const hasPermission = await this.requestMediaLibraryPermission();
    if (!hasPermission) return [];

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      selectionLimit: maxImages,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      exif: false, // Não incluir dados EXIF para economizar espaço
    });

    if (result.canceled) return [];

    return result.assets?.map(asset => asset.uri).filter(Boolean) as string[] || [];
  }

  /**
   * Criar evento com upload de imagens
   */
  static async createEventWithImages(
    eventData: EventData,
    imageUris: string[]
  ): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      
      // Adicionar dados do evento
      formData.append('name', eventData.name);
      formData.append('date', eventData.date);
      formData.append('location', eventData.location);
      formData.append('price', eventData.price.toString());
      formData.append('producer_id', eventData.producer_id);
      
      if (eventData.description) {
        formData.append('description', eventData.description);
      }
      
      if (eventData.max_tickets) {
        formData.append('max_tickets', eventData.max_tickets.toString());
      }
      
      // Adicionar imagens
      for (let i = 0; i < imageUris.length; i++) {
        const uri = imageUris[i];
        const filename = `image_${i}_${Date.now()}.jpg`;
        
        formData.append('images', {
          uri,
          type: 'image/jpeg',
          name: filename,
        } as any);
      }
      
      const response = await api.post('/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 segundos para upload
      });
      
      return {
        success: true,
        imageUrl: response.data.image_url,
        imageUrls: response.data.image_urls,
      };
      
    } catch (error: any) {
      console.error('Erro no upload:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Erro desconhecido',
      };
    }
  }
  
  /**
   * Adicionar imagens a evento existente
   */
  static async addImagesToEvent(
    eventId: string,
    imageUris: string[]
  ): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      
      // Adicionar imagens
      for (let i = 0; i < imageUris.length; i++) {
        const uri = imageUris[i];
        const filename = `image_${i}_${Date.now()}.jpg`;
        
        formData.append('images', {
          uri,
          type: 'image/jpeg',
          name: filename,
        } as any);
      }
      
      const response = await api.post(
        `/events/${eventId}/images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000,
        }
      );
      
      return {
        success: true,
        imageUrls: response.data.newImages,
      };
      
    } catch (error: any) {
      console.error('Erro ao adicionar imagens:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Erro desconhecido',
      };
    }
  }
  
  /**
   * Remover imagem de evento
   */
  static async removeImageFromEvent(
    eventId: string,
    imageUrl: string
  ): Promise<UploadResponse> {
    try {
      const response = await api.delete(
        `/events/${eventId}/images`,
        {
          data: { imageUrl },
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      return {
        success: true,
      };
      
    } catch (error: any) {
      console.error('Erro ao remover imagem:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Erro desconhecido',
      };
    }
  }
  
  /**
   * Validar URIs de imagem
   */
  static validateImageUris(uris: string[]): { valid: boolean; error?: string } {
    const maxImages = 5;
    
    if (uris.length === 0) {
      return { valid: true }; // Não é obrigatório ter imagens
    }
    
    if (uris.length > maxImages) {
      return { valid: false, error: `Máximo ${maxImages} imagens permitidas` };
    }
    
    // Verificar se todas as URIs são válidas
    for (let uri of uris) {
      if (!uri || typeof uri !== 'string') {
        return { valid: false, error: 'URI de imagem inválida' };
      }
    }
    
    return { valid: true };
  }
  
  /**
   * Comprimir imagem (opcional - para economizar espaço)
   */
  static async compressImage(uri: string): Promise<string> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
        base64: false,
      });
      
      if (result.canceled || !result.assets?.[0]) {
        return uri; // Retorna a URI original se cancelado
      }
      
      return result.assets[0].uri;
    } catch (error) {
      console.error('Erro ao comprimir imagem:', error);
      return uri; // Retorna a URI original em caso de erro
    }
  }
}

export const uploadService = new UploadService();

