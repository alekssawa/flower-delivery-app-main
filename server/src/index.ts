import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import routes from './routes';

dotenv.config();

const app = express();


// Безопасное получение URL фронтенда
// const frontendUrl = process.env.FRONTEND_URL || '';
const nodeEnv = process.env.NODE_ENV || 'development';

// Разрешенные домены для CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || '',                     // URL фронтенда на Vercel или другой
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '' // URL самого бэкенда на Vercel
].filter(origin => origin && origin.trim() !== '');

// Middleware CORS
app.use(cors({
  origin: function (origin, callback) {
    // Разрешаем запросы без origin
    if (!origin) return callback(null, true);
    
    // Проверяем разрешенные origin
    const isAllowed = allowedOrigins.some(allowedOrigin => 
      origin.startsWith(allowedOrigin)
    );
    
    if (isAllowed) {
      return callback(null, true);
    }
    
    callback(new Error('CORS policy: Origin not allowed'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api', routes);

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || '';
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Export для Vercel serverless
export default app;

// Локальный запуск для разработки
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Allowed CORS origins:', allowedOrigins);
});
