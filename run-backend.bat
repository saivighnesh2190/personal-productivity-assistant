@echo off
echo Starting Personal Productivity Assistant Backend
echo ================================================
echo.

REM Set environment variables
set SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/ai_assistant?createDatabaseIfNotExist=true
set SPRING_DATASOURCE_USERNAME=dbuser  
set SPRING_DATASOURCE_PASSWORD=dbpassword
set GEMINI_API_KEY=%GEMINI_API_KEY%
set JWT_SECRET=mySecretKey_ThisShouldBeChangedInProduction_MakeItLongerForSecurity

REM Change to backend directory
cd backend

REM Check if Maven is installed
where mvn >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Maven is not installed. Please install Maven first.
    pause
    exit /b 1
)

echo Building backend application...
call mvn clean compile

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed. Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo Starting Spring Boot application...
echo The backend will be available at http://localhost:8080
echo.
echo Press Ctrl+C to stop the server
echo.

mvn spring-boot:run

pause
