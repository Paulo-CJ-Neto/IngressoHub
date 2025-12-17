/**
 * Exemplo de como usar o sistema de upload de imagens para eventos
 * 
 * Este arquivo demonstra como fazer upload de imagens para S3
 * ao criar ou atualizar eventos no IngressoHub.
 */

// Exemplo 1: Criar evento com imagens usando FormData (Frontend/React)
async function createEventWithImages() {
  const formData = new FormData();
  
  // Dados do evento
  formData.append('name', 'Show de Rock In Rio 2024');
  formData.append('date', '2024-12-31T20:00:00.000Z');
  formData.append('location', 'Parque Olímpico, Rio de Janeiro');
  formData.append('price', '150.00');
  formData.append('producer_id', 'producer_123');
  formData.append('description', 'O maior festival de rock do Brasil!');
  formData.append('max_tickets', '1000');
  
  // Adicionar imagens (máximo 5)
  const imageFiles = document.getElementById('imageInput').files;
  for (let i = 0; i < imageFiles.length; i++) {
    formData.append('images', imageFiles[i]);
  }
  
  try {
    const response = await fetch('/api/events', {
      method: 'POST',
      body: formData,
    });
    
    const event = await response.json();
    console.log('Evento criado:', event);
    console.log('Imagens salvas:', event.image_urls);
  } catch (error) {
    console.error('Erro ao criar evento:', error);
  }
}

// Exemplo 2: Adicionar imagens a evento existente
async function addImagesToEvent(eventId) {
  const formData = new FormData();
  
  const imageFiles = document.getElementById('additionalImages').files;
  for (let i = 0; i < imageFiles.length; i++) {
    formData.append('images', imageFiles[i]);
  }
  
  try {
    const response = await fetch(`/api/events/${eventId}/images`, {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    console.log('Imagens adicionadas:', result.newImages);
    console.log('Evento atualizado:', result.event);
  } catch (error) {
    console.error('Erro ao adicionar imagens:', error);
  }
}

// Exemplo 3: Remover imagem de evento
async function removeImageFromEvent(eventId, imageUrl) {
  try {
    const response = await fetch(`/api/events/${eventId}/images`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: imageUrl
      }),
    });
    
    const result = await response.json();
    console.log('Imagem removida:', result.message);
    console.log('Evento atualizado:', result.event);
  } catch (error) {
    console.error('Erro ao remover imagem:', error);
  }
}

// Exemplo 4: React Native (Expo)
import { launchImageLibrary } from 'react-native-image-picker';

const createEventWithImagesRN = async () => {
  // Selecionar imagens
  launchImageLibrary({
    mediaType: 'photo',
    quality: 0.8,
    selectionLimit: 5,
  }, (response) => {
    if (response.assets) {
      const formData = new FormData();
      
      // Dados do evento
      formData.append('name', 'Festival de Música Eletrônica');
      formData.append('date', '2024-11-20T22:00:00.000Z');
      formData.append('location', 'Autódromo de Interlagos, São Paulo');
      formData.append('price', '200.00');
      formData.append('producer_id', 'producer_456');
      formData.append('description', 'Uma noite de pura energia eletrônica!');
      
      // Adicionar imagens
      response.assets.forEach((asset, index) => {
        formData.append('images', {
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || `image_${index}.jpg`,
        });
      });
      
      // Fazer upload
      fetch('http://localhost:3000/api/events', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(response => response.json())
      .then(data => {
        console.log('Evento criado:', data);
      })
      .catch(error => {
        console.error('Erro:', error);
      });
    }
  });
};

// Exemplo 5: Node.js (Backend/Teste)
const FormData = require('form-data');
const fs = require('fs');

async function createEventWithImagesNode() {
  const formData = new FormData();
  
  // Dados do evento
  formData.append('name', 'Teatro: Romeu e Julieta');
  formData.append('date', '2024-10-25T19:30:00.000Z');
  formData.append('location', 'Teatro Municipal, São Paulo');
  formData.append('price', '80.00');
  formData.append('producer_id', 'producer_789');
  formData.append('description', 'A clássica história de amor de Shakespeare');
  
  // Adicionar imagens do sistema de arquivos
  const imagePaths = [
    './images/teatro1.jpg',
    './images/teatro2.jpg',
    './images/teatro3.jpg'
  ];
  
  imagePaths.forEach((imagePath, index) => {
    if (fs.existsSync(imagePath)) {
      formData.append('images', fs.createReadStream(imagePath));
    }
  });
  
  try {
    const response = await fetch('http://localhost:3000/api/events', {
      method: 'POST',
      body: formData,
    });
    
    const event = await response.json();
    console.log('Evento criado:', event);
  } catch (error) {
    console.error('Erro ao criar evento:', error);
  }
}

// Exemplo 6: Validação de tipos de arquivo (Frontend)
function validateImageFiles(files) {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  const maxFiles = 5;
  
  if (files.length > maxFiles) {
    throw new Error(`Máximo ${maxFiles} arquivos permitidos`);
  }
  
  for (let file of files) {
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Tipo de arquivo não permitido: ${file.type}`);
    }
    
    if (file.size > maxSize) {
      throw new Error(`Arquivo muito grande: ${file.name} (${file.size} bytes)`);
    }
  }
  
  return true;
}

// Exemplo 7: Preview de imagens antes do upload (Frontend)
function previewImages(files) {
  const previewContainer = document.getElementById('imagePreview');
  previewContainer.innerHTML = '';
  
  Array.from(files).forEach((file, index) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.style.width = '150px';
      img.style.height = '150px';
      img.style.objectFit = 'cover';
      img.style.margin = '5px';
      img.style.border = '1px solid #ddd';
      img.style.borderRadius = '5px';
      
      previewContainer.appendChild(img);
    };
    
    reader.readAsDataURL(file);
  });
}

// Exemplo 8: Tratamento de erros
async function createEventWithErrorHandling() {
  try {
    const formData = new FormData();
    formData.append('name', 'Evento de Teste');
    formData.append('date', '2024-12-31T20:00:00.000Z');
    formData.append('location', 'Local de Teste');
    formData.append('price', '100.00');
    formData.append('producer_id', 'producer_test');
    
    const response = await fetch('/api/events', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro desconhecido');
    }
    
    const event = await response.json();
    console.log('Evento criado com sucesso:', event);
    
  } catch (error) {
    console.error('Erro ao criar evento:', error.message);
    
    // Tratar diferentes tipos de erro
    if (error.message.includes('obrigatórios')) {
      console.log('Verifique se todos os campos obrigatórios foram preenchidos');
    } else if (error.message.includes('upload')) {
      console.log('Erro no upload das imagens. Verifique o tamanho e formato dos arquivos');
    } else if (error.message.includes('S3')) {
      console.log('Erro de conexão com S3. Verifique as configurações');
    }
  }
}

// Exportar funções para uso em outros arquivos
module.exports = {
  createEventWithImages,
  addImagesToEvent,
  removeImageFromEvent,
  createEventWithImagesRN,
  createEventWithImagesNode,
  validateImageFiles,
  previewImages,
  createEventWithErrorHandling
};
