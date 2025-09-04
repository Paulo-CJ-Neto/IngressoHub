import 'dotenv/config';
import { EmailService } from '../services/EmailService';

async function testEmailSystem() {
  console.log('🧪 Testando sistema de email...\n');

  try {
    // Teste 1: Conexão
    console.log('1️⃣ Testando conexão...');
    const isConnected = await EmailService.testConnection();
    if (isConnected) {
      console.log('✅ Conexão de email funcionando!\n');
    } else {
      console.log('❌ Falha na conexão de email\n');
      return;
    }

    // Teste 2: Email de verificação
    console.log('2️⃣ Testando envio de email de verificação...');
    const testEmail = process.env.TEST_EMAIL || 'teste@exemplo.com';
    const testToken = 'token-teste-' + Date.now();
    const testName = 'Usuário Teste';
    
    const verificationSent = await EmailService.sendVerificationEmail(
      testEmail,
      testToken,
      testName
    );
    
    if (verificationSent) {
      console.log(`✅ Email de verificação enviado para: ${testEmail}\n`);
      console.log('📧 O email contém um link para confirmação web');
      console.log('🔗 Link de teste: http://localhost:3000/verify-email?token=' + testToken + '\n');
    } else {
      console.log('❌ Falha no envio do email de verificação\n');
    }

    // Teste 3: Email de boas-vindas
    console.log('3️⃣ Testando envio de email de boas-vindas...');
    const welcomeSent = await EmailService.sendWelcomeEmail(testEmail, testName);
    
    if (welcomeSent) {
      console.log(`✅ Email de boas-vindas enviado para: ${testEmail}\n`);
    } else {
      console.log('❌ Falha no envio do email de boas-vindas\n');
    }

    console.log('🎉 Testes concluídos!');
    console.log('\n📧 Verifique sua caixa de entrada para confirmar os emails.');
    console.log('⚠️  Se não receber, verifique a pasta de spam.');
    console.log('\n🌐 Para testar a verificação:');
    console.log('1. Clique no link "Confirmar Email" no email recebido');
    console.log('2. O link abrirá uma página web de confirmação');
    console.log('3. Após confirmar, volte ao app e clique em "Email Já Verificado"');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  testEmailSystem()
    .then(() => {
      console.log('\n🏁 Script finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Erro fatal:', error);
      process.exit(1);
    });
}

export { testEmailSystem };
