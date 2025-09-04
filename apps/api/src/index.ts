import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { validateEnvironment } from './db';
import apiRoutes from './routes';

const app = express();
const IP = process.env.IP || '192.168.0.101'
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: 'DynamoDB'
  });
});

// API routes
app.use(apiRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Inicializar banco de dados e iniciar servidor
const startServer = async () => {
  try {
    // Validar variáveis de ambiente
    validateEnvironment();
    console.log('✅ Environment variables validated');


    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`🚀 IngressoHub API running on port ${PORT}`);
      console.log(`📱 Health check: http://localhost:${PORT}/health`);
      console.log(`📱 Health check: http://${IP}:${PORT}/health`);
      console.log(`🎫 Events: http://localhost:${PORT}/api/events`);
      console.log(`🎫 Events: http://${IP}:${PORT}/api/events`);
      console.log(`🎟️ Tickets: http://localhost:${PORT}/api/tickets`);
      console.log(`🎟️ Tickets: http://${IP}:${PORT}/api/tickets`);
      console.log(`👥 Users: http://localhost:${PORT}/api/users`);
      console.log(`👥 Users: http://${IP}:${PORT}/api/users`);
      console.log(`💳 Payments: http://localhost:${PORT}/api/payments`);
      console.log(`💳 Payments: http://${IP}:${PORT}/api/payments`);
      console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
      console.log(`🔐 Auth: http://${IP}:${PORT}/api/auth`);
      console.log(`🗄️ Database: DynamoDB`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
