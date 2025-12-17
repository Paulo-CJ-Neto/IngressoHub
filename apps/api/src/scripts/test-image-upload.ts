import { S3Service } from '../services/S3Service';
import fs from 'fs';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function testImageUpload() {
  try {
    console.log('🧪 Testando upload de imagem...');
    
    const imagePath = 'C:/Users/User/paulo/imagens/painel_btg.jpg';
    console.log('📁 Caminho da imagem:', imagePath);
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(imagePath)) {
      console.error('❌ Arquivo não encontrado:', imagePath);
      return;
    }
    
    console.log('✅ Arquivo encontrado');
    
    // Ler o arquivo
    const fileBuffer = fs.readFileSync(imagePath);
    console.log('📊 Tamanho do arquivo:', fileBuffer.length, 'bytes');
    
    // Simular arquivo do multer
    const mockFile = {
      buffer: fileBuffer,
      originalname: 'painel_btg.jpg',
      mimetype: 'image/jpeg'
    } as any;
    
    const eventId = 'test-event-' + Date.now();
    console.log('🎯 Event ID:', eventId);
    
    // Fazer upload
    console.log('\n📤 Fazendo upload...');
    const imageUrl = await S3Service.uploadFile(mockFile, eventId);
    console.log('✅ Upload realizado com sucesso!');
    console.log('🔗 URL da imagem:', imageUrl);
    
    // Testar se a URL é válida
    console.log('\n🔍 Validando URL...');
    const isValid = S3Service.isValidS3Url(imageUrl);
    console.log('✅ URL válida:', isValid);
    
    // Testar acesso à imagem
    console.log('\n🌐 Testando acesso à imagem...');
    const response = await fetch(imageUrl);
    if (response.ok) {
      console.log('✅ Imagem acessível via URL!');
      console.log('📊 Status:', response.status);
      console.log('📊 Content-Type:', response.headers.get('content-type'));
      console.log('📊 Content-Length:', response.headers.get('content-length'));
      
      // Salvar a URL em um arquivo para referência
      fs.writeFileSync('uploaded-image-url.txt', imageUrl);
      console.log('\n💾 URL salva em: uploaded-image-url.txt');
      
    } else {
      console.log('❌ Erro ao acessar imagem:', response.status, response.statusText);
    }
    
    console.log('\n🎉 Teste concluído com sucesso!');
    
  } catch (error: any) {
    console.error('❌ Erro no teste:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testImageUpload();
}

export { testImageUpload };
