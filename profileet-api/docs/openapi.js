module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Profileet API',
    version: '1.0.0',
    description: 'Profileet Documentation',
  },
  servers: [{ url: 'http://localhost:4000' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
      AuthSignup: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', example: 'jane@example.com' },
          password: { type: 'string', example: 'mypassword123' },
          role: { type: 'string', example: 'designer' },
        },
      },
      AuthLogin: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'jane@example.com' },
          password: { type: 'string', example: 'mypassword123' },
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
      DesignerUpdate: {
        type: 'object',
        properties: {
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
        },
      },
      DesignerNote: {
        type: 'object',
        required: ['content'],
        properties: {
          author: { type: 'string', example: 'Staff' },
          role: { type: 'string', example: 'support_agent' },
          content: { type: 'string', example: 'Client requested a callback.' },
        },
      },
      InquiryUpdate: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['New', 'Replied', 'Booked'], example: 'Replied' },
        },
      },
      ReviewCreate: {
        type: 'object',
        required: ['client', 'service', 'text', 'rating'],
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
        properties: {
          reply: { type: 'string', example: 'Thank you for your kind words!' },
          incrementHelpful: { type: 'boolean', example: true },
        },
      },
      PortfolioItem: {
        type: 'object',
        required: ['title', 'imageUrl'],
        properties: {
          title: { type: 'string', example: 'Golden Evening Gown' },
          tag: { type: 'string', example: 'Evening Wear' },
          description: { type: 'string', example: 'Hand-beaded custom gown.' },
          imageUrl: { type: 'string', example: 'https://example.com/image.jpg' },
        },
      },
      ClientProfile: {
        type: 'object',
        properties: {
          firstName: { type: 'string', example: 'Amina' },
          lastName: { type: 'string', example: 'Usman' },
          email: { type: 'string', example: 'amina@example.com' },
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
      AvailabilityEntry: {
        type: 'object',
        required: ['date', 'status'],
        properties: {
          date: { type: 'string', example: '2026-08-06' },
          status: { type: 'string', enum: ['open', 'busy', 'off'], example: 'busy' },
        },
      },
      BookingCreate: {
        type: 'object',
        required: ['client', 'service', 'occasion', 'deliveryDate', 'price', 'depositAmount'],
        properties: {
          client: { type: 'string', example: 'Zainab Sani' },
          service: { type: 'string', example: 'Custom gown' },
          occasion: { type: 'string', example: 'Wedding' },
          deliveryDate: { type: 'string', example: '2026-09-12' },
          price: { type: 'integer', example: 85000 },
          depositAmount: { type: 'integer', example: 25000 },
          clientPhone: { type: 'string', example: '+2348099999999' },
          quantity: { type: 'integer', example: 1 },
          urgent: { type: 'boolean', example: false },
          designNotes: { type: 'string', example: 'Needs lace sleeves.' },
          fabrics: { type: 'array', items: { type: 'string' }, example: ['lace', 'silk'] },
          colors: { type: 'array', items: { type: 'string' }, example: ['gold', 'cream'] },
          inspirationRef: { type: 'string', example: 'Pinterest board link' },
          measurements: { type: 'object', example: { bust: '36', waist: '30' } },
          consultation: { type: 'object', example: { requested: true, status: 'pending' } },
        },
      },
      BookingUpdate: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'] },
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
      MessageCreate: {
        type: 'object',
        required: ['text'],
        properties: {
          text: { type: 'string', example: 'Hello, is this available for pickup?' },
        },
      },
      ProfileViewAck: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Create a new user account',
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
          201: { description: 'Account created successfully' },
          400: { description: 'Missing required fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          409: { description: 'Email already in use', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in with email and password',
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
          200: { description: 'Logged in successfully' },
          400: { description: 'Missing email or password' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/admin/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in as an admin',
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
          200: { description: 'Logged in successfully' },
          400: { description: 'Missing email or password' },
          401: { description: 'Invalid admin credentials' },
        },
      },
    },
    '/auth/password': {
      patch: {
        tags: ['Auth'],
        summary: 'Change the logged-in user password',
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
          200: { description: 'Password updated successfully' },
          400: { description: 'Missing fields or new password too short' },
          401: { description: 'Current password incorrect, or not authenticated' },
          404: { description: 'User not found' },
        },
      },
    },
    '/auth/test-protected': {
      get: {
        tags: ['Auth'],
        summary: 'Check whether a bearer token is valid',
        responses: {
          200: { description: 'Token is valid' },
          401: { description: 'No token or invalid/expired token' },
        },
      },
    },
    '/designers': {
      get: {
        tags: ['Designers'],
        summary: 'List all designers',
        responses: { 200: { description: 'List of designers' } },
      },
    },
    '/designers/{id}': {
      get: {
        tags: ['Designers'],
        summary: 'Get a single designer by id',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, example: 'designer_123' }],
        responses: { 200: { description: 'Designer found' }, 404: { description: 'Designer not found' } },
      },
      patch: {
        tags: ['Designers'],
        summary: "Update a designer's fields",
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, example: 'designer_123' }],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DesignerUpdate' },
              example: { specialty: 'Bridal Wear', rating: 4.9, available: true },
            },
          },
        },
        responses: { 200: { description: 'Designer updated' }, 404: { description: 'Designer not found' } },
      },
    },
    '/designers/{id}/notes': {
      post: {
        tags: ['Designers'],
        summary: 'Add an internal note to a designer',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, example: 'designer_123' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DesignerNote' },
              example: { author: 'Staff', role: 'support_agent', content: 'Client requested a callback.' },
            },
          },
        },
        responses: { 201: { description: 'Note created' }, 400: { description: 'Missing note content' }, 404: { description: 'Designer not found' } },
      },
    },
    '/inquiries': {
      get: {
        tags: ['Inquiries'],
        summary: 'List inquiries',
        responses: { 200: { description: 'List of inquiries' } },
      },
    },
    '/inquiries/{id}': {
      get: {
        tags: ['Inquiries'],
        summary: 'Get an inquiry by id',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, example: 'inq_123' }],
        responses: { 200: { description: 'Inquiry found' }, 404: { description: 'Inquiry not found' } },
      },
      patch: {
        tags: ['Inquiries'],
        summary: 'Update inquiry status',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, example: 'inq_123' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/InquiryUpdate' },
              example: { status: 'Replied' },
            },
          },
        },
        responses: { 200: { description: 'Inquiry updated' }, 400: { description: 'Invalid status' }, 404: { description: 'Inquiry not found' } },
      },
    },
    '/messages': {
      get: {
        tags: ['Messages'],
        summary: 'List message conversations',
        responses: { 200: { description: 'List of conversations' } },
      },
    },
    '/messages/{id}/read': {
      patch: {
        tags: ['Messages'],
        summary: 'Mark a conversation as read',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' }, example: 1 }],
        responses: { 200: { description: 'Conversation updated' } },
      },
    },
    '/messages/{id}/messages': {
      post: {
        tags: ['Messages'],
        summary: 'Send a message in a conversation',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' }, example: 1 }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MessageCreate' },
              example: { text: 'Hello, is this available for pickup?' },
            },
          },
        },
        responses: { 201: { description: 'Message created' } },
      },
    },
    '/profile': {
      get: {
        tags: ['Profile'],
        summary: 'Get the logged-in designer profile',
        responses: { 200: { description: 'Designer profile' } },
      },
      patch: {
        tags: ['Profile'],
        summary: 'Update the logged-in designer profile',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
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
        responses: { 200: { description: 'Profile updated' } },
      },
    },
    '/profile/views': {
      post: {
        tags: ['Profile Views'],
        summary: 'Record a profile view',
        responses: {
          201: {
            description: 'View recorded',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ProfileViewAck' }, example: { success: true } } },
          },
        },
      },
    },
    '/profile/views/stats': {
      get: {
        tags: ['Profile Views'],
        summary: 'Get profile view stats',
        responses: {
          200: {
            description: 'View statistics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    total: { type: 'integer', example: 128 },
                    thisWeek: { type: 'integer', example: 14 },
                  },
                },
                example: { total: 128, thisWeek: 14 },
              },
            },
          },
        },
      },
    },
    '/reviews': {
      get: {
        tags: ['Reviews'],
        summary: 'List reviews',
        responses: { 200: { description: 'Review list' } },
      },
      post: {
        tags: ['Reviews'],
        summary: 'Create a review',
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
        responses: { 201: { description: 'Review created' } },
      },
    },
    '/reviews/{id}': {
      get: {
        tags: ['Reviews'],
        summary: 'Get a review by id',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, example: 'review_123' }],
        responses: { 200: { description: 'Review found' }, 404: { description: 'Review not found' } },
      },
      patch: {
        tags: ['Reviews'],
        summary: 'Reply to a review or increment helpful count',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, example: 'review_123' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReviewReply' },
              example: { reply: 'Thank you for your kind words!', incrementHelpful: true },
            },
          },
        },
        responses: { 200: { description: 'Review updated' } },
      },
      delete: {
        tags: ['Reviews'],
        summary: 'Delete a review',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, example: 'review_123' }],
        responses: { 200: { description: 'Review deleted' } },
      },
    },
    '/portfolio': {
      get: {
        tags: ['Portfolio'],
        summary: 'List portfolio items',
        responses: { 200: { description: 'Portfolio items' } },
      },
      post: {
        tags: ['Portfolio'],
        summary: 'Create portfolio item(s)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PortfolioItem' },
              example: { title: 'Golden Evening Gown', tag: 'Evening Wear', description: 'Hand-beaded custom gown.', imageUrl: 'https://example.com/image.jpg' },
            },
          },
        },
        responses: { 201: { description: 'Portfolio item created' } },
      },
    },
    '/client/profile': {
      get: {
        tags: ['Client Profile'],
        summary: 'Get the logged-in client profile',
        responses: { 200: { description: 'Client profile' } },
      },
      patch: {
        tags: ['Client Profile'],
        summary: 'Update the logged-in client profile',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ClientProfile' },
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
        responses: { 200: { description: 'Client profile updated' } },
      },
    },
    '/availability/weekdays': {
      get: {
        tags: ['Availability'],
        summary: 'List weekday labels',
        responses: {
          200: {
            description: 'Weekday labels',
            content: { 'application/json': { schema: { type: 'array', items: { type: 'string' } }, example: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] } },
          },
        },
      },
    },
    '/availability': {
      get: {
        tags: ['Availability'],
        summary: 'Get all availability entries',
        responses: { 200: { description: 'Availability map' } },
      },
      post: {
        tags: ['Availability'],
        summary: 'Create or update availability entries',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  { $ref: '#/components/schemas/AvailabilityEntry' },
                  { type: 'array', items: { $ref: '#/components/schemas/AvailabilityEntry' } },
                ],
              },
              example: [
                { date: '2026-08-06', status: 'busy' },
                { date: '2026-08-07', status: 'open' },
              ],
            },
          },
        },
        responses: { 200: { description: 'Availability updated' } },
      },
    },
    '/availability/{date}': {
      get: {
        tags: ['Availability'],
        summary: 'Get availability for a specific date',
        parameters: [{ in: 'path', name: 'date', required: true, schema: { type: 'string' }, example: '2026-08-06' }],
        responses: { 200: { description: 'Availability for the date' }, 404: { description: 'Date not found' } },
      },
      delete: {
        tags: ['Availability'],
        summary: 'Delete availability for a date',
        parameters: [{ in: 'path', name: 'date', required: true, schema: { type: 'string' }, example: '2026-08-06' }],
        responses: { 200: { description: 'Availability cleared' }, 404: { description: 'Date not found' } },
      },
    },
    '/bookings': {
      get: {
        tags: ['Bookings'],
        summary: 'List bookings for the logged-in designer',
        responses: { 200: { description: 'Booking list' } },
      },
      post: {
        tags: ['Bookings'],
        summary: 'Create a booking',
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
        responses: { 201: { description: 'Booking created' } },
      },
    },
    '/bookings/{id}': {
      get: {
        tags: ['Bookings'],
        summary: 'Get a booking by id',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, example: 'ckx123abc' }],
        responses: { 200: { description: 'Booking found' }, 404: { description: 'Booking not found' } },
      },
      patch: {
        tags: ['Bookings'],
        summary: 'Partially update a booking',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, example: 'ckx123abc' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BookingUpdate' },
              example: { status: 'accepted', depositPaid: true },
            },
          },
        },
        responses: { 200: { description: 'Booking updated' } },
      },
      put: {
        tags: ['Bookings'],
        summary: 'Replace a booking',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, example: 'ckx123abc' }],
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
        responses: { 200: { description: 'Booking replaced' } },
      },
      delete: {
        tags: ['Bookings'],
        summary: 'Delete a booking',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, example: 'ckx123abc' }],
        responses: { 200: { description: 'Booking deleted' } },
      },
    },
  },
}
