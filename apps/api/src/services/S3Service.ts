import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

export class S3Service {
  private static getClient() {
    return new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  private static getBucketName() {
    return process.env.S3_BUCKET_NAME || 'ingressohub-images';
  }

  private static readonly FOLDER_PREFIX = 'events/';

  /**
   * Upload de arquivo para S3
   * @param file Arquivo do multer
   * @param eventId ID do evento
   * @returns URL pública da imagem
   */
  static async uploadFile(
    file: any,
    eventId: string
  ): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const key = `${this.FOLDER_PREFIX}${eventId}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.getBucketName(),
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL removido - bucket usa política pública em vez de ACL
    });

    await this.getClient().send(command);

    // Retorna a URL pública da imagem
    return `https://${this.getBucketName()}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  }

  /**
   * Upload múltiplas imagens
   * @param files Array de arquivos do multer
   * @param eventId ID do evento
   * @returns Array de URLs públicas das imagens
   */
  static async uploadMultipleFiles(
    files: any[],
    eventId: string
  ): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, eventId));
    return Promise.all(uploadPromises);
  }

  /**
   * Deletar imagem do S3
   * @param imageUrl URL da imagem a ser deletada
   */
  static async deleteFile(imageUrl: string): Promise<void> {
    try {
      // Extrai a chave da URL
      const url = new URL(imageUrl);
      const key = url.pathname.substring(1); // Remove a barra inicial

      const command = new DeleteObjectCommand({
        Bucket: this.getBucketName(),
        Key: key,
      });

      await this.getClient().send(command);
    } catch (error) {
      console.error('Erro ao deletar arquivo do S3:', error);
      // Não lança erro para não quebrar o fluxo principal
    }
  }

  /**
   * Gerar URL pré-assinada para upload direto do frontend
   * @param fileName Nome do arquivo
   * @param eventId ID do evento
   * @param contentType Tipo de conteúdo
   * @returns URL pré-assinada
   */
  static async generatePresignedUrl(
    fileName: string,
    eventId: string,
    contentType: string
  ): Promise<string> {
    const key = `${this.FOLDER_PREFIX}${eventId}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.getBucketName(),
      Key: key,
      ContentType: contentType,
      // ACL removido - bucket usa política pública em vez de ACL
    });

    return getSignedUrl(this.getClient(), command, { expiresIn: 3600 }); // 1 hora
  }

  /**
   * Validar se uma URL é do nosso bucket S3
   * @param url URL a ser validada
   * @returns true se for uma URL válida do nosso bucket
   */
  static isValidS3Url(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes(this.getBucketName());
    } catch {
      return false;
    }
  }
}
