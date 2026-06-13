/**
 * Swagger Configuration
 * OpenAPI/Swagger documentation configuration
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SparkTree SaaS API',
      version: '1.0.0',
      description: 'API documentation for SparkTree omnichannel SaaS platform',
      contact: {
        name: 'SparkTree Support',
        email: 'support@sparktree.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.sparktree.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
        Tenant: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['active', 'suspended', 'trial'],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            firstName: {
              type: 'string',
            },
            lastName: {
              type: 'string',
            },
            role: {
              type: 'string',
              enum: ['admin', 'owner', 'agent', 'viewer'],
            },
          },
        },
      },
    },
  },
  apis: ['./src/**/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
