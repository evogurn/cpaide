# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env - MINIMUM REQUIRED:
# DATABASE_URL="postgresql://user:password@localhost:5432/cpaaide"
# JWT_SECRET="your-secret-key-at-least-32-characters-long-please"
# JWT_REFRESH_SECRET="your-refresh-secret-key-32-chars-minimum"
```

### 3. Setup Database

**Option A: Local PostgreSQL**
```bash
# Create database
createdb cpaaide

# Run migrations
npm run prisma:migrate

# Seed initial data
npm run prisma:seed
```

**Option B: Docker PostgreSQL**
```bash
# Start PostgreSQL in Docker
docker run -d \
  --name cpaaide-postgres \
  -e POSTGRES_DB=cpaaide \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:14

# Update .env with: DATABASE_URL="postgresql://admin:password@localhost:5432/cpaaide"

# Run migrations and seed
npm run prisma:migrate
npm run prisma:seed
```

### 4. Start Server
```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

### 5. Test the API

**Health Check**
```bash
curl http://localhost:5000/api/health
```

**Login with Seed User**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "Admin@123",
    "tenantId": "TENANT_ID_FROM_DB"
  }'
```

## 📝 Default Credentials (after seed)

- **Email**: `admin@demo.com`
- **Password**: `Admin@123`
- **Tenant**: Demo Organization (subdomain: `demo`)

## 🔧 Common Commands

```bash
# View database in GUI
npm run prisma:studio

# Generate Prisma client (after schema changes)
npm run prisma:generate

# Create new migration
npm run prisma:migrate

# Reset database (CAREFUL!)
npx prisma migrate reset
```

## 📚 API Endpoints Overview

```
Base URL: http://localhost:5000/api

Auth:
  POST   /auth/register
  POST   /auth/login
  POST   /auth/refresh
  POST   /auth/logout
  GET    /auth/me

Documents:
  POST   /documents/upload-url
  POST   /documents
  GET    /documents
  GET    /documents/:id
  PATCH  /documents/:id
  DELETE /documents/:id

Folders:
  POST   /folders
  GET    /folders
  GET    /folders/:id
  PATCH  /folders/:id
  DELETE /folders/:id

AI:
  POST   /ai/query
  POST   /ai/reprocess/:documentId

Users:
  POST   /users
  GET    /users
  GET    /users/:id
  PATCH  /users/:id
  DELETE /users/:id
```

## 🐛 Troubleshooting

**Database connection error**
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `.env`
- Check credentials and database name

**JWT errors**
- Ensure JWT_SECRET and JWT_REFRESH_SECRET are at least 32 characters
- Check token expiry settings

**Port already in use**
- Change PORT in `.env` or kill process: `lsof -ti:5000 | xargs kill`

**Prisma client errors**
- Run: `npm run prisma:generate`

## 🔐 Security Checklist

Before production:
- [ ] Change all default passwords
- [ ] Generate strong JWT secrets (64+ chars)
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS
- [ ] Set up proper database backups
- [ ] Configure environment-specific settings
- [ ] Enable rate limiting appropriately
- [ ] Set up monitoring and logging

## 📖 Next Steps

1. **Configure integrations**:
   - AWS S3 for file storage
   - OpenAI for embeddings
   - SMTP for emails
   - Qdrant/pgvector for vector search

2. **Customize**:
   - Add custom business logic
   - Extend models as needed
   - Add more API endpoints

3. **Deploy**:
   - Set up CI/CD pipeline
   - Configure production database
   - Set up reverse proxy (nginx)
   - Enable monitoring

## 🆘 Support

- Check inline code comments
- Review service placeholders marked with `// TODO:`
- See README.md for detailed documentation
