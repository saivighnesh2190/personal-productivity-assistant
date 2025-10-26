# Quick Start Guide - Personal Productivity Assistant

## 🚀 Current Status

Your application components are ready:
- ✅ Frontend is running at: http://localhost:3000
- ✅ MySQL database is running on port 3306
- ⏳ Backend needs to be started separately

## 📋 To Get Started

### Step 1: Add Your Gemini API Key
1. Edit the `.env` file in the root directory
2. Replace `your_gemini_api_key_here` with your actual Gemini API key
   - Get your key from: https://makersuite.google.com/app/apikey

### Step 2: Start the Backend
Run the backend locally (requires Java 17+ and Maven):

```bash
# Windows
run-backend.bat

# OR manually:
cd backend
mvn spring-boot:run
```

The backend will start on http://localhost:8080

### Step 3: Access the Application
Once the backend is running, open your browser and go to:
- **Frontend**: http://localhost:3000

### 🔄 Docker Status

Currently running via Docker:
- MySQL Database (port 3306)
- Frontend Nginx Server (port 3000)

To check status:
```bash
docker ps
```

To stop services:
```bash
docker-compose -f docker-compose-dev.yml down
```

To restart services:
```bash
docker-compose -f docker-compose-dev.yml up -d
```

### 📝 Default Credentials

- **Database**:
  - Username: `dbuser`
  - Password: `dbpassword`
  - Database: `ai_assistant`

### 🛠️ Troubleshooting

1. **Frontend shows "Cannot connect to backend"**
   - Make sure the backend is running on port 8080
   - Check that your firewall allows connections

2. **Backend fails to start**
   - Ensure MySQL is running: `docker ps`
   - Check that port 8080 is not already in use
   - Verify your Gemini API key is set in `.env`

3. **MySQL connection issues**
   - Wait a minute for MySQL to fully initialize
   - Check logs: `docker logs ai-assistant-mysql`

### 📦 Full Docker Build (Optional)

To build and run everything in Docker (takes longer):
```bash
docker-compose up --build -d
```

Note: The backend Docker build takes 10-15 minutes due to Maven dependencies.

### 🎯 Next Steps

1. Register a new account on the login page
2. Create your first note
3. Try the AI features:
   - Generate task lists from text
   - Summarize notes
   - Chat with the AI assistant

### 💡 Tips

- The application uses JWT authentication - your session persists across refreshes
- All data is stored locally in the MySQL database
- The AI features require a valid Gemini API key to work

Enjoy your Personal Productivity Assistant! 🎉
