#!/bin/bash

# Personal Productivity Assistant - Setup Script

echo "🚀 Personal Productivity Assistant Setup"
echo "========================================"
echo ""

# Check for required tools
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install $1 first."
        exit 1
    else
        echo "✅ $1 is installed"
    fi
}

echo "Checking prerequisites..."
check_command docker
check_command docker-compose
check_command java
check_command mvn
check_command node
check_command npm
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and add your GEMINI_API_KEY"
    echo ""
fi

# Ask user for setup type
echo "Select setup type:"
echo "1) Full Docker setup (recommended)"
echo "2) Local development setup"
echo "3) Build only (no run)"
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo ""
        echo "🐳 Starting Docker Compose setup..."
        docker-compose down
        docker-compose build
        docker-compose up -d
        echo ""
        echo "✅ Application is running!"
        echo "   Frontend: http://localhost"
        echo "   Backend: http://localhost:8080"
        echo "   MySQL: localhost:3306"
        echo ""
        echo "To view logs: docker-compose logs -f"
        echo "To stop: docker-compose down"
        ;;
    2)
        echo ""
        echo "🔧 Starting local development setup..."
        
        # Start MySQL with Docker
        echo "Starting MySQL database..."
        docker run -d \
            --name mysql-dev \
            -p 3306:3306 \
            -e MYSQL_ROOT_PASSWORD=rootpassword \
            -e MYSQL_DATABASE=ai_assistant \
            -e MYSQL_USER=dbuser \
            -e MYSQL_PASSWORD=dbpassword \
            mysql:8.0
        
        # Build backend
        echo "Building backend..."
        cd backend
        mvn clean install -DskipTests
        
        # Start backend in background
        echo "Starting backend server..."
        nohup mvn spring-boot:run > backend.log 2>&1 &
        BACKEND_PID=$!
        cd ..
        
        # Install frontend dependencies
        echo "Installing frontend dependencies..."
        cd frontend
        npm install
        
        # Start frontend
        echo "Starting frontend development server..."
        npm run dev &
        FRONTEND_PID=$!
        cd ..
        
        echo ""
        echo "✅ Development servers are running!"
        echo "   Frontend: http://localhost:5173"
        echo "   Backend: http://localhost:8080"
        echo "   MySQL: localhost:3306"
        echo ""
        echo "Backend PID: $BACKEND_PID"
        echo "Frontend PID: $FRONTEND_PID"
        echo ""
        echo "To stop backend: kill $BACKEND_PID"
        echo "To stop frontend: kill $FRONTEND_PID"
        echo "To stop MySQL: docker stop mysql-dev && docker rm mysql-dev"
        ;;
    3)
        echo ""
        echo "🔨 Building application..."
        
        # Build backend
        echo "Building backend..."
        cd backend
        mvn clean package -DskipTests
        cd ..
        
        # Build frontend
        echo "Building frontend..."
        cd frontend
        npm install
        npm run build
        cd ..
        
        # Build Docker images
        echo "Building Docker images..."
        docker-compose build
        
        echo ""
        echo "✅ Build complete!"
        echo "   Backend JAR: backend/target/*.jar"
        echo "   Frontend build: frontend/dist/"
        echo "   Docker images built"
        echo ""
        echo "To run with Docker: docker-compose up"
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "📚 For more information, see README.md"
echo "🐛 Report issues at: https://github.com/yourusername/personal-productivity-assistant/issues"
