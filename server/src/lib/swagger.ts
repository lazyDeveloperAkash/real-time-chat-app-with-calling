import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { env } from '@/config/env';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Chat App API',
      version: '1.0.0',
      description: 'Real-time chat application REST API documentation',
    },
    servers: [
      { url: `http://localhost:${env.PORT}`, description: 'Local Development' },
    ],
    components: {
      securitySchemes: {
        cookieAuth: { type: 'apiKey', in: 'cookie', name: 'accessToken' },
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ cookieAuth: [] }, { bearerAuth: [] }],
  },
  // Scan route files in both dev (ts) and compiled (js) layouts.
  apis: ['./src/routes/*.ts', './dist/routes/*.js'],
};

export function setupSwagger(app: Express): void {
  const spec = swaggerJSDoc(options);
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(spec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Chat App API Docs',
    }),
  );
  app.get('/api/docs.json', (_req, res) => res.json(spec));
}
