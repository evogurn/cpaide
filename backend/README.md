# CPAide Backend - Multi-Tenant AI Document Management SaaS

Production-ready Node.js + Express + PostgreSQL + Prisma backend with JWT authentication, RBAC, and RAG-powered AI search.

## 🚀 Features

- **Multi-Tenant Architecture** - Complete tenant isolation with row-level security
- **Authentication & Authorization** - JWT (access + refresh tokens), bcrypt password hashing
- **RBAC** - Role-based access control with granular permissions
- **Document Management** - Upload, organize, version, soft delete with folder hierarchy
- **RAG Pipeline** - AI-powered semantic search with vector embeddings
- **RESTful APIs** - Clean, standardized API design with Zod validation
- **Production Ready** - Logging, error handling, rate limiting, graceful shutdown

## 📁 Project Structure

```
backend/
├── src/
│   ├── ai/                    # RAG pipeline components
│   │   ├── chunker.js         # Text chunking
│   │   ├── embedder.js        # Embedding generation (OpenAI placeholder)
│   │   ├── rag-query.js       # Semantic search
│   │   ├── text-extractor.js  # OCR/text extraction
│   │   └── vector-store.js    # Vector database (pgvector/Qdrant)
│   ├── config/                # Configuration
│   │   ├── db.js              # Prisma client
│   │   ├── env.js             # Environment validation
│   │   └── logger.js          # Pino logger
│   ├── constants/             # Constants and enums
│   ├── controllers/           # Request handlers
│   ├── middlewares/           # Express middlewares
│   │   ├── auth.js            # JWT authentication
│   │   ├── errorHandler.js    # Global error handling
│   │   ├── rateLimiter.js     # Rate limiting
│   │   ├── rbac.js            # Role/permission checks
│   │   ├── tenant.js          # Tenant context
│   │   └── validate.js        # Zod validation
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   ├── utils/                 # Helper functions
│   └── validations/           # Zod schemas
├── server.js                  # Entry point
├── package.json
├── .env.example
└── README.md
```

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Logging**: Pino
- **File Storage**: S3 (placeholder)
- **Vector Search**: pgvector/Qdrant (placeholder)
- **AI**: OpenAI embeddings (placeholder)

## 📦 Installation

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- (Optional) Docker for local development

### Setup

1. **Clone and navigate**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Setup database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate

   # (Optional) Seed database
   npm run prisma:seed
   ```

5. **Start server**
   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm start
   ```

## 🔧 Environment Variables

See `.env.example` for all variables. Key ones:

```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/cpaaide"
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key
CORS_ORIGIN=http://localhost:5173
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

```http
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # Login
POST   /api/auth/refresh       # Refresh access token
POST   /api/auth/logout        # Logout
GET    /api/auth/me            # Get current user
```

### Document Endpoints

```http
POST   /api/documents/upload-url        # Get pre-signed upload URL
POST   /api/documents                   # Create document metadata
GET    /api/documents                   # List documents
GET    /api/documents/search            # Search documents
GET    /api/documents/:id               # Get document
GET    /api/documents/:id/download      # Get download URL
PATCH  /api/documents/:id               # Update document
POST   /api/documents/:id/move          # Move document
DELETE /api/documents/:id               # Delete document (soft)
POST   /api/documents/:id/restore       # Restore document
```

### Folder Endpoints

```http
POST   /api/folders              # Create folder
GET    /api/folders              # List folders
GET    /api/folders/:id          # Get folder
PATCH  /api/folders/:id          # Update folder
POST   /api/folders/:id/move     # Move folder
DELETE /api/folders/:id          # Delete folder (soft)
```

### AI/RAG Endpoints

```http
POST   /api/ai/query                    # Semantic search
POST   /api/ai/reprocess/:documentId    # Reprocess document
```

### User Management

```http
POST   /api/users              # Create user
GET    /api/users              # List users
GET    /api/users/:id          # Get user
PATCH  /api/users/:id          # Update user
DELETE /api/users/:id          # Delete user
POST   /api/users/:id/roles    # Assign roles
```

### Tenant Management (Super Admin only)

```http
POST   /api/tenants            # Create tenant
GET    /api/tenants            # List tenants
GET    /api/tenants/:id        # Get tenant
PATCH  /api/tenants/:id        # Update tenant
DELETE /api/tenants/:id        # Delete tenant
```

## 🔐 Authentication

The API uses JWT tokens:

1. **Login** to receive `accessToken` (15min) and `refreshToken` (7 days)
2. **Include** `Authorization: Bearer <accessToken>` in requests
3. **Refresh** when access token expires using `/api/auth/refresh`

## 🏗️ Multi-Tenancy

Tenant isolation via:
- **tenantId** in all data models
- Middleware extracts tenant from:
  1. Authenticated user
  2. `X-Tenant-Id` header
  3. Subdomain

## 🧪 Development

```bash
# Watch mode
npm run dev

# Prisma Studio (database GUI)
npm run prisma:studio

# Generate Prisma client after schema changes
npm run prisma:generate

# Create migration
npm run prisma:migrate
```

## 🚢 Production Deployment

1. **Set environment variables** (DATABASE_URL, JWT secrets, etc.)
2. **Run migrations**: `npm run prisma:migrate`
3. **Build** (if using TypeScript): `npm run build`
4. **Start**: `npm start`
5. **Setup reverse proxy** (nginx/Caddy)
6. **Enable HTTPS**
7. **Configure monitoring** (PM2, Docker, K8s)

## 📝 Database Schema

Key models:
- `Tenant` - Multi-tenant organization
- `User` - Users with roles
- `Role` + `Permission` - RBAC system
- `Folder` - Hierarchical folder structure
- `Document` - Files with metadata + versioning
- `Embedding` - Vector embeddings for RAG
- `AuditLog` - Activity tracking

## 🔌 Integration Placeholders

The following services have placeholder implementations ready for integration:

### File Storage (S3)
- `src/services/file.service.js` - Pre-signed URLs
- Add AWS SDK and implement methods

### Email (Nodemailer)
- `src/services/email.service.js` - SMTP configuration
- Configure SMTP and implement templates

### AI/Embeddings (OpenAI)
- `src/ai/embedder.js` - Embedding generation
- Add OpenAI SDK and API key

### Vector Search (pgvector/Qdrant)
- `src/ai/vector-store.js` - Vector similarity search
- Enable pgvector extension OR integrate Qdrant client

### OCR (Tesseract/AWS Textract)
- `src/ai/text-extractor.js` - Text extraction
- Add OCR library for document processing

## 🛡️ Security Features

- Helmet.js security headers
- Rate limiting (global + auth-specific)
- CORS configuration
- HTTP-only cookies for refresh tokens
- Bcrypt password hashing
- Input validation with Zod
- SQL injection prevention (Prisma)
- XSS protection

## 📊 Error Handling

Standardized error responses:

```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE",
  "details": {},
  "statusCode": 400
}
```

## 🤝 Contributing

1. Follow existing code patterns
2. Run `npm run prisma:generate` after schema changes
3. Validate with existing middleware and services
4. Test endpoints thoroughly

## 📄 License

MIT

## 🆘 Support

For issues or questions, refer to the inline code documentation and service placeholders.

---

**Ready for production deployment with proper environment configuration and service integrations!**
