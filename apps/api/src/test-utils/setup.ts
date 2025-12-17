// Setup global para testes
import 'dotenv/config';

// Configurar variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
process.env.AWS_REGION = 'us-east-1';
process.env.EVENTS_TABLE_NAME = 'Events-Test';
process.env.TICKETS_TABLE_NAME = 'Tickets-Test';
process.env.USERS_TABLE_NAME = 'Users-Test';
process.env.PAYMENTS_TABLE_NAME = 'Payments-Test';
process.env.ABACATEPAY_API_KEY = 'test-abacatepay-key';
process.env.S3_BUCKET_NAME = 'test-bucket';
process.env.EMAIL_CONFIG_GMAIL_USER = 'test@example.com';
process.env.EMAIL_CONFIG_GMAIL_PASS = 'test-pass';
process.env.FRONTEND_URL = 'http://localhost:3000';

