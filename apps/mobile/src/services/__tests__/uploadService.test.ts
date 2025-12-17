import { UploadService } from '../uploadService';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

jest.mock('expo-image-picker');
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

describe('UploadService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestMediaLibraryPermission', () => {
    it('deve retornar true se permissão concedida', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await UploadService.requestMediaLibraryPermission();

      expect(result).toBe(true);
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('deve retornar false e mostrar alert se permissão negada', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await UploadService.requestMediaLibraryPermission();

      expect(result).toBe(false);
      expect(Alert.alert).toHaveBeenCalled();
    });
  });

  describe('selectImages', () => {
    it('deve selecionar imagens com sucesso', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          { uri: 'file:///image1.jpg' },
          { uri: 'file:///image2.jpg' },
        ],
      });

      const result = await UploadService.selectImages(5);

      expect(result).toHaveLength(2);
      expect(result[0]).toBe('file:///image1.jpg');
      expect(result[1]).toBe('file:///image2.jpg');
    });

    it('deve retornar array vazio se cancelado', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      const result = await UploadService.selectImages(5);

      expect(result).toHaveLength(0);
    });

    it('deve retornar array vazio se permissão negada', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await UploadService.selectImages(5);

      expect(result).toHaveLength(0);
      expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
    });
  });

  describe('validateImageUris', () => {
    it('deve validar URIs válidas', () => {
      const uris = ['file:///image1.jpg', 'file:///image2.jpg'];
      const result = UploadService.validateImageUris(uris);

      expect(result.valid).toBe(true);
    });

    it('deve retornar erro se mais de 5 imagens', () => {
      const uris = Array(6).fill('file:///image.jpg');
      const result = UploadService.validateImageUris(uris);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Máximo 5 imagens');
    });

    it('deve retornar válido se array vazio', () => {
      const result = UploadService.validateImageUris([]);

      expect(result.valid).toBe(true);
    });
  });
});

