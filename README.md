# Personal Productivity Assistant

A full-stack AI-powered productivity assistant web application that helps users manage notes, tasks, and interact with an AI assistant for summaries, insights, and scheduling recommendations.

## 🚀 Features

- **AI-Powered Assistance**: Integration with Google Gemini API for intelligent features
  - Note summarization
  - Task generation from text
  - Conversational chat assistant
  - Daily productivity summaries
  - Productivity insights and recommendations

- **Note Management**
  - Create, edit, delete, and archive notes
  - AI-generated summaries
  - Category organization
  - Full-text search

- **Task Management**
  - CRUD operations for tasks
  - Priority levels (Low, Medium, High, Urgent)
  - Status tracking (Pending, In Progress, Completed, Cancelled)
  - Due date management
  - AI-generated tasks from text descriptions
  - Overdue task alerts

- **Dashboard Analytics**
  - Task completion trends
  - Priority distribution charts
  - Activity patterns visualization
  - Daily productivity summaries

- **Real-time Chat**
  - WebSocket-based live chat with AI assistant
  - Voice input support (Web Speech API)
  - Conversation history

- **Security**
  - JWT-based authentication
  - Secure user registration and login
  - Protected routes

## 🛠️ Tech Stack

### Backend
- **Spring Boot 3.2.0** (Java 17)
- **Spring Security** with JWT authentication
- **Spring Data JPA** with MySQL
- **Spring AI** for Google Gemini integration
- **WebSocket (STOMP)** for real-time communication
- **Maven** for dependency management

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Recharts** for data visualization
- **STOMP.js** for WebSocket communication
- **Lucide React** for icons

### Database
- **MySQL 8.0**

### DevOps
- **Docker** & **Docker Compose** for containerization
- **GitHub Actions** for CI/CD
- **Nginx** for frontend serving and reverse proxy

## 📋 Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8.0+
- Docker & Docker Compose (for containerized deployment)
- Google Gemini API Key

## 🔧 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/personal-productivity-assistant.git
cd personal-productivity-assistant
```

### 2. Set up environment variables
```bash
cp .env.example .env
```
Edit `.env` and add your configurations:
- `GEMINI_API_KEY`: Your Google Gemini API key
- `JWT_SECRET`: A secure secret key for JWT
- Database credentials

### 3. Backend Setup

#### Option A: Local Development
```bash
cd backend

# Install dependencies and build
mvn clean install

# Run the application
mvn spring-boot:run
```

#### Option B: Docker
```bash
docker-compose up backend mysql
```

### 4. Frontend Setup

#### Option A: Local Development
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

#### Option B: Docker
```bash
docker-compose up frontend
```

### 5. Full Stack with Docker Compose
```bash
# Build and run all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d
```

The application will be available at:
- Frontend: http://localhost (or http://localhost:5173 in dev mode)
- Backend API: http://localhost:8080
- MySQL: localhost:3306

## 📁 Project Structure

```
personal-productivity-assistant/
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/productivity/assistant/
│   │       │   ├── ai/           # AI service integration
│   │       │   ├── config/       # Configuration classes
│   │       │   ├── controller/   # REST controllers
│   │       │   ├── dto/          # Data transfer objects
│   │       │   ├── entity/       # JPA entities
│   │       │   ├── repository/   # Data repositories
│   │       │   ├── security/     # Security configuration
│   │       │   ├── service/      # Business logic
│   │       │   └── websocket/    # WebSocket handlers
│   │       └── resources/
│   │           └── application.yml
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React context providers
│   │   ├── hooks/        # Custom hooks
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/validate` - Validate token

### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create note
- `PUT /api/notes/{id}` - Update note
- `DELETE /api/notes/{id}` - Delete note
- `GET /api/notes/search?q=` - Search notes

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `GET /api/tasks/overdue` - Get overdue tasks
- `GET /api/tasks/search?q=` - Search tasks

### AI
- `POST /api/ai/summarize` - Summarize text
- `POST /api/ai/generate-tasks` - Generate tasks from text
- `GET /api/ai/daily-summary` - Get daily summary
- `POST /api/ai/chat` - Chat with AI
- `GET /api/ai/insights` - Get productivity insights

### WebSocket
- `/ws` - WebSocket endpoint
- `/app/chat.send` - Send chat message
- `/user/queue/chat` - Receive chat responses

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📦 Deployment

### Using Docker Compose
```bash
# Production build
docker-compose -f docker-compose.yml up --build
```

### Manual Deployment

1. Build backend JAR:
```bash
cd backend
mvn clean package
java -jar target/assistant-0.0.1-SNAPSHOT.jar
```

2. Build frontend:
```bash
cd frontend
npm run build
# Serve the dist folder with any static file server
```

## 🔐 Security Considerations

1. Change default passwords in production
2. Use strong JWT secret keys
3. Configure CORS properly for production domains
4. Use HTTPS in production
5. Secure your Gemini API key
6. Configure proper firewall rules for database

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Gemini API for AI capabilities
- Spring Boot community
- React and Vite communities
- All open-source contributors

## 📞 Support

For support, email your-email@example.com or open an issue in the GitHub repository.
