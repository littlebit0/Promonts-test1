# Promonts MVP

**Learning Management System (LMS) with Todo, Chat, and Dashboard features**

A minimal viable product for managing courses, assignments, notices, todos, workspaces, and real-time chat for ~10 concurrent users.

---

## 🚀 Features

### Core Modules
1. **Auth** - JWT-based authentication (Student/Professor/Admin roles)
2. **Course** - Course management (CRUD, enrollment)
3. **Todo** - Personal todo list with priority and due dates
4. **Assignment** - Course assignments with deadlines
5. **Notice** - Course announcements
6. **Workspace** - Collaborative workspaces with notes
7. **Chat** - Real-time chat per course (WebSocket)
8. **Dashboard** - Statistics and upcoming items overview

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Spring Boot 3.2.0
- **Language:** Java 17
- **Database:** H2 (in-memory for development)
- **Authentication:** JWT + Spring Security
- **WebSocket:** STOMP + SockJS
- **API Docs:** SpringDoc OpenAPI (Swagger)
- **Build Tool:** Gradle 8.5

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite 8.0
- **Styling:** TailwindCSS v4
- **HTTP Client:** Axios
- **State Management:** useState + localStorage

---

## 📦 Project Structure

```
promonts-clean/
├── backend/
│   ├── src/main/java/com/promonts/
│   │   ├── config/         # Security, JWT, WebSocket, OpenAPI
│   │   ├── domain/         # Entities (User, Course, Todo, etc.)
│   │   ├── repository/     # JPA Repositories
│   │   ├── dto/            # Request/Response DTOs
│   │   ├── service/        # Business logic
│   │   └── controller/     # REST Controllers
│   ├── src/main/resources/
│   │   └── application.yml # App configuration
│   └── build.gradle        # Dependencies
│
└── frontend/
    ├── src/
    │   ├── components/     # Login, Dashboard
    │   ├── services/       # API service (Axios)
    │   ├── App.jsx         # Main app component
    │   └── index.css       # TailwindCSS
    ├── package.json
    └── vite.config.js
```

---

## 🏃 Getting Started

### Prerequisites
- **Java 17+**
- **Node.js 18+**
- **npm or yarn**

### Backend Setup

```bash
cd backend

# Build
./gradlew clean build

# Run
./gradlew bootRun
```

**Backend runs at:** http://localhost:8080

**Swagger UI:** http://localhost:8080/swagger-ui.html

**H2 Console:** http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:promonts`
- Username: `sa`
- Password: (empty)

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

**Frontend runs at:** http://localhost:5173

---

## 📚 API Documentation

**Swagger UI** provides interactive API documentation:
- http://localhost:8080/swagger-ui.html

**Key Endpoints:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/dashboard` - Get dashboard statistics
- `GET /api/courses` - List all courses
- `GET /api/todos` - List todos
- `POST /api/chat/messages` - Send chat message
- `WS /ws` - WebSocket endpoint for real-time chat

**Authentication:**
- Add `Authorization: Bearer <token>` header for protected endpoints

---

## 🧪 Testing

### 1. Register a user
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "professor@test.com",
    "password": "test1234",
    "name": "김교수",
    "role": "PROFESSOR"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "professor@test.com",
    "password": "test1234"
  }'
```

### 3. Get Dashboard (with JWT)
```bash
curl -X GET http://localhost:8080/api/dashboard \
  -H "Authorization: Bearer <your-token>"
```

---

## 🔐 Security

- **JWT** authentication for stateless sessions
- **BCrypt** password hashing
- **CORS** enabled for localhost:5173, 3000, 8081
- **CSRF** disabled (API-only mode)
- **Role-based access control** (STUDENT, PROFESSOR, ADMIN)

---

## 📝 Development Notes

### Database
- **Development:** H2 in-memory database (data resets on restart)
- **Production:** PostgreSQL migration ready (update `application.yml`)

### CORS Configuration
Edit `application.yml` to allow additional origins:
```yaml
cors:
  allowed-origins: http://localhost:5173,http://your-domain.com
```

### JWT Secret
⚠️ **Change JWT secret in production!**
```yaml
jwt:
  secret: your-production-secret-key-min-256-bits
```

---

## 🐛 Known Issues

1. **H2 Reserved Keywords:** `year` column renamed to `course_year` to avoid conflicts
2. **TailwindCSS v4:** Requires `@tailwindcss/postcss` package instead of legacy plugin
3. **WebSocket CORS:** Configured for localhost only; update for production

---

## 🚧 Roadmap (Not in MVP)

- File upload for assignments
- Email notifications
- NFC/RFID attendance tracking
- Voice/video calls
- Library booking system
- AI assistant integration
- Mobile app (React Native)

---

## 📄 License

MIT License - feel free to use for educational purposes.

---

## 👥 Contributors

- **Developer:** ant li (antyes1212)
- **Development Time:** ~1.5 hours (2026-03-23 & 2026-03-25)
- **Files Created:** 64 (57 backend + 7 frontend)

---

## 📧 Contact

- **GitHub:** littlebit0
- **Email:** (add your email)

---

**Built with ❤️ for learning and rapid prototyping**
