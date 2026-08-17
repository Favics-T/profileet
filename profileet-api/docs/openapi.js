
module.exports = {
  openapi: '3.0.0',

  
  info: {
    title: 'Profileet API',
    version: '1.0.0',
    description: `
## Overview
Profileet is a fashion-designer management platform. This API powers
designer profiles, bookings, availability, portfolios, reviews, inquiries,
and messaging.

## Authentication
Most endpoints require a **Bearer JWT** token obtained from \`POST /auth/login\`
or \`POST /auth/signup\`. Pass it in the \`Authorization\` header:

\`\`\`
Authorization: Bearer <token>
\`\`\`

Some endpoints are **role-restricted**:
- \`designer\` – logged-in designers only
- \`admin\` – one of: \`super_admin\`, \`profile_manager\`, \`support_agent\`, \`auditor\`

A handful of endpoints (\`GET /designers\`, \`GET /designers/:id\`, \`POST /profile/views\`) are **public** — no token required.

## Rate Limiting
Auth endpoints (\`/auth/signup\`, \`/auth/login\`, \`/auth/admin/login\`) are
individually rate-limited. All other endpoints share a general rate limiter.

## Error Format
All error responses follow:
\`\`\`json
{ "error": "Human-readable message" }
\`\`\`
    `.trim(),
    contact: {
      name: 'Profileet Engineering',
    },
  },

  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local development server',
    },
  ],

 
  // Tag groups (displayed in Swagger UI sidebar)
    tags: [
    {
      name: 'Auth',
      description:
        'User registration, login (designer + admin), password management, and token validation.',
    },
    {
      name: 'Designers',
      description:
        'Public read access to designer records. Write operations (update fields, add internal notes) are restricted to admin roles.',
    },
    {
      name: 'Profile',
      description:
        "Authenticated designer's own profile (name, bio, specialty, avatar). Separate from the `Designers` admin view.",
    },
    {
      name: 'Profile Views',
      description:
        'Record anonymous profile views (public) and retrieve view statistics (designer-only).',
    },
    {
      name: 'Availability',
      description:
        'Designer availability calendar. Entries map a date (`YYYY-MM-DD`) to a status of `open`, `busy`, or `off`.',
    },
    {
      name: 'Bookings',
      description:
        'Full booking lifecycle for a designer: create, read, update (partial), replace (full), and delete.',
    },
    {
      name: 'Reviews',
      description:
        'Designer reviews — create, list, reply, increment helpful count, and delete.',
    },
    {
      name: 'Portfolio',
      description:
        'Designer portfolio items (images + metadata). Supports bulk create, individual CRUD.',
    },
    {
      name: 'Inquiries',
      description:
        'Designer-specific inquiries. Status can be progressed through `New → Replied → Booked`.',
    },
    {
      name: 'Messages',
      description:
        'Conversation threads between a designer and clients. Supports listing, marking as read, and sending messages.',
    },
    {
      name: 'Client Profile',
      description:
        "Authenticated client's own profile and notification preferences.",
    },
  ],

 
  // Reusable components
  
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT issued by `POST /auth/login` or `POST /auth/signup`.',
      },
    },

    //  Shared error response 
    responses: {
      Unauthorized: {
        description: 'Missing, invalid, or expired bearer token.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: { error: 'Unauthorized' },
          },
        },
      },
      Forbidden: {
        description: 'Authenticated but insufficient role.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: { error: 'Forbidden' },
          },
        },
      },
      NotFound: {
        description: 'Resource not found.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: { error: 'Not found' },
          },
        },
      },
      InternalError: {
        description: 'Unexpected server error.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: { error: 'Internal server error' },
          },
        },
      },
    },

    schemas: {
      //  Generic shapes 
      Error: {
        type: 'object',
        description: 'Standard error envelope returned by all error responses.',
        required: ['error'],
        properties: {
          error: { type: 'string', description: 'Human-readable error message.' },
        },
      },

      //  Auth 
      AuthSignup: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          password: { type: 'string', minLength: 6, example: 'mypassword123' },
          role: {
            type: 'string',
            enum: ['designer', 'client'],
            default: 'client',
            example: 'designer',
          },
        },
      },

      AuthLogin: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          password: { type: 'string', example: 'mypassword123' },
        },
      },

      AuthTokenResponse: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: 'JWT bearer token. Include as `Authorization: Bearer <token>`.',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string' },
            },
          },
        },
      },

      ChangePassword: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string', example: 'oldpassword123' },
          newPassword: { type: 'string', minLength: 6, example: 'newpassword123' },
        },
      },

      //  Designer 
      Designer: {
        type: 'object',
        description: 'A designer record as stored and returned by the database.',
        properties: {
          id: { type: 'string', example: 'designer_123' },
          name: { type: 'string', example: 'Aisha Bello' },
          email: { type: 'string', example: 'aisha@example.com' },
          specialty: { type: 'string', example: 'Bridal Wear' },
          location: { type: 'string', example: 'Lagos' },
          rating: { type: 'number', example: 4.8 },
          reviews: { type: 'integer', example: 32 },
          startingPrice: { type: 'integer', example: 25000 },
          available: { type: 'boolean', example: true },
          status: { type: 'string', example: 'Active' },
          joined: { type: 'string', example: 'Jan 2024' },
          bio: { type: 'string', example: 'Luxury fashion designer.' },
          phone: { type: 'string', example: '+2348012345678' },
          yearsOfExperience: { type: 'integer', example: 7 },
          inquiries: { type: 'integer', example: 14 },
          bookings: { type: 'integer', example: 9 },
          initials: { type: 'string', example: 'AB' },
          color: { type: 'string', example: '#be185d' },
          styles: {
            type: 'array',
            items: { type: 'string' },
            example: ['Bridal', 'Evening Wear'],
          },
          notes: {
            type: 'array',
            items: { $ref: '#/components/schemas/DesignerNote' },
          },
        },
      },

      DesignerUpdate: {
        type: 'object',
        description:
          'All fields are optional. Only provided fields will be updated. **Admin-only operation.**',
        properties: {
          name: { type: 'string', example: 'Aisha Bello' },
          email: { type: 'string', format: 'email', example: 'aisha@example.com' },
          specialty: { type: 'string', example: 'Bridal Wear' },
          location: { type: 'string', example: 'Lagos' },
          rating: { type: 'number', example: 4.9 },
          reviews: { type: 'integer', example: 33 },
          startingPrice: { type: 'integer', example: 25000 },
          available: { type: 'boolean', example: true },
          status: { type: 'string', example: 'Active' },
          joined: { type: 'string', example: 'Jan 2024' },
          bio: { type: 'string', example: 'Luxury fashion designer.' },
          phone: { type: 'string', example: '+2348012345678' },
          yearsOfExperience: { type: 'integer', example: 7 },
          inquiries: { type: 'integer', example: 14 },
          bookings: { type: 'integer', example: 9 },
          initials: { type: 'string', example: 'AB' },
          color: { type: 'string', example: '#be185d' },
          styles: {
            type: 'array',
            items: { type: 'string' },
            example: ['Bridal', 'Evening Wear'],
          },
        },
      },

      DesignerNote: {
        type: 'object',
        description: 'An internal staff note attached to a designer record. Admin-only.',
        required: ['content'],
        properties: {
          id: { type: 'string', example: 'note_abc123' },
          designerId: { type: 'string', example: 'designer_123' },
          author: {
            type: 'string',
            default: 'Staff',
            example: 'Staff',
            description: 'Defaults to "Staff" if omitted.',
          },
          role: {
            type: 'string',
            default: 'support_agent',
            example: 'support_agent',
            description: 'Defaults to "support_agent" if omitted.',
          },
          content: { type: 'string', example: 'Client requested a callback.' },
          createdAt: { type: 'string', example: '12 Aug 2026' },
        },
      },

      //  Profile (designer self-serve) 
      DesignerProfile: {
        type: 'object',
        description: "The authenticated designer's editable profile.",
        properties: {
          id: { type: 'string' },
          designerId: { type: 'string' },
          fullName: { type: 'string', example: 'Aisha Bello' },
          specialty: { type: 'string', example: 'Bridal Wear' },
          location: { type: 'string', example: 'Lagos' },
          bio: { type: 'string', example: 'Luxury fashion designer.' },
          phone: { type: 'string', example: '+2348012345678' },
          yearsOfExperience: { type: 'integer', example: 7 },
          avatar: {
            type: 'string',
            nullable: true,
            example: 'https://example.com/avatar.jpg',
          },
        },
      },

      DesignerProfileUpdate: {
        type: 'object',
        description: 'All fields optional. Only provided fields will be updated.',
        properties: {
          fullName: { type: 'string', example: 'Aisha Bello' },
          specialty: { type: 'string', example: 'Bridal Wear' },
          location: { type: 'string', example: 'Lagos' },
          bio: { type: 'string', example: 'Luxury fashion designer.' },
          phone: { type: 'string', example: '+2348012345678' },
          yearsOfExperience: { type: 'integer', example: 7 },
          avatar: { type: 'string', example: 'https://example.com/avatar.jpg' },
        },
      },

      //  Client Profile 
      ClientProfile: {
        type: 'object',
        description: "The authenticated client's profile.",
        properties: {
          id: { type: 'string' },
          clientId: { type: 'string' },
          firstName: { type: 'string', example: 'Amina' },
          lastName: { type: 'string', example: 'Usman' },
          email: { type: 'string', format: 'email', example: 'amina@example.com' },
          phone: { type: 'string', example: '+2348011111111' },
          location: { type: 'string', example: 'Abuja' },
          bio: { type: 'string', example: 'Loves custom fashion.' },
          bookingUpdates: { type: 'boolean', example: true },
          newMessages: { type: 'boolean', example: true },
          promotions: { type: 'boolean', example: false },
          reminders: { type: 'boolean', example: true },
        },
      },

      ClientProfileUpdate: {
        type: 'object',
        description: 'All fields optional. Notification prefs are nested under `notifications`.',
        properties: {
          firstName: { type: 'string', example: 'Amina' },
          lastName: { type: 'string', example: 'Usman' },
          email: { type: 'string', format: 'email', example: 'amina@example.com' },
          phone: { type: 'string', example: '+2348011111111' },
          location: { type: 'string', example: 'Abuja' },
          bio: { type: 'string', example: 'Loves custom fashion.' },
          notifications: {
            type: 'object',
            properties: {
              bookingUpdates: { type: 'boolean', example: true },
              newMessages: { type: 'boolean', example: true },
              promotions: { type: 'boolean', example: false },
              reminders: { type: 'boolean', example: true },
            },
          },
        },
      },

      //  Availability 
      AvailabilityEntry: {
        type: 'object',
        required: ['date', 'status'],
        properties: {
          date: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}$',
            example: '2026-08-06',
            description: 'Must be in `YYYY-MM-DD` format.',
          },
          status: {
            type: 'string',
            enum: ['open', 'busy', 'off'],
            example: 'busy',
          },
        },
      },

      AvailabilityMap: {
        type: 'object',
        description:
          'A map of date strings to status values. Keys are `YYYY-MM-DD` dates.',
        additionalProperties: {
          type: 'string',
          enum: ['open', 'busy', 'off'],
        },
        example: {
          '2026-08-06': 'busy',
          '2026-08-07': 'open',
          '2026-08-08': 'off',
        },
      },

      AvailabilityUpdateResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Availability updated' },
          dayStatuses: { $ref: '#/components/schemas/AvailabilityMap' },
        },
      },

      // Booking 
      Booking: {
        type: 'object',
        description: 'A complete booking record as returned by the database.',
        properties: {
          id: { type: 'string', example: 'ckx123abc' },
          designerId: { type: 'string' },
          client: { type: 'string', example: 'Zainab Sani' },
          initials: { type: 'string', example: 'ZS' },
          clientColor: { type: 'string', example: '#be185d' },
          clientPhone: { type: 'string', example: '+2348099999999' },
          service: { type: 'string', example: 'Custom gown' },
          occasion: { type: 'string', example: 'Wedding' },
          deliveryDate: { type: 'string', example: '2026-09-12' },
          quantity: { type: 'integer', example: 1 },
          urgent: { type: 'boolean', example: false },
          status: {
            type: 'string',
            enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
            example: 'pending',
          },
          receivedAt: { type: 'string', format: 'date-time' },
          price: { type: 'integer', example: 85000 },
          depositPaid: { type: 'boolean', example: false },
          depositAmount: { type: 'integer', example: 25000 },
          designNotes: { type: 'string', example: 'Needs lace sleeves.' },
          fabrics: { type: 'array', items: { type: 'string' }, example: ['lace', 'silk'] },
          colors: { type: 'array', items: { type: 'string' }, example: ['gold', 'cream'] },
          inspirationRef: { type: 'string', example: 'Pinterest board link' },
          measurements: {
            type: 'object',
            example: { bust: '36', waist: '30' },
          },
          consultation: {
            type: 'object',
            example: { requested: true, status: 'pending' },
          },
        },
      },

      BookingCreate: {
        type: 'object',
        required: ['client', 'service', 'occasion', 'deliveryDate', 'price', 'depositAmount'],
        description:
          '`initials` and `clientColor` are auto-generated server-side. `status` always starts as `pending`.',
        properties: {
          client: { type: 'string', example: 'Zainab Sani' },
          service: { type: 'string', example: 'Custom gown' },
          occasion: { type: 'string', example: 'Wedding' },
          deliveryDate: { type: 'string', example: '2026-09-12' },
          price: { type: 'integer', example: 85000 },
          depositAmount: { type: 'integer', example: 25000 },
          clientPhone: { type: 'string', example: '+2348099999999' },
          quantity: { type: 'integer', default: 1, example: 1 },
          urgent: { type: 'boolean', default: false, example: false },
          designNotes: { type: 'string', example: 'Needs lace sleeves.' },
          fabrics: {
            type: 'array',
            items: { type: 'string' },
            example: ['lace', 'silk'],
          },
          colors: {
            type: 'array',
            items: { type: 'string' },
            example: ['gold', 'cream'],
          },
          inspirationRef: { type: 'string', example: 'Pinterest board link' },
          measurements: { type: 'object', example: { bust: '36', waist: '30' } },
          consultation: {
            type: 'object',
            example: { requested: true, status: 'pending' },
          },
        },
      },

      BookingUpdate: {
        type: 'object',
        description:
          'Partial update — only provided fields are changed. `consultation` and `measurements` are **merged** with existing values, not replaced.',
        properties: {
          status: {
            type: 'string',
            enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
          },
          depositPaid: { type: 'boolean' },
          consultation: { type: 'object' },
          designNotes: { type: 'string' },
          deliveryDate: { type: 'string' },
          price: { type: 'integer' },
          depositAmount: { type: 'integer' },
          urgent: { type: 'boolean' },
          quantity: { type: 'integer' },
          fabrics: { type: 'array', items: { type: 'string' } },
          colors: { type: 'array', items: { type: 'string' } },
          inspirationRef: { type: 'string' },
          measurements: { type: 'object' },
        },
      },

      //  Review
      Review: {
        type: 'object',
        description: 'A review record as returned by the database.',
        properties: {
          id: { type: 'string' },
          designerId: { type: 'string' },
          client: { type: 'string', example: 'Muna Ahmed' },
          initials: { type: 'string', example: 'MA' },
          color: { type: 'string', example: '#422a15' },
          service: { type: 'string', example: 'Bridal dress' },
          rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
          date: { type: 'string', example: '6 Aug 2026' },
          text: { type: 'string', example: 'Amazing work and fast delivery.' },
          bookingId: { type: 'string', nullable: true, example: 'ckx123abc' },
          reply: { type: 'string', nullable: true, example: 'Thank you!' },
          replied: { type: 'boolean', example: false },
          helpful: { type: 'integer', example: 0 },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      ReviewCreate: {
        type: 'object',
        required: ['client', 'service', 'text', 'rating'],
        description:
          '`initials` defaults to first letters of `client` name. `color` defaults to `#422a15`. `date` defaults to today.',
        properties: {
          client: { type: 'string', example: 'Muna Ahmed' },
          initials: { type: 'string', example: 'MA' },
          color: { type: 'string', example: '#422a15' },
          service: { type: 'string', example: 'Bridal dress' },
          rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
          date: { type: 'string', example: '6 Aug 2026' },
          text: { type: 'string', example: 'Amazing work and fast delivery.' },
          bookingId: { type: 'string', nullable: true, example: 'ckx123abc' },
        },
      },

      ReviewReply: {
        type: 'object',
        description:
          'At least one of `reply` or `incrementHelpful` must be provided, otherwise a `400` is returned.',
        properties: {
          reply: {
            type: 'string',
            description: 'Must be a non-empty string when provided.',
            example: 'Thank you for your kind words!',
          },
          incrementHelpful: {
            type: 'boolean',
            description: 'When `true`, increments the helpful counter by 1.',
            example: true,
          },
        },
      },

      //  Portfolio 
      PortfolioItem: {
        type: 'object',
        description: 'A portfolio item record as returned by the database.',
        properties: {
          id: { type: 'string' },
          designerId: { type: 'string' },
          title: { type: 'string', example: 'Golden Evening Gown' },
          tag: { type: 'string', default: 'Other', example: 'Evening Wear' },
          description: { type: 'string', example: 'Hand-beaded custom gown.' },
          imageUrl: { type: 'string', example: 'https://example.com/image.jpg' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      PortfolioItemCreate: {
        type: 'object',
        required: ['title', 'imageUrl'],
        description:
          'Accepts a **single object** or an **array** of objects. `tag` defaults to `"Other"` if omitted.',
        properties: {
          title: { type: 'string', example: 'Golden Evening Gown' },
          tag: { type: 'string', default: 'Other', example: 'Evening Wear' },
          description: { type: 'string', example: 'Hand-beaded custom gown.' },
          imageUrl: { type: 'string', example: 'https://example.com/image.jpg' },
        },
      },

      PortfolioItemUpdate: {
        type: 'object',
        description: 'All fields optional. Note: `imageUrl` cannot be updated after creation.',
        properties: {
          title: { type: 'string', example: 'Golden Evening Gown v2' },
          tag: { type: 'string', example: 'Bridal' },
          description: { type: 'string', example: 'Updated description.' },
        },
      },

      // Inquiry 
      Inquiry: {
        type: 'object',
        description: 'An inquiry record.',
        properties: {
          id: { type: 'string', example: 'inq_123' },
          designerId: { type: 'string' },
          status: {
            type: 'string',
            enum: ['New', 'Replied', 'Booked'],
            example: 'New',
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      InquiryUpdate: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['New', 'Replied', 'Booked'],
            example: 'Replied',
          },
        },
      },

      //  Messages 
      Conversation: {
        type: 'object',
        description: 'A message conversation thread.',
        properties: {
          id: { type: 'integer', example: 1 },
          designer: { type: 'string', example: 'Aisha Bello' },
          initials: { type: 'string', example: 'AB' },
          color: { type: 'string', example: '#be185d' },
          lastMessage: { type: 'string', example: 'Thanks for confirming!' },
          time: { type: 'string', example: '2:30 PM' },
          unread: { type: 'integer', example: 2 },
          messages: {
            type: 'array',
            items: { $ref: '#/components/schemas/Message' },
          },
        },
      },

      Message: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          from: { type: 'string', example: 'client' },
          text: { type: 'string', example: 'Hello, is this available?' },
          time: { type: 'string', example: 'Just now' },
        },
      },

      MessageCreate: {
        type: 'object',
        required: ['text'],
        properties: {
          text: {
            type: 'string',
            description: 'Must be a non-empty string.',
            example: 'Hello, is this available for pickup?',
          },
        },
      },

      //  Profile Views 
      ProfileViewStats: {
        type: 'object',
        properties: {
          total: { type: 'integer', example: 128 },
          thisWeek: { type: 'integer', example: 14 },
        },
      },
    },
  },

  
  // Default: all paths require auth unless overridden with security: []
   
    security: [{ bearerAuth: [] }],

  
  // Paths
  
  paths: {

    
    // AUTH
    
    '/auth/signup': {
      post: {
        tags: ['Auth'],
        operationId: 'authSignup',
        summary: 'Register a new user account',
        description:
          'Creates a new user (designer or client). Returns a JWT on success. No authentication required.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthSignup' },
              example: {
                name: 'Jane Doe',
                email: 'jane@example.com',
                password: 'mypassword123',
                role: 'designer',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Account created. Returns JWT and user object.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthTokenResponse' },
              },
            },
          },
          400: {
            description: 'Missing required fields (`name`, `email`, or `password`).',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          409: {
            description: 'Email is already registered.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    '/auth/login': {
      post: {
        tags: ['Auth'],
        operationId: 'authLogin',
        summary: 'Log in as a designer or client',
        description: 'Authenticates a user and returns a signed JWT. No authentication required.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthLogin' },
              example: { email: 'jane@example.com', password: 'mypassword123' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful. Returns JWT and user object.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthTokenResponse' },
              },
            },
          },
          400: {
            description: 'Missing `email` or `password`.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          401: {
            description: 'Invalid credentials.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    '/auth/admin/login': {
      post: {
        tags: ['Auth'],
        operationId: 'authAdminLogin',
        summary: 'Log in as an admin',
        description:
          'Authenticates an admin-role user (`super_admin`, `profile_manager`, etc.) and returns a JWT. No authentication required.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthLogin' },
              example: { email: 'super@styledkraft.com', password: 'super123' },
            },
          },
        },
        responses: {
          200: {
            description: 'Admin login successful. Returns JWT.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthTokenResponse' },
              },
            },
          },
          400: {
            description: 'Missing `email` or `password`.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          401: {
            description: 'Invalid credentials or account is not an admin role.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    '/auth/password': {
      patch: {
        tags: ['Auth'],
        operationId: 'authChangePassword',
        summary: 'Change the logged-in user\'s password',
        description:
          'Verifies the current password then updates it. Requires bearer token. New password must be at least 6 characters.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChangePassword' },
              example: { currentPassword: 'oldpassword123', newPassword: 'newpassword123' },
            },
          },
        },
        responses: {
          200: {
            description: 'Password updated successfully.',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { message: { type: 'string' } } },
                example: { message: 'Password updated successfully' },
              },
            },
          },
          400: {
            description: 'Missing fields or new password is fewer than 6 characters.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          401: {
            description: 'Current password is incorrect, or no valid bearer token.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          404: {
            description: 'Authenticated user not found in the database.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    '/auth/test-protected': {
      get: {
        tags: ['Auth'],
        operationId: 'authTestProtected',
        summary: 'Validate a bearer token',
        description:
          '**Dev/debug utility.** Returns `200` if the supplied bearer token is valid and not expired. Useful for health-checking auth in integrations.',
        responses: {
          200: {
            description: 'Token is valid.',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { message: { type: 'string' }, userId: { type: 'string' } } },
                example: { message: 'Token valid', userId: 'user_abc' },
              },
            },
          },
          401: {
            description: 'No token supplied, or token is invalid / expired.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },

    
    // DESIGNERS 
    
    '/designers': {
      get: {
        tags: ['Designers'],
        operationId: 'listDesigners',
        summary: 'List all designers',
        description:
          '**Public endpoint — no authentication required.** Returns all designer records including their internal notes array.',
        security: [],
        responses: {
          200: {
            description: 'Array of designer objects.',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Designer' } },
              },
            },
          },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    '/designers/{id}': {
      get: {
        tags: ['Designers'],
        operationId: 'getDesigner',
        summary: 'Get a single designer by ID',
        description: '**Public endpoint — no authentication required.**',
        security: [],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            example: 'designer_123',
          },
        ],
        responses: {
          200: {
            description: 'Designer found.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Designer' },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },

      patch: {
        tags: ['Designers'],
        operationId: 'updateDesigner',
        summary: "Update a designer's fields (admin only)",
        description:
          'Partially updates a designer record. **Requires admin role** (`super_admin`, `profile_manager`, `support_agent`, or `auditor`). All body fields are optional.',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            example: 'designer_123',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DesignerUpdate' },
              example: { specialty: 'Bridal Wear', rating: 4.9, available: true },
            },
          },
        },
        responses: {
          200: {
            description: 'Designer updated successfully.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Designer' } },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    '/designers/{id}/notes': {
      post: {
        tags: ['Designers'],
        operationId: 'addDesignerNote',
        summary: 'Add an internal staff note to a designer (admin only)',
        description:
          'Creates an internal note on a designer record. **Requires admin role.** `author` defaults to `"Staff"` and `role` defaults to `"support_agent"` if omitted.',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            example: 'designer_123',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DesignerNote' },
              example: {
                author: 'Staff',
                role: 'support_agent',
                content: 'Client requested a callback.',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Note created and returned.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/DesignerNote' } },
            },
          },
          400: {
            description: '`content` is missing or blank.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

   
    // PROFILE  (designer self-serve, role: designer)
    
    '/profile': {
      get: {
        tags: ['Profile'],
        operationId: 'getMyProfile',
        summary: "Get the authenticated designer's profile",
        description:
          'Returns the profile for the currently logged-in designer. If no profile record exists yet, an empty one is created automatically.',
        responses: {
          200: {
            description: "Designer's profile.",
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/DesignerProfile' } },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },

      patch: {
        tags: ['Profile'],
        operationId: 'updateMyProfile',
        summary: "Update the authenticated designer's profile",
        description: 'All fields are optional. Only provided fields are updated.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DesignerProfileUpdate' },
              example: {
                fullName: 'Aisha Bello',
                specialty: 'Bridal Wear',
                location: 'Lagos',
                bio: 'Luxury fashion designer.',
                phone: '+2348012345678',
                yearsOfExperience: 7,
                avatar: 'https://example.com/avatar.jpg',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Profile updated. Returns the updated profile object.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/DesignerProfile' } },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    '/profile/{designerId}/availability': {
      get: {
        tags: ['Profile'],
        operationId: 'getDesignerAvailabilityByProfile',
        summary: "Get a designer's availability by their designer ID",
        description:
          'Looks up availability entries for any designer by their `designerId`. Requires a valid bearer token.',
        parameters: [
          {
            in: 'path',
            name: 'designerId',
            required: true,
            schema: { type: 'string' },
            example: 'designer_123',
          },
        ],
        responses: {
          200: {
            description: 'Availability entries for the given designer.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    availability: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          day: { type: 'string' },
                          status: { type: 'string', enum: ['open', 'busy', 'off'] },
                        },
                      },
                    },
                  },
                },
                example: {
                  availability: [
                    { day: 'Mon', status: 'open' },
                    { day: 'Tue', status: 'busy' },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

   
    // PROFILE VIEWS
    
    '/profile/views': {
      post: {
        tags: ['Profile Views'],
        operationId: 'recordProfileView',
        summary: 'Record a profile view',
        description:
          '**Public endpoint — no authentication required.** Increments the global profile view counter. Typically called when a visitor loads a designer\'s public profile page.',
        security: [],
        responses: {
          201: {
            description: 'View recorded.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { success: { type: 'boolean' } },
                },
                example: { success: true },
              },
            },
          },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    '/profile/views/stats': {
      get: {
        tags: ['Profile Views'],
        operationId: 'getProfileViewStats',
        summary: 'Get profile view statistics',
        description:
          'Returns the total view count and this-week view count. **Requires designer role.**',
        responses: {
          200: {
            description: 'View statistics.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProfileViewStats' },
                example: { total: 128, thisWeek: 14 },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

   
    // AVAILABILITY  (role: designer)
    
    '/availability/weekdays': {
      get: {
        tags: ['Availability'],
        operationId: 'getWeekdayLabels',
        summary: 'Get weekday labels',
        description:
          'Returns the ordered weekday label array used by the UI calendar: `["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]`. Requires designer auth.',
        responses: {
          200: {
            description: 'Weekday labels.',
            content: {
              'application/json': {
                schema: { type: 'array', items: { type: 'string' } },
                example: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    '/availability': {
      get: {
        tags: ['Availability'],
        operationId: 'getAvailability',
        summary: 'Get all availability entries for the logged-in designer',
        description:
          'Returns a map of `{ "YYYY-MM-DD": "open" | "busy" | "off" }` for all dates the designer has set.',
        responses: {
          200: {
            description: 'Availability map.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AvailabilityMap' } },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },

      post: {
        tags: ['Availability'],
        operationId: 'upsertAvailability',
        summary: 'Create or update availability entries',
        description:
          'Accepts a **single entry object** or an **array** of entries. For each entry: if a record for that `date` already exists, it is updated; otherwise it is created (upsert).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  { $ref: '#/components/schemas/AvailabilityEntry' },
                  {
                    type: 'array',
                    items: { $ref: '#/components/schemas/AvailabilityEntry' },
                  },
                ],
              },
              example: [
                { date: '2026-08-06', status: 'busy' },
                { date: '2026-08-07', status: 'open' },
              ],
            },
          },
        },
        responses: {
          200: {
            description: 'Availability updated. Returns all current entries for the designer.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AvailabilityUpdateResponse' } },
            },
          },
          400: {
            description:
              'Validation error — missing `date`/`status`, invalid status value, or `date` not in `YYYY-MM-DD` format.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    '/availability/{date}': {
      get: {
        tags: ['Availability'],
        operationId: 'getAvailabilityByDate',
        summary: 'Get availability for a specific date',
        parameters: [
          {
            in: 'path',
            name: 'date',
            required: true,
            schema: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
            example: '2026-08-06',
            description: '`YYYY-MM-DD` format.',
          },
        ],
        responses: {
          200: {
            description: 'Availability entry for the date.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AvailabilityEntry' },
                example: { date: '2026-08-06', status: 'busy' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: {
            description: 'No availability entry exists for this date.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },

      delete: {
        tags: ['Availability'],
        operationId: 'deleteAvailabilityByDate',
        summary: 'Delete availability for a specific date',
        description: 'Removes the availability entry for the given date and returns the updated map.',
        parameters: [
          {
            in: 'path',
            name: 'date',
            required: true,
            schema: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
            example: '2026-08-06',
          },
        ],
        responses: {
          200: {
            description: 'Entry removed. Returns the updated availability map.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AvailabilityUpdateResponse' } },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: {
            description: 'No entry found for this date.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    
    // BOOKINGS  (role: designer)
    
    '/bookings': {
      get: {
        tags: ['Bookings'],
        operationId: 'listBookings',
        summary: 'List all bookings for the logged-in designer',
        description: 'Returns bookings ordered by `createdAt` descending.',
        responses: {
          200: {
            description: 'Array of booking objects.',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Booking' } },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },

      post: {
        tags: ['Bookings'],
        operationId: 'createBooking',
        summary: 'Create a new booking',
        description:
          '`initials` and `clientColor` are auto-generated. `status` is always initialised as `pending`. `depositPaid` is always `false` on creation.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BookingCreate' },
              example: {
                client: 'Zainab Sani',
                service: 'Custom gown',
                occasion: 'Wedding',
                deliveryDate: '2026-09-12',
                price: 85000,
                depositAmount: 25000,
                clientPhone: '+2348099999999',
                quantity: 1,
                urgent: false,
                designNotes: 'Needs lace sleeves.',
                fabrics: ['lace', 'silk'],
                colors: ['gold', 'cream'],
                inspirationRef: 'Pinterest board link',
                measurements: { bust: '36', waist: '30' },
                consultation: { requested: true, status: 'pending' },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Booking created. Returns the new booking object.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Booking' } },
            },
          },
          400: {
            description:
              'Missing one or more required fields: `client`, `service`, `occasion`, `deliveryDate`, `price`, `depositAmount`.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    '/bookings/{id}': {
      get: {
        tags: ['Bookings'],
        operationId: 'getBooking',
        summary: 'Get a booking by ID',
        description: 'Only returns the booking if it belongs to the authenticated designer.',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            example: 'ckx123abc',
          },
        ],
        responses: {
          200: {
            description: 'Booking found.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Booking' } },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },

      patch: {
        tags: ['Bookings'],
        operationId: 'patchBooking',
        summary: 'Partially update a booking',
        description:
          'Updates only the supplied fields. `consultation` and `measurements` are **deep-merged** with the existing values rather than replaced entirely.',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            example: 'ckx123abc',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BookingUpdate' },
              example: { status: 'accepted', depositPaid: true },
            },
          },
        },
        responses: {
          200: {
            description: 'Booking updated. Returns the updated booking object.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Booking' } },
            },
          },
          400: {
            description: '`status` value is not one of the allowed enum values.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },

      put: {
        tags: ['Bookings'],
        operationId: 'replaceBooking',
        summary: 'Replace a booking (full update)',
        description:
          'Performs a full replacement of the booking. All required fields must be supplied. `initials`, `clientColor`, and `receivedAt` are preserved from the original record.',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            example: 'ckx123abc',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BookingCreate' },
              example: {
                client: 'Zainab Sani',
                service: 'Custom gown',
                occasion: 'Wedding',
                deliveryDate: '2026-09-12',
                price: 85000,
                depositAmount: 25000,
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Booking replaced. Returns the updated booking object.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Booking' } },
            },
          },
          400: {
            description: 'One or more required fields are missing.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },

      delete: {
        tags: ['Bookings'],
        operationId: 'deleteBooking',
        summary: 'Delete a booking',
        description: 'Permanently deletes the booking. Only the owning designer can delete.',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            example: 'ckx123abc',
          },
        ],
        responses: {
          200: {
            description: 'Booking deleted. Returns the deleted object.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Booking ckx123abc deleted' },
                    deleted: { $ref: '#/components/schemas/Booking' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    
    // REVIEWS  (role: designer)
   
    '/reviews': {
      get: {
        tags: ['Reviews'],
        operationId: 'listReviews',
        summary: 'List all reviews for the logged-in designer',
        description: 'Returns reviews ordered by `createdAt` descending.',
        responses: {
          200: {
            description: 'Array of review objects.',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Review' } },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },

      post: {
        tags: ['Reviews'],
        operationId: 'createReview',
        summary: 'Create a review',
        description:
          '`initials` defaults to the first letters of the client name. `color` defaults to `#422a15`. `date` defaults to today in `"D Mon YYYY"` format.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReviewCreate' },
              example: {
                client: 'Muna Ahmed',
                initials: 'MA',
                color: '#422a15',
                service: 'Bridal dress',
                rating: 5,
                date: '6 Aug 2026',
                text: 'Amazing work and fast delivery.',
                bookingId: 'ckx123abc',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Review created. Returns the new review object.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Review' } },
            },
          },
          400: {
            description:
              'Missing required field (`client`, `service`, `text`, or `rating`), or `rating` is not in 1–5.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    '/reviews/{id}': {
      get: {
        tags: ['Reviews'],
        operationId: 'getReview',
        summary: 'Get a single review by ID',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            example: 'review_123',
          },
        ],
        responses: {
          200: {
            description: 'Review found.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Review' } },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },

      patch: {
        tags: ['Reviews'],
        operationId: 'updateReview',
        summary: 'Reply to a review or increment its helpful count',
        description:
          'At least one of `reply` or `incrementHelpful: true` must be present, otherwise a `400` is returned. `reply` must be a non-empty string.',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            example: 'review_123',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReviewReply' },
              example: { reply: 'Thank you for your kind words!', incrementHelpful: true },
            },
          },
        },
        responses: {
          200: {
            description: 'Review updated. Returns the updated review object.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Review' } },
            },
          },
          400: {
            description:
              'No actionable field supplied, or `reply` is an empty string.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },

      delete: {
        tags: ['Reviews'],
        operationId: 'deleteReview',
        summary: 'Delete a review',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            example: 'review_123',
          },
        ],
        responses: {
          200: {
            description: 'Review deleted. Returns the deleted object.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Review review_123 deleted' },
                    deleted: { $ref: '#/components/schemas/Review' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    
    // PORTFOLIO  (role: designer)
   
    '/portfolio': {
      get: {
        tags: ['Portfolio'],
        operationId: 'listPortfolioItems',
        summary: 'List portfolio items for the logged-in designer',
        description: 'Returns items ordered by `createdAt` descending.',
        responses: {
          200: {
            description: 'Array of portfolio items.',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/PortfolioItem' } },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },

      post: {
        tags: ['Portfolio'],
        operationId: 'createPortfolioItems',
        summary: 'Create one or more portfolio items',
        description:
          'Accepts a **single item object** or an **array** of items. Returns a single object if the request body was a single object, or an array if it was an array.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  { $ref: '#/components/schemas/PortfolioItemCreate' },
                  {
                    type: 'array',
                    items: { $ref: '#/components/schemas/PortfolioItemCreate' },
                  },
                ],
              },
              example: [
                {
                  title: 'Golden Evening Gown',
                  tag: 'Evening Wear',
                  description: 'Hand-beaded custom gown.',
                  imageUrl: 'https://example.com/image.jpg',
                },
              ],
            },
          },
        },
        responses: {
          201: {
            description: 'Item(s) created.',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    { $ref: '#/components/schemas/PortfolioItem' },
                    { type: 'array', items: { $ref: '#/components/schemas/PortfolioItem' } },
                  ],
                },
              },
            },
          },
          400: {
            description: 'One or more items are missing `title` or `imageUrl`.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    '/portfolio/{id}': {
      get: {
        tags: ['Portfolio'],
        operationId: 'getPortfolioItem',
        summary: 'Get a single portfolio item by ID',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            example: 'portfolio_456',
          },
        ],
        responses: {
          200: {
            description: 'Portfolio item found.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PortfolioItem' } },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },

      patch: {
        tags: ['Portfolio'],
        operationId: 'updatePortfolioItem',
        summary: 'Update a portfolio item',
        description:
          'Updates `title`, `tag`, and/or `description`. Note: `imageUrl` cannot be changed after creation.',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            example: 'portfolio_456',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PortfolioItemUpdate' },
              example: { title: 'Golden Evening Gown v2', tag: 'Bridal' },
            },
          },
        },
        responses: {
          200: {
            description: 'Portfolio item updated.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PortfolioItem' } },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },

      delete: {
        tags: ['Portfolio'],
        operationId: 'deletePortfolioItem',
        summary: 'Delete a portfolio item',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            example: 'portfolio_456',
          },
        ],
        responses: {
          200: {
            description: 'Item deleted. Returns the deleted object.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Portfolio item portfolio_456 deleted' },
                    deleted: { $ref: '#/components/schemas/PortfolioItem' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    
    // INQUIRIES  (role: designer)
    
    '/inquiries': {
      get: {
        tags: ['Inquiries'],
        operationId: 'listInquiries',
        summary: 'List all inquiries for the logged-in designer',
        description: 'Returns inquiries ordered by `createdAt` descending. **Requires designer role.**',
        responses: {
          200: {
            description: 'Array of inquiry objects.',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Inquiry' } },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    '/inquiries/{id}': {
      get: {
        tags: ['Inquiries'],
        operationId: 'getInquiry',
        summary: 'Get a single inquiry by ID',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            example: 'inq_123',
          },
        ],
        responses: {
          200: {
            description: 'Inquiry found.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Inquiry' } },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },

      patch: {
        tags: ['Inquiries'],
        operationId: 'updateInquiryStatus',
        summary: 'Update inquiry status',
        description: 'Advances the status of an inquiry. `status` is required.',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            example: 'inq_123',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/InquiryUpdate' },
              example: { status: 'Replied' },
            },
          },
        },
        responses: {
          200: {
            description: 'Inquiry updated. Returns the updated inquiry object.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Inquiry' } },
            },
          },
          400: {
            description: '`status` is missing or not one of `New`, `Replied`, `Booked`.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    
    // MESSAGES  (role: designer)
    
    '/messages': {
      get: {
        tags: ['Messages'],
        operationId: 'listConversations',
        summary: 'List all message conversations for the logged-in designer',
        description: 'Returns conversations with their full message history, ordered by ID ascending.',
        responses: {
          200: {
            description: 'Array of conversation objects.',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Conversation' } },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    '/messages/{id}/read': {
      patch: {
        tags: ['Messages'],
        operationId: 'markConversationRead',
        summary: 'Mark a conversation as read',
        description: 'Sets `unread` count to `0` for the conversation.',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' },
            example: 1,
            description: 'Numeric conversation ID.',
          },
        ],
        responses: {
          200: {
            description: 'Conversation marked as read. Returns the updated conversation.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Conversation' } },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: {
            description: 'Conversation not found.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    '/messages/{id}/messages': {
      post: {
        tags: ['Messages'],
        operationId: 'sendMessage',
        summary: 'Send a message in a conversation',
        description:
          'Creates a new `Message` in the conversation and updates the conversation\'s `lastMessage` and `time`. `text` must be a non-empty string.',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' },
            example: 1,
            description: 'Numeric conversation ID.',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MessageCreate' },
              example: { text: 'Hello, is this available for pickup?' },
            },
          },
        },
        responses: {
          201: {
            description: 'Message sent. Returns the new message object.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Message' } },
            },
          },
          400: {
            description: '`text` is missing or blank.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: {
            description: 'Conversation not found.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    
    // CLIENT PROFILE  (role: client)
    
    '/client/profile': {
      get: {
        tags: ['Client Profile'],
        operationId: 'getClientProfile',
        summary: "Get the authenticated client's profile",
        description:
          'Returns the client profile. If no record exists yet, an empty one is created automatically. **Requires client role.**',
        responses: {
          200: {
            description: "Client's profile.",
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ClientProfile' } },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },

      patch: {
        tags: ['Client Profile'],
        operationId: 'updateClientProfile',
        summary: "Update the authenticated client's profile",
        description:
          'All fields optional. Notification preferences are nested under `notifications`. Internally the prefs are flattened into individual boolean columns.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ClientProfileUpdate' },
              example: {
                firstName: 'Amina',
                lastName: 'Usman',
                email: 'amina@example.com',
                phone: '+2348011111111',
                location: 'Abuja',
                bio: 'Loves custom fashion.',
                notifications: {
                  bookingUpdates: true,
                  newMessages: true,
                  promotions: false,
                  reminders: true,
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Profile updated. Returns the updated profile.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ClientProfile' } },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
  },
}
