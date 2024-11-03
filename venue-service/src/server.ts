import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// User profile endpoint
app.get('/users/profile', (req, res) => {
  // Implementation for getting user profile
  res.json({
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test User'
  });
});

app.listen(port, () => {
  console.log(`🚀 User Service running on port ${port}`);
});