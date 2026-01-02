# Docker Setup Guide

Complete Docker setup for CPAide project with one-command deployment.

## 🚀 Quick Start (Development)

### Prerequisites
- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose plugin installed (included with Docker Desktop)

### Start Everything

```bash
# Clone or navigate to project
cd CPAide

# Start all services (modern Docker)
docker compose up

# Or run in background
docker compose up -d

# Alternative: Using the Makefile (works with both Docker versions)
make dev
make up
```

That's it! The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432

### Default Credentials
- **Email**: `admin@demo.com`
- **Password**: `Admin@123`

## 📦 What's Included

The Docker setup includes:

1. **PostgreSQL Database** (Port 5432)
   - Alpine-based for smaller size
   - Persistent data volume
   - Health checks
   - Auto-initialized with schema

2. **Backend API** (Port 5000)
   - Node.js 18 Alpine
   - Hot reload in development
   - Auto-runs Prisma migrations
   - Auto-generates Prisma client

3. **Frontend** (Port 5173)
   - Vite dev server with HMR
   - Hot reload enabled
   - Accessible from host

## 🛠️ Common Commands

### Start Services
```bash
# Start all services (modern Docker)
docker compose up

# Start in background (modern Docker)
docker compose up -d

# Start specific service
docker-compose up backend
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database!)
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs

# Follow logs
docker-compose logs -f

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

### Rebuild Services
```bash
# Rebuild all
docker-compose build

# Rebuild specific service
docker-compose build backend

# Rebuild and start
docker-compose up --build
```

### Access Containers
```bash
# Backend shell
docker-compose exec backend sh

# Frontend shell
docker-compose exec frontend sh

# Database shell
docker-compose exec postgres psql -U admin -d cpaaide
```

### Database Operations
```bash
# Run migrations
docker-compose exec backend npm run prisma:migrate

# Seed database
docker-compose exec backend npm run prisma:seed

# Open Prisma Studio
docker-compose exec backend npm run prisma:studio
```

## 🔧 Configuration

### Environment Variables

Development uses default values in `docker-compose.yml`.

For custom configuration:

1. Copy the template:
   ```bash
   cp .env.docker .env
   ```

2. Edit `.env` with your values

3. Docker Compose will automatically use `.env` file

### Port Configuration

To change ports, edit `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "3000:5000"  # Host:Container
  
  frontend:
    ports:
      - "3001:5173"
```

### Volume Mounts

Code is mounted for hot-reload:
- `./backend:/app` - Backend code
- `./frontend:/app` - Frontend code
- `postgres_data` - Database persistence

## 🚢 Production Deployment

### Using Production Compose File

```bash
# Copy environment template
cp .env.docker .env

# Edit with production values
nano .env

# Start production stack
docker-compose -f docker-compose.prod.yml up -d
```

### Production Features
- Optimized multi-stage builds
- Nginx reverse proxy
- Health checks
- Non-root users
- Production dependencies only
- Static asset compression

### Production Checklist
- [ ] Set strong `JWT_SECRET` (64+ characters)
- [ ] Set strong `JWT_REFRESH_SECRET`
- [ ] Set strong `POSTGRES_PASSWORD`
- [ ] Configure `CORS_ORIGIN` to your domain
- [ ] Set up SSL certificates
- [ ] Configure AWS S3 credentials
- [ ] Set OpenAI API key
- [ ] Configure SMTP for emails

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if postgres is healthy
docker-compose ps

# View postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

### Backend Not Starting

```bash
# Check logs
docker-compose logs backend

# Rebuild backend
docker-compose build backend

# Check if database is ready
docker-compose exec postgres pg_isready
```

### Port Already in Use

```bash
# Find process using port
lsof -i :5000
lsof -i :5173

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Prisma Issues

```bash
# Regenerate Prisma client
docker-compose exec backend npm run prisma:generate

# Reset database (⚠️ deletes data!)
docker-compose exec backend npx prisma migrate reset
```

### Clear Everything

```bash
# Stop and remove all containers, networks, volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Fresh start
docker-compose up --build
```

## 📊 Resource Usage

Typical resource usage:
- **Memory**: ~500MB total
- **Disk**: ~2GB (with node_modules)
- **CPU**: Low (idle), moderate (building)

### Optimize Resources

```yaml
# Add to services in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

## 🔐 Security Notes

### Development
- Uses default passwords (change in production!)
- Exposes all ports
- No SSL/TLS

### Production
- Change all default credentials
- Use secrets management
- Enable SSL/TLS
- Use firewall rules
- Regular security updates

## 🎯 Development Workflow

### Typical Workflow

```bash
# 1. Start services
docker-compose up -d

# 2. View logs while developing
docker-compose logs -f backend frontend

# 3. Make code changes (auto-reloads)

# 4. Run migrations if needed
docker-compose exec backend npm run prisma:migrate

# 5. Stop when done
docker-compose down
```

### Database Workflow

```bash
# 1. Make schema changes in backend/src/prisma/schema.prisma

# 2. Create migration
docker-compose exec backend npm run prisma:migrate

# 3. View in Prisma Studio
docker-compose exec backend npm run prisma:studio
# Visit http://localhost:5555
```

## 📝 File Structure

```
CPAide/
├── docker-compose.yml           # Development stack
├── docker-compose.prod.yml      # Production stack
├── .env.docker                  # Environment template
├── .dockerignore               # Docker ignore rules
├── backend/
│   ├── Dockerfile              # Backend dev image
│   ├── Dockerfile.prod         # Backend prod image
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile              # Frontend dev image
│   ├── Dockerfile.prod         # Frontend prod image
│   ├── nginx.conf              # Nginx config for prod
│   └── .dockerignore
└── nginx/                      # Production nginx (optional)
    └── nginx.conf
```

## 🚀 Next Steps

1. **Start developing**:
   ```bash
   docker-compose up
   ```

2. **Access the app**:
   - Frontend: http://localhost:5173
   - API: http://localhost:5000/api/health

3. **Make changes** - Code auto-reloads!

4. **View database**:
   ```bash
   docker-compose exec backend npm run prisma:studio
   ```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prisma with Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel#docker)

## 🆘 Support

If you encounter issues:
1. Check logs: `docker-compose logs`
2. Verify services: `docker-compose ps`
3. Rebuild: `docker-compose up --build`
4. Clean start: `docker-compose down -v && docker-compose up --build`
