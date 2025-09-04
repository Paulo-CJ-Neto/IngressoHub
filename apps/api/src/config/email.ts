export const EMAIL_CONFIG = {
  // Configurações do Gmail (para desenvolvimento)
  GMAIL: {
    service: 'gmail',
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password',
    from: process.env.EMAIL_USER || 'noreply@ingressohub.com'
  },
  
  // Configurações do SendGrid (para produção)
  SENDGRID: {
    apiKey: process.env.SENDGRID_API_KEY,
    from: process.env.EMAIL_FROM || 'noreply@ingressohub.com'
  },
  
  // URLs do frontend
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  MOBILE_APP_URL: process.env.MOBILE_APP_URL || 'ingressohub://verify-email',
  
  // Configurações de templates
  TEMPLATES: {
    VERIFICATION: {
      subject: 'Confirme seu email - IngressoHub',
      expiresIn: 24 * 60 * 60 * 1000 // 24 horas em milissegundos
    },
    WELCOME: {
      subject: 'Bem-vindo ao IngressoHub! 🎉'
    }
  }
};

export const getEmailProvider = () => {
  // Em desenvolvimento, usar Gmail
  if (process.env.NODE_ENV === 'development') {
    return 'GMAIL';
  }
  
  // Em produção, usar SendGrid se configurado
  if (process.env.SENDGRID_API_KEY) {
    return 'SENDGRID';
  }
  
  // Fallback para Gmail
  return 'GMAIL';
};
