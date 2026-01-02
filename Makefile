.PHONY: help dev prod build up down logs clean restart seed studio migrate

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
NC := \033[0m # No Color

# Detect Docker command format
DOCKER_COMPOSE := $(shell which docker-compose >/dev/null 2>&1 && echo "docker-compose" || echo "docker compose")

help: ## Show this help message
	@echo "${BLUE}CPAide Docker Commands${NC}"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "${GREEN}%-20s${NC} %s\n", $$1, $$2}'

# Development Commands
dev: ## Start development environment
	@echo "${BLUE}Starting development environment...${NC}"
	${DOCKER_COMPOSE} up

dev-d: ## Start development environment (detached)
	@echo "${BLUE}Starting development environment in background...${NC}"
	${DOCKER_COMPOSE} up -d

dev-build: ## Build and start development environment
	@echo "${BLUE}Building and starting development environment...${NC}"
	${DOCKER_COMPOSE} up --build

# Production Commands
prod: ## Start production environment
	@echo "${BLUE}Starting production environment...${NC}"
	${DOCKER_COMPOSE} -f docker-compose.prod.yml up -d

prod-build: ## Build and start production environment
	@echo "${BLUE}Building and starting production environment...${NC}"
	${DOCKER_COMPOSE} -f docker-compose.prod.yml up --build -d

# Service Management
up: dev-d ## Alias for dev-d

down: ## Stop all services
	@echo "${BLUE}Stopping all services...${NC}"
	${DOCKER_COMPOSE} down
	${DOCKER_COMPOSE} -f docker-compose.prod.yml down

stop: down ## Alias for down

restart: ## Restart all services
	@echo "${BLUE}Restarting services...${NC}"
	${DOCKER_COMPOSE} restart

# Logs
logs: ## Show logs (all services)
	${DOCKER_COMPOSE} logs -f

logs-backend: ## Show backend logs
	${DOCKER_COMPOSE} logs -f backend

logs-frontend: ## Show frontend logs
	${DOCKER_COMPOSE} logs -f frontend

logs-db: ## Show database logs
	${DOCKER_COMPOSE} logs -f postgres

# Database Operations
migrate: ## Run database migrations
	@echo "${BLUE}Running migrations...${NC}"
	${DOCKER_COMPOSE} exec backend npm run prisma:migrate

seed: ## Seed database with initial data
	@echo "${BLUE}Seeding database...${NC}"
	${DOCKER_COMPOSE} exec backend npm run prisma:seed

studio: ## Open Prisma Studio
	@echo "${BLUE}Opening Prisma Studio at http://localhost:5555${NC}"
	${DOCKER_COMPOSE} exec backend npm run prisma:studio

db-reset: ## Reset database (⚠️  destructive!)
	@echo "${BLUE}Resetting database...${NC}"
	${DOCKER_COMPOSE} exec backend npx prisma migrate reset

db-shell: ## Access database shell
	${DOCKER_COMPOSE} exec postgres psql -U admin -d cpaaide

# Build Commands
build: ## Build all services
	@echo "${BLUE}Building all services...${NC}"
	${DOCKER_COMPOSE} build

build-backend: ## Build backend only
	${DOCKER_COMPOSE} build backend

build-frontend: ## Build frontend only
	${DOCKER_COMPOSE} build frontend

rebuild: ## Rebuild all services
	@echo "${BLUE}Rebuilding all services...${NC}"
	${DOCKER_COMPOSE} build --no-cache

# Shell Access
shell-backend: ## Access backend container shell
	${DOCKER_COMPOSE} exec backend sh

shell-frontend: ## Access frontend container shell
	${DOCKER_COMPOSE} exec frontend sh

shell-db: ## Access database container shell
	${DOCKER_COMPOSE} exec postgres sh

# Clean Commands
clean: ## Remove all containers and volumes (⚠️  destructive!)
	@echo "${BLUE}Cleaning up containers and volumes...${NC}"
	${DOCKER_COMPOSE} down -v
	${DOCKER_COMPOSE} -f docker-compose.prod.yml down -v

clean-all: clean ## Remove containers, volumes, and images (⚠️  very destructive!)
	@echo "${BLUE}Removing all images...${NC}"
	${DOCKER_COMPOSE} down -v --rmi all
	${DOCKER_COMPOSE} -f docker-compose.prod.yml down -v --rmi all

prune: ## Remove unused Docker resources
	@echo "${BLUE}Pruning Docker system...${NC}"
	docker system prune -f

# Status
ps: ## Show running containers
	${DOCKER_COMPOSE} ps

status: ps ## Alias for ps

# Health Checks
health: ## Check service health
	@echo "${BLUE}Checking service health...${NC}"
	@curl -s http://localhost:5000/api/health | grep -q "ok" && echo "${GREEN}✓ Backend is healthy${NC}" || echo "✗ Backend is down"
	@curl -s http://localhost:5173 > /dev/null && echo "${GREEN}✓ Frontend is healthy${NC}" || echo "✗ Frontend is down"
	@${DOCKER_COMPOSE} exec postgres pg_isready -U admin > /dev/null && echo "${GREEN}✓ Database is healthy${NC}" || echo "✗ Database is down"

# Setup
setup: ## Initial setup (first time only)
	@echo "${BLUE}Setting up project for first time...${NC}"
	@test -f .env || cp .env.docker .env
	@echo "${GREEN}✓ Created .env file${NC}"
	@echo "${BLUE}Starting services...${NC}"
	@make dev-d
	@echo "${BLUE}Waiting for database...${NC}"
	@sleep 5
	@echo "${BLUE}Seeding database...${NC}"
	@make seed
	@echo "${GREEN}✓ Setup complete!${NC}"
	@echo ""
	@echo "Frontend: ${GREEN}http://localhost:5173${NC}"
	@echo "Backend:  ${GREEN}http://localhost:5000${NC}"
	@echo "Login:    ${GREEN}admin@demo.com / Admin@123${NC}"

# Testing
test-backend: ## Run backend tests (if exists)
	${DOCKER_COMPOSE} exec backend npm test

test-frontend: ## Run frontend tests (if exists)
	${DOCKER_COMPOSE} exec frontend npm test

# Quick Actions
quick-start: dev-d logs ## Quick start with logs

quick-stop: down ## Quick stop

fresh-start: clean dev-build seed ## Fresh start from scratch
