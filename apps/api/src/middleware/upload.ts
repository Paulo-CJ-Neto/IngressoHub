import multer from 'multer';
import { Request } from 'express';

// Configuração do multer para upload em memória
const storage = multer.memoryStorage();

// Filtro para tipos de arquivo permitidos
const fileFilter = (req: Request, file: any, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Use apenas JPEG, PNG ou WebP.'));
  }
};

// Configuração do multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB por arquivo
    files: 5, // Máximo 5 arquivos por upload
  },
});

// Middleware para upload de múltiplas imagens de eventos
export const uploadEventImages = upload.array('images', 5);

// Middleware para upload de uma única imagem
export const uploadSingleImage = upload.single('image');

// Middleware para upload de imagem de perfil
export const uploadProfileImage = upload.single('profile_image');
