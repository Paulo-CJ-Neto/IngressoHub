import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { uploadService } from '@/services';

interface EventImageManagerProps {
  eventId: string;
  existingImages: string[];
  onImagesUpdated: (newImages: string[]) => void;
}

export const EventImageManager: React.FC<EventImageManagerProps> = ({
  eventId,
  existingImages,
  onImagesUpdated,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const handleAddImages = async () => {
    try {
      setIsUploading(true);
      
      const selectedImages = await uploadService.selectImages(5);
      if (selectedImages.length === 0) return;

      const result = await uploadService.addImagesToEvent(eventId, selectedImages);
      
      if (result.success && result.imageUrls) {
        const updatedImages = [...existingImages, ...result.imageUrls];
        onImagesUpdated(updatedImages);
        Alert.alert('Sucesso', 'Imagens adicionadas com sucesso!');
      } else {
        Alert.alert('Erro', result.error || 'Erro ao adicionar imagens');
      }
    } catch (error) {
      console.error('Erro ao adicionar imagens:', error);
      Alert.alert('Erro', 'Erro ao adicionar imagens');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    Alert.alert(
      'Remover Imagem',
      'Tem certeza que deseja remover esta imagem?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsRemoving(imageUrl);
              
              const result = await uploadService.removeImageFromEvent(eventId, imageUrl);
              
              if (result.success) {
                const updatedImages = existingImages.filter(url => url !== imageUrl);
                onImagesUpdated(updatedImages);
                Alert.alert('Sucesso', 'Imagem removida com sucesso!');
              } else {
                Alert.alert('Erro', result.error || 'Erro ao remover imagem');
              }
            } catch (error) {
              console.error('Erro ao remover imagem:', error);
              Alert.alert('Erro', 'Erro ao remover imagem');
            } finally {
              setIsRemoving(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Imagens do Evento</Text>
        <Text style={styles.subtitle}>
          {existingImages.length}/5 imagens
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
        {existingImages.map((imageUrl, index) => (
          <View key={imageUrl} style={styles.imageWrapper}>
            <Image source={{ uri: imageUrl }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveImage(imageUrl)}
              disabled={isRemoving === imageUrl}
            >
              {isRemoving === imageUrl ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="close-circle" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        ))}

        {existingImages.length < 5 && (
          <TouchableOpacity
            style={[styles.addButton, isUploading && styles.disabledButton]}
            onPress={handleAddImages}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#8B5CF6" />
            ) : (
              <>
                <Ionicons name="add" size={24} color="#8B5CF6" />
                <Text style={styles.addButtonText}>Adicionar</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      <Text style={styles.info}>
        Toque em uma imagem para removê-la ou adicione novas imagens
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  imagesContainer: {
    marginBottom: 8,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  disabledButton: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
    marginTop: 4,
  },
  info: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

