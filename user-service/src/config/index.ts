import dotenv from 'dotenv';

dotenv.config();

if (!process.env.API_GATEWAY_SECRET) {
  throw new Error('API_GATEWAY_SECRET must be defined in environment variables');
}

export const config = {
  port: process.env.PORT || 3002,
  gateway: {
    secret: process.env.API_GATEWAY_SECRET
  },
  database: {
    url: process.env.DATABASE_URL
  },
  env: process.env.NODE_ENV || 'development'
};