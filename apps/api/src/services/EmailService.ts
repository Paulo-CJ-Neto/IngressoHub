import nodemailer from 'nodemailer';
import { EMAIL_CONFIG, getEmailProvider } from '../config/email';

export class EmailService {
  private static transporter: nodemailer.Transporter;

  static initialize() {
    const provider = getEmailProvider();
    
    if (provider === 'GMAIL') {
      this.transporter = nodemailer.createTransport({
        service: EMAIL_CONFIG.GMAIL.service,
        auth: {
          user: EMAIL_CONFIG.GMAIL.user,
          pass: EMAIL_CONFIG.GMAIL.pass
        }
      });
    } else {
      // Para SendGrid ou outros provedores
      this.transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: EMAIL_CONFIG.SENDGRID.apiKey
        }
      });
    }
  }

  static async sendVerificationEmail(email: string, token: string, fullName: string): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.initialize();
      }

      const verificationUrl = `${EMAIL_CONFIG.FRONTEND_URL}/api/auth/verify-email?token=${token}`;
      
      const mailOptions = {
        from: EMAIL_CONFIG.GMAIL.from,
        to: email,
        subject: EMAIL_CONFIG.TEMPLATES.VERIFICATION.subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎫 IngressoHub</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #1E293B; margin-bottom: 20px;">Olá, ${fullName}!</h2>
              <p style="color: #64748B; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                Obrigado por se cadastrar no IngressoHub! Para começar a usar nossa plataforma, 
                precisamos confirmar que este é realmente o seu endereço de email.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: #8B5CF6; color: white; padding: 15px 30px; text-decoration: none; 
                          border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
                  Confirmar Email
                </a>
              </div>
              <p style="color: #64748B; font-size: 14px; line-height: 1.5;">
                Se o botão não funcionar, copie e cole este link no seu navegador:<br>
                <a href="${verificationUrl}" style="color: #8B5CF6; word-break: break-all;">${verificationUrl}</a>
              </p>
              <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="color: #92400E; margin: 0; font-size: 14px;">
                  <strong>⚠️ Importante:</strong> Este link expira em 24 horas por segurança.
                </p>
              </div>
              <div style="background: #E0F2FE; border: 1px solid #CCE5FF; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="color: #0056B3; margin: 0; font-size: 14px;">
                  <strong>💡 Dica:</strong> Após confirmar seu email, volte ao aplicativo IngressoHub e clique em "Email Já Verificado".
                </p>
              </div>
              <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 25px 0;">
              <p style="color: #94A3B8; font-size: 12px; text-align: center;">
                Este email foi enviado automaticamente. Se você não se cadastrou no IngressoHub, 
                pode ignorar esta mensagem.
              </p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de verificação enviado para: ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar email de verificação:', error);
      return false;
    }
  }

  static async sendWelcomeEmail(email: string, fullName: string): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.initialize();
      }

      const mailOptions = {
        from: EMAIL_CONFIG.GMAIL.from,
        to: email,
        subject: EMAIL_CONFIG.TEMPLATES.WELCOME.subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎫 IngressoHub</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #1E293B; margin-bottom: 20px;">Parabéns, ${fullName}! 🎉</h2>
              <p style="color: #64748B; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                Seu email foi confirmado com sucesso! Agora você pode aproveitar todos os recursos do IngressoHub.
              </p>
              <div style="background: #F1F5F9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1E293B; margin-top: 0;">O que você pode fazer agora:</h3>
                <ul style="color: #64748B; line-height: 1.8;">
                  <li>🎭 Explorar eventos e shows</li>
                  <li>🎟️ Comprar ingressos</li>
                  <li>👥 Conectar com outros usuários</li>
                  <li>💳 Gerenciar seus pagamentos</li>
                </ul>
              </div>
              <p style="color: #64748B; font-size: 16px; line-height: 1.6;">
                Estamos muito felizes em tê-lo conosco! Se precisar de ajuda, não hesite em entrar em contato.
              </p>
              <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 25px 0;">
              <p style="color: #94A3B8; font-size: 12px; text-align: center;">
                Obrigado por escolher o IngressoHub! 🎫
              </p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de boas-vindas enviado para: ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar email de boas-vindas:', error);
      return false;
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.initialize();
      }
      
      await this.transporter.verify();
      console.log('✅ Conexão de email testada com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao testar conexão de email:', error);
      return false;
    }
  }
}
