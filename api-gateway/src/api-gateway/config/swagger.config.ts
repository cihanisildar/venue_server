// src/api-gateway/config/swagger.config.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Gateway Documentation',
      version: '1.0.0',
      description: 'API documentation for the gateway service',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Local Development Server'
      },
      {
        url: process.env.API_URL || 'https://api.example.com',
        description: 'Production Server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      BearerAuth: []
    }]
  },
  apis: [
    './src/api-gateway/routes/*.ts',
    './src/api-gateway/schemas/*.ts'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec, swaggerUi };