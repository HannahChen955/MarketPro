#!/bin/bash

# MarketPro AI Setup Script
# This script helps you set up the development environment quickly

set -e

echo "🚀 MarketPro AI Setup Script"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18.0.0 or higher."
        exit 1
    fi

    NODE_VERSION=$(node --version | cut -d'v' -f2)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)

    if [ $MAJOR_VERSION -lt 18 ]; then
        print_error "Node.js version $NODE_VERSION is too old. Please install Node.js 18.0.0 or higher."
        exit 1
    fi

    print_success "Node.js version $NODE_VERSION ✓"

    # Check yarn or npm
    if command_exists yarn; then
        PACKAGE_MANAGER="yarn"
        print_success "Yarn found ✓"
    elif command_exists npm; then
        PACKAGE_MANAGER="npm"
        print_success "npm found ✓"
    else
        print_error "Neither yarn nor npm is available. Please install one of them."
        exit 1
    fi

    # Check Docker (optional)
    if command_exists docker; then
        print_success "Docker found ✓"
        DOCKER_AVAILABLE=true
    else
        print_warning "Docker not found. You'll need to install PostgreSQL and Redis manually."
        DOCKER_AVAILABLE=false
    fi

    # Check Docker Compose (optional)
    if command_exists docker-compose; then
        print_success "Docker Compose found ✓"
        DOCKER_COMPOSE_AVAILABLE=true
    else
        print_warning "Docker Compose not found."
        DOCKER_COMPOSE_AVAILABLE=false
    fi
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."

    if [ ! -f ".env" ]; then
        cp .env.example .env
        print_success "Created .env file from template"
    else
        print_warning ".env file already exists, skipping..."
    fi

    if [ ! -f "frontend/.env.local" ]; then
        cp frontend/.env.example frontend/.env.local
        print_success "Created frontend/.env.local file from template"
    else
        print_warning "frontend/.env.local file already exists, skipping..."
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."

    # Install root dependencies
    print_status "Installing root dependencies..."
    $PACKAGE_MANAGER install
    print_success "Root dependencies installed ✓"

    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend
    $PACKAGE_MANAGER install
    cd ..
    print_success "Frontend dependencies installed ✓"

    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    $PACKAGE_MANAGER install
    cd ..
    print_success "Backend dependencies installed ✓"
}

# Setup database with Docker
setup_database_docker() {
    if [ "$DOCKER_AVAILABLE" = true ] && [ "$DOCKER_COMPOSE_AVAILABLE" = true ]; then
        print_status "Setting up database with Docker..."

        # Start PostgreSQL and Redis
        docker-compose up -d postgres redis

        print_status "Waiting for database to be ready..."
        sleep 10

        # Check if database is ready
        if docker-compose exec postgres pg_isready -U marketpro -d marketpro >/dev/null 2>&1; then
            print_success "Database is ready ✓"
        else
            print_warning "Database might not be fully ready yet. Please wait a moment and try running the setup again."
        fi

        print_success "Database services started ✓"

        # Update .env file with Docker database URL
        if grep -q "DATABASE_URL.*localhost.*5432" .env; then
            sed -i.bak 's|DATABASE_URL=.*|DATABASE_URL="postgresql://marketpro:marketpro123@localhost:5432/marketpro"|' .env
            print_success "Updated DATABASE_URL in .env file ✓"
        fi

        if grep -q "REDIS_URL.*localhost.*6379" .env; then
            sed -i.bak 's|REDIS_URL=.*|REDIS_URL="redis://:redis123@localhost:6379"|' .env
            print_success "Updated REDIS_URL in .env file ✓"
        fi
    else
        print_warning "Docker not available. Please set up PostgreSQL and Redis manually."
        print_status "Manual setup instructions:"
        echo ""
        echo "1. Install PostgreSQL:"
        echo "   macOS: brew install postgresql && brew services start postgresql"
        echo "   Ubuntu: sudo apt update && sudo apt install postgresql postgresql-contrib"
        echo ""
        echo "2. Install Redis:"
        echo "   macOS: brew install redis && brew services start redis"
        echo "   Ubuntu: sudo apt install redis-server"
        echo ""
        echo "3. Create database:"
        echo "   psql postgres -c \"CREATE DATABASE marketpro;\""
        echo "   psql postgres -c \"CREATE USER marketpro WITH PASSWORD 'your_password';\""
        echo "   psql postgres -c \"GRANT ALL PRIVILEGES ON DATABASE marketpro TO marketpro;\""
        echo ""
        echo "4. Update .env file with your database credentials"
        echo ""
    fi
}

# Setup database schema
setup_database_schema() {
    print_status "Setting up database schema..."

    cd backend

    # Generate Prisma client
    print_status "Generating Prisma client..."
    $PACKAGE_MANAGER prisma generate
    print_success "Prisma client generated ✓"

    # Push database schema
    print_status "Pushing database schema..."
    $PACKAGE_MANAGER prisma db push
    print_success "Database schema updated ✓"

    cd ..
}

# Final instructions
show_final_instructions() {
    print_success "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "==========="
    echo ""
    echo "1. Configure your API keys in the .env file:"
    echo "   - QWEN_API_KEY: Get from https://dashscope.console.aliyun.com/"
    echo "   - OPENAI_API_KEY: Get from https://platform.openai.com/api-keys"
    echo ""
    echo "2. Start the development servers:"
    echo "   ${PACKAGE_MANAGER} dev"
    echo ""
    echo "3. Open your browser and visit:"
    echo "   Frontend: http://localhost:5678"
    echo "   Backend API: http://localhost:9527"
    echo "   Health Check: http://localhost:9527/health"
    echo ""
    if [ "$DOCKER_AVAILABLE" = true ]; then
        echo "4. Database management (optional):"
        echo "   pgAdmin: http://localhost:5050"
        echo "   Username: admin@marketpro.local"
        echo "   Password: admin123"
        echo ""
    fi
    echo "5. Read the full documentation in README.md"
    echo ""
    print_success "Happy coding! 🚀"
}

# Main setup flow
main() {
    check_prerequisites
    setup_environment
    install_dependencies
    setup_database_docker

    # Only setup schema if we have a database connection
    if [ "$DOCKER_AVAILABLE" = true ] && [ "$DOCKER_COMPOSE_AVAILABLE" = true ]; then
        setup_database_schema
    else
        print_warning "Skipping database schema setup. Please run 'cd backend && yarn prisma db push' after setting up your database."
    fi

    show_final_instructions
}

# Run main function
main