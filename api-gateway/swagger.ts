import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "API Gateway for handling authentication and user-related requests",
    },
    servers: [
      {
        url: "http://localhost:8000",
        description: "Development server",
      },
    ],
  },
  apis: ["./routes/*.ts", "./routes/*.js"], // Specify your route files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
