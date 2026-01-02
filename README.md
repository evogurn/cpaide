# CPAide - Multi-Tenant AI Document Management SaaS

Complete full-stack application with React frontend and Node.js backend, featuring RAG-powered AI search and multi-tenant architecture.

## 🚀 Quick Start with Docker (Recommended)

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose plugin](https://docs.docker.com/compose/install/) installed

### One-Command Setup

```bash
# Using Make (easiest - works with both Docker versions)
make setup

# Or using modern Docker command
docker compose up
```

**That's it!** The entire stack will be running:
- 🎨 **Frontend**: http://localhost:5173
- 🔧 **Backend API**: http://localhost:5000
- 🗄️ **PostgreSQL**: localhost:5432

**Default Login:**
- Email: `admin@demo.com`
- Password: `Admin@123`

### Common Docker Commands

```bash
# Start everything (works with both Docker versions)
make dev              # with logs
make up               # in background

# View logs
make logs
make logs-backend
make logs-frontend

# Database operations
make migrate          # Run migrations
make seed            # Seed database
make studio          # Open Prisma Studio

# Stop everything
make down

# Fresh restart
make fresh-start

# See all commands
make help
```

📖 **Full Docker Documentation**: [DOCKER_SETUP.md](./DOCKER_SETUP.md)

---

## 📦 Project Structure

```
CPAide/
├── frontend/          # React + Vite + Tailwind
├── backend/           # Node.js + Express + Prisma + PostgreSQL
├── docker-compose.yml # Development stack
└── Makefile          # Helper commands
```

## 🎯 Features

### Frontend
- 📊 Dashboard with analytics
- 📁 Document & folder management
- 🔍 Advanced search & filtering
- 👥 User management
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive design

### Backend
- 🏢 Multi-tenant architecture
- 🔐 JWT authentication (access + refresh tokens)
- 👮 Role-based access control (RBAC)
- 📄 Document management with S3 integration
- 🤖 RAG-powered AI semantic search
- 🗄️ PostgreSQL with Prisma ORM
- ✅ Complete API with validation

## 🛠️ Manual Setup (Without Docker)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on http://localhost:5173

### Backend

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database
npm run prisma:migrate
npm run prisma:seed

# Start server
npm run dev
```

Runs on http://localhost:5000

📖 **Backend Documentation**: [backend/README.md](./backend/README.md)

## 📚 API Documentation

Base URL: `http://localhost:5000/api`

### Endpoints

```
Auth:         POST   /auth/login
              POST   /auth/register
              POST   /auth/refresh

Documents:    GET    /documents
              POST   /documents
              GET    /documents/:id
              PATCH  /documents/:id
              DELETE /documents/:id

Folders:      GET    /folders
              POST   /folders
              PATCH  /folders/:id
              DELETE /folders/:id

AI/RAG:       POST   /ai/query
              POST   /ai/reprocess/:documentId

Users:        GET    /users
              POST   /users
              PATCH  /users/:id
              DELETE /users/:id
```

📖 **Full API Reference**: [backend/API_EXAMPLES.md](./backend/API_EXAMPLES.md)

## 🗄️ Database Schema

### Core Models
- **Tenant** - Multi-tenant organization
- **User** - Users with roles & permissions
- **Role + Permission** - RBAC system
- **Folder** - Hierarchical folder structure
- **Document** - Files with metadata + versioning
- **Embedding** - Vector embeddings for RAG
- **AuditLog** - Activity tracking

## 🔧 Technology Stack

### Frontend
- **React** 18
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation

### Backend
- **Node.js** 18+ (ES Modules)
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Prisma** - ORM
- **JWT** - Authentication
- **Zod** - Validation
- **Pino** - Logging

### AI/RAG
- **OpenAI** - Embeddings (placeholder)
- **pgvector/Qdrant** - Vector search (placeholder)
- Text extraction & chunking

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Nginx** - Production reverse proxy

## 🚢 Production Deployment

### Using Docker (Recommended)

```bash
# 1. Configure environment
cp .env.docker .env
nano .env  # Edit with production values

# 2. Deploy
docker-compose -f docker-compose.prod.yml up -d

# 3. Run migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

### Manual Deployment

See deployment guides:
- [Backend Deployment](./backend/README.md#-production-deployment)
- [Docker Setup](./DOCKER_SETUP.md)

## 🔐 Security Checklist

Before production:
- [ ] Change all default passwords
- [ ] Generate strong JWT secrets (64+ characters)
- [ ] Configure CORS for your domain
- [ ] Enable HTTPS/SSL
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Set up monitoring & alerts
- [ ] Review and update security headers

## 📊 Development

### Available Scripts

**Frontend:**
```bash
npm run dev         # Start dev server
npm run build       # Build for production
npm run preview     # Preview production build
```

**Backend:**
```bash
npm run dev         # Start with auto-reload
npm start           # Start production
npm run prisma:studio   # Open database GUI
npm run prisma:migrate  # Run migrations
npm run prisma:seed     # Seed database
```

**Docker:**
```bash
make help          # Show all commands
make dev           # Start development
make logs          # View logs
make migrate       # Run migrations
make seed          # Seed database
make studio        # Open Prisma Studio
```

## 🧪 Testing

```bash
# Backend tests (when implemented)
cd backend
npm test

# Frontend tests (when implemented)
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

MIT License

## 🆘 Support

- **Docker Issues**: See [DOCKER_SETUP.md](./DOCKER_SETUP.md)
- **Backend Issues**: See [backend/README.md](./backend/README.md)
- **API Examples**: See [backend/API_EXAMPLES.md](./backend/API_EXAMPLES.md)
- **Quick Start**: See [backend/QUICKSTART.md](./backend/QUICKSTART.md)

---

**Built with ❤️ for efficient document management and AI-powered search**
