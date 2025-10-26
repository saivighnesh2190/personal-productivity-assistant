@echo off
REM Personal Productivity Assistant - Setup Script for Windows

echo ======================================
echo Personal Productivity Assistant Setup
echo ======================================
echo.

REM Check for required tools
echo Checking prerequisites...

where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not installed. Please install Docker Desktop first.
    exit /b 1
) else (
    echo [OK] Docker is installed
)

where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Java is not installed. Please install Java 17+
    exit /b 1
) else (
    echo [OK] Java is installed
)

where mvn >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Maven is not installed. Please install Maven
    exit /b 1
) else (
    echo [OK] Maven is installed
)

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed. Please install Node.js 18+
    exit /b 1
) else (
    echo [OK] Node.js is installed
)

echo.

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo WARNING: Please edit .env file and add your GEMINI_API_KEY
    echo.
)

REM Ask user for setup type
echo Select setup type:
echo 1) Full Docker setup (recommended)
echo 2) Local development setup
echo 3) Build only (no run)
set /p choice=Enter choice [1-3]: 

if "%choice%"=="1" (
    echo.
    echo Starting Docker Compose setup...
    docker-compose down
    docker-compose build
    docker-compose up -d
    echo.
    echo Application is running!
    echo   Frontend: http://localhost
    echo   Backend: http://localhost:8080
    echo   MySQL: localhost:3306
    echo.
    echo To view logs: docker-compose logs -f
    echo To stop: docker-compose down
) else if "%choice%"=="2" (
    echo.
    echo Starting local development setup...
    
    REM Start MySQL with Docker
    echo Starting MySQL database...
    docker run -d --name mysql-dev -p 3306:3306 -e MYSQL_ROOT_PASSWORD=rootpassword -e MYSQL_DATABASE=ai_assistant -e MYSQL_USER=dbuser -e MYSQL_PASSWORD=dbpassword mysql:8.0
    
    REM Build backend
    echo Building backend...
    cd backend
    call mvn clean install -DskipTests
    
    REM Start backend
    echo Starting backend server...
    start "Backend Server" cmd /c "mvn spring-boot:run"
    cd ..
    
    REM Install frontend dependencies
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    
    REM Start frontend
    echo Starting frontend development server...
    start "Frontend Server" cmd /c "npm run dev"
    cd ..
    
    echo.
    echo Development servers are running!
    echo   Frontend: http://localhost:5173
    echo   Backend: http://localhost:8080
    echo   MySQL: localhost:3306
    echo.
    echo Close the command windows to stop the servers
    echo To stop MySQL: docker stop mysql-dev ^&^& docker rm mysql-dev
) else if "%choice%"=="3" (
    echo.
    echo Building application...
    
    REM Build backend
    echo Building backend...
    cd backend
    call mvn clean package -DskipTests
    cd ..
    
    REM Build frontend
    echo Building frontend...
    cd frontend
    call npm install
    call npm run build
    cd ..
    
    REM Build Docker images
    echo Building Docker images...
    docker-compose build
    
    echo.
    echo Build complete!
    echo   Backend JAR: backend\target\*.jar
    echo   Frontend build: frontend\dist\
    echo   Docker images built
    echo.
    echo To run with Docker: docker-compose up
) else (
    echo Invalid choice. Exiting.
    exit /b 1
)

echo.
echo For more information, see README.md
pause
