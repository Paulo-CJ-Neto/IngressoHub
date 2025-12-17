import { S3Service } from '../S3Service';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { mockSend } from '../../__mocks__/@aws-sdk/client-s3';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

describe('S3Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.S3_BUCKET_NAME = 'test-bucket';
    process.env.AWS_REGION = 'us-east-1';
  });

  describe('uploadFile', () => {
    it('deve fazer upload de arquivo com sucesso', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test-image-data'),
      };

      mockSend.mockResolvedValue({});

      const result = await S3Service.uploadFile(mockFile, 'event_123');

      expect(result).toContain('https://test-bucket.s3.us-east-1.amazonaws.com/events/event_123/');
      expect(mockSend).toHaveBeenCalled();
      expect(PutObjectCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          Bucket: 'test-bucket',
          Key: expect.stringContaining('events/event_123/'),
          Body: mockFile.buffer,
          ContentType: 'image/jpeg',
        })
      );
    });
  });

  describe('uploadMultipleFiles', () => {
    it('deve fazer upload de múltiplos arquivos', async () => {
      const mockFiles = [
        {
          originalname: 'test1.jpg',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('test1'),
        },
        {
          originalname: 'test2.jpg',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('test2'),
        },
      ];

      mockSend.mockResolvedValue({});

      const result = await S3Service.uploadMultipleFiles(mockFiles, 'event_123');

      expect(result).toHaveLength(2);
      expect(mockSend).toHaveBeenCalledTimes(2);
    });
  });

  describe('deleteFile', () => {
    it('deve deletar arquivo do S3', async () => {
      const imageUrl = 'https://test-bucket.s3.us-east-1.amazonaws.com/events/event_123/image.jpg';
      mockSend.mockResolvedValue({});

      await S3Service.deleteFile(imageUrl);

      expect(mockSend).toHaveBeenCalled();
      expect(DeleteObjectCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          Bucket: 'test-bucket',
          Key: 'events/event_123/image.jpg',
        })
      );
    });

    it('não deve lançar erro se falhar ao deletar', async () => {
      const imageUrl = 'https://test-bucket.s3.us-east-1.amazonaws.com/events/event_123/image.jpg';
      mockSend.mockRejectedValue(new Error('Delete failed'));

      await expect(S3Service.deleteFile(imageUrl)).resolves.not.toThrow();
    });
  });

  describe('generatePresignedUrl', () => {
    it('deve gerar URL pré-assinada', async () => {
      const mockPresignedUrl = 'https://test-bucket.s3.amazonaws.com/test-key?signature=test';
      (getSignedUrl as jest.Mock).mockResolvedValue(mockPresignedUrl);

      const result = await S3Service.generatePresignedUrl('test.jpg', 'event_123', 'image/jpeg');

      expect(result).toBe(mockPresignedUrl);
      expect(getSignedUrl).toHaveBeenCalled();
    });
  });

  describe('isValidS3Url', () => {
    it('deve retornar true para URL válida do bucket', () => {
      const validUrl = 'https://test-bucket.s3.us-east-1.amazonaws.com/events/image.jpg';
      expect(S3Service.isValidS3Url(validUrl)).toBe(true);
    });

    it('deve retornar false para URL inválida', () => {
      const invalidUrl = 'https://other-bucket.s3.amazonaws.com/image.jpg';
      expect(S3Service.isValidS3Url(invalidUrl)).toBe(false);
    });

    it('deve retornar false para URL malformada', () => {
      expect(S3Service.isValidS3Url('not-a-url')).toBe(false);
    });
  });
});

