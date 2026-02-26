module.exports = {
  openapi: '3.0.0',
  info: { title: 'Booking Service API', version: '1.0.0', description: 'Booking orchestration for AKS' },
  servers: [{ url: '/', description: 'Current' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Booking: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string' },
          eventId: { type: 'string' },
          quantity: { type: 'integer' },
          status: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/bookings': {
      post: {
        summary: 'Create a booking',
        description: 'Validates JWT, verifies event, reserves seats, creates booking, notifies.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['eventId', 'quantity'],
                properties: {
                  eventId: { type: 'integer', minimum: 1 },
                  quantity: { type: 'integer', minimum: 1 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Booking created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Booking' } } } },
          400: { description: 'Validation error' },
          401: { description: 'Invalid or missing token' },
          404: { description: 'Event not found' },
          409: { description: 'Not enough seats' },
        },
      },
    },
    '/api/bookings/{id}': {
      get: {
        summary: 'Get booking by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Booking', content: { 'application/json': { schema: { $ref: '#/components/schemas/Booking' } } } },
          401: { description: 'Invalid or missing token' },
          403: { description: 'Forbidden' },
          404: { description: 'Booking not found' },
        },
      },
    },
  },
};
