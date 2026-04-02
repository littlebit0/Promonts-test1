# Promonts 📚

상명대학교 학사 관리 시스템 — 강의, 과제, 성적, 출석, 채팅을 한 곳에서.

## 기술 스택

**Backend**
- Java 17, Spring Boot 3
- Spring Security (JWT)
- WebSocket (STOMP)
- H2 (dev) / PostgreSQL (prod)
- Gradle

**Frontend**
- React 18 + Vite
- TailwindCSS
- Chart.js / react-chartjs-2
- @stomp/stompjs + sockjs-client

## 주요 기능

| 기능 | 설명 |
|------|------|
| 🔐 인증 | JWT 기반 로그인, 역할 분리 (학생/교수/관리자) |
| 📚 강의 | 강의 생성/수강신청, 주차별 자료 업로드 |
| 📝 과제 | 과제 등록/제출/채점, 파일 첨부, 지각 제출 표시 |
| 🏛️ 학사행정 | 성적 조회/그래프, GPA 계산기, 학기별 필터 |
| ✅ 출석 | QR 코드 출석 (교수 생성 → 학생 입력), 출석률 통계 |
| 💬 채팅 | 강의별 실시간 채팅, 파일/이미지 첨부 |
| 📅 캘린더 | 월/주 뷰, 일정 추가/상세 |
| 🔔 알림 | WebSocket 실시간 푸시 알림 |
| 🌙 다크모드 | 시스템 연동 자동 전환 |

## 시작하기

### 백엔드

```bash
cd backend
./gradlew bootRun
# http://localhost:8080
```

### 프론트엔드

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

### 환경 변수 (frontend/.env)

```
VITE_API_URL=http://localhost:8080/api
```

## 기본 계정 (dev)

| 역할 | 이메일 | 비밀번호 |
|------|--------|---------|
| 관리자 | admin@smu.ac.kr | admin123 |
| 교수 | prof@smu.ac.kr | prof123 |
| 학생 | student@smu.ac.kr | student123 |

## 배포

- Frontend: Netlify (`netlify.toml` 준비됨)
- Backend: Railway (`Procfile` 준비됨)
- DB: PostgreSQL (prod 프로파일)

## 프로젝트 구조

```
Promonts/
├── backend/
│   └── src/main/java/com/promonts/
│       ├── config/          # Security, JWT, WebSocket
│       ├── controller/      # REST API
│       ├── service/         # 비즈니스 로직
│       ├── domain/          # JPA 엔티티
│       ├── dto/             # Request/Response DTO
│       └── repository/      # JPA Repository
└── frontend/
    └── src/
        ├── components/      # Navbar, Layout, Dashboard
        ├── pages/           # 각 기능 페이지
        ├── services/        # API 클라이언트
        └── contexts/        # Theme Context
```
