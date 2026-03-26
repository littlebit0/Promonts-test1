# Promonts MVP

**학사 관리 시스템 (Learning Management System)**

과제, 채팅, 대시보드 기능을 갖춘 학사 관리 시스템 MVP입니다.
강의, 과제, 공지사항, 할 일, 채팅 등을 관리하며, 약 10명의 동시 사용자를 지원합니다.

---

## 🚀 주요 기능

### 핵심 모듈
1. **인증** - JWT 기반 인증 (학생/교수/관리자 역할)
2. **강의** - 강의 관리 (CRUD, 수강 신청)
3. **할 일** - 개인 할 일 목록 (우선순위, 마감일)
4. **과제** - 강의별 과제 관리
5. **공지사항** - 강의별 공지
6. **학사행정** - 성적 조회, 시간표, 학적 정보, 학사 공지, 학사 일정
7. **채팅** - 강의별 실시간 채팅 (WebSocket)
8. **대시보드** - 통계 및 다가오는 일정 요약
9. **관리자** - 사용자 관리, 강의 관리, 통계

### 추가 기능 (2026-03-26)
- **주차별 강의 관리** - 1~15주차 구조
- **강의 자료 업로드/다운로드** - 파일 업로드 및 다운로드
- **과제 자동 할 일 추가** - 교수가 과제 등록 시 학생 할 일에 자동 추가
- **과제 상세 모달** - 대시보드에서 과제 클릭 시 상세 정보 표시
- **과제 체크박스 보호** - 제출 시스템을 통해서만 완료 가능

---

## 🛠️ 기술 스택

### 백엔드
- **프레임워크:** Spring Boot 3.2.0
- **언어:** Java 17
- **데이터베이스:** H2 (개발용 인메모리)
- **인증:** JWT + Spring Security
- **WebSocket:** STOMP + SockJS
- **API 문서:** SpringDoc OpenAPI (Swagger)
- **빌드 도구:** Gradle 8.5

### 프론트엔드
- **프레임워크:** React 18
- **빌드 도구:** Vite 8.0.2
- **스타일:** TailwindCSS v4
- **HTTP 클라이언트:** Axios
- **상태 관리:** useState + localStorage

---

## 📦 프로젝트 구조

```
promonts-clean/
├── backend/
│   ├── src/main/java/com/promonts/
│   │   ├── config/         # Security, JWT, WebSocket, OpenAPI
│   │   ├── domain/         # 엔티티 (User, Course, Todo 등)
│   │   │   ├── user/
│   │   │   ├── course/
│   │   │   ├── assignment/
│   │   │   ├── todo/
│   │   │   ├── notice/
│   │   │   ├── chat/
│   │   │   ├── week/       # 주차 관리
│   │   │   ├── material/   # 강의 자료
│   │   │   └── enrollment/ # 수강 신청
│   │   ├── repository/     # JPA Repositories
│   │   ├── dto/            # Request/Response DTOs
│   │   ├── service/        # 비즈니스 로직
│   │   └── controller/     # REST Controllers
│   ├── src/main/resources/
│   │   ├── application.yml # 앱 설정
│   │   └── uploads/        # 파일 업로드 디렉토리
│   └── build.gradle        # 의존성
│
└── frontend/
    ├── src/
    │   ├── components/     # Dashboard, Navbar
    │   ├── pages/          # CourseDetailPage, AcademicPage, AdminPage 등
    │   ├── services/       # API 서비스 (Axios)
    │   ├── App.jsx         # 메인 앱 컴포넌트
    │   └── index.css       # TailwindCSS
    ├── package.json
    └── vite.config.js
```

---

## 🏃 시작하기

### 필수 요구사항
- **Java 17+**
- **Node.js 18+**
- **npm or yarn**

### 백엔드 설정

```bash
cd backend

# 빌드
./gradlew clean build

# 실행
./gradlew bootRun
```

**백엔드 실행 주소:** http://localhost:8080

**Swagger UI:** http://localhost:8080/swagger-ui.html

**H2 콘솔:** http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:promonts`
- Username: `sa`
- Password: (비어있음)

### 프론트엔드 설정

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

**프론트엔드 실행 주소:** http://localhost:5173

---

## 📚 API 문서

**Swagger UI**에서 인터랙티브 API 문서 제공:
- http://localhost:8080/swagger-ui.html

**주요 엔드포인트:**
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인 및 JWT 토큰 발급
- `GET /api/dashboard` - 대시보드 통계 조회
- `GET /api/courses` - 강의 목록 조회
- `GET /api/todos` - 할 일 목록 조회
- `GET /api/courses/{courseId}/weeks` - 주차 목록 조회
- `POST /api/courses/{courseId}/weeks/{weekNumber}/materials` - 강의 자료 업로드
- `POST /api/chat/messages` - 채팅 메시지 전송
- `WS /ws` - WebSocket 엔드포인트 (실시간 채팅)

**인증:**
- 보호된 엔드포인트에는 `Authorization: Bearer <token>` 헤더 추가

---

## 🧪 테스트

### 테스트 계정 (DataInitializer에서 자동 생성)

#### 관리자
- **이메일:** admin@promonts.com
- **비밀번호:** admin123
- **역할:** ADMIN

#### 교수
- **이메일:** professor@promonts.com
- **비밀번호:** prof123
- **역할:** PROFESSOR

#### 학생
- **이메일:** student@promonts.com
- **비밀번호:** student123
- **역할:** STUDENT

### cURL 예제

#### 1. 회원가입
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "test1234",
    "name": "테스트",
    "role": "STUDENT"
  }'
```

#### 2. 로그인
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@promonts.com",
    "password": "student123"
  }'
```

#### 3. 대시보드 조회 (JWT 필요)
```bash
curl -X GET http://localhost:8080/api/dashboard \
  -H "Authorization: Bearer <your-token>"
```

---

## 🔐 보안

- **JWT** 인증 (상태 없는 세션)
- **BCrypt** 비밀번호 해싱
- **CORS** 활성화 (localhost:5173, 3000, 8081)
- **CSRF** 비활성화 (API 전용 모드)
- **역할 기반 접근 제어** (STUDENT, PROFESSOR, ADMIN)

---

## 📝 개발 참고사항

### 데이터베이스
- **개발 환경:** H2 인메모리 데이터베이스 (재시작 시 데이터 초기화)
- **프로덕션:** PostgreSQL 마이그레이션 준비 완료 (`application.yml` 수정)

### CORS 설정
`application.yml`에서 허용할 origin 추가:
```yaml
cors:
  allowed-origins: http://localhost:5173,http://your-domain.com
```

### JWT 시크릿
⚠️ **프로덕션에서는 반드시 JWT 시크릿 변경!**
```yaml
jwt:
  secret: your-production-secret-key-min-256-bits
```

### 파일 업로드
- **최대 파일 크기:** 10MB
- **저장 경로:** `uploads/materials/`
- **지원 형식:** 모든 파일 형식

---

## 🐛 알려진 문제

1. **H2 예약어:** `year` 컬럼을 `course_year`로 변경하여 충돌 방지
2. **TailwindCSS v4:** `@tailwindcss/postcss` 패키지 필요 (레거시 플러그인 대신)
3. **WebSocket CORS:** localhost만 허용, 프로덕션 환경에서는 업데이트 필요
4. **채팅 버그:** 강의별 토픽 분리 완료 (`/topic/course/{courseId}`)

---

## 🚧 로드맵 (MVP 이후)

### 필수 (Priority: HIGH)
- [ ] 과제 제출 시스템 (30-40분)

### 중요 (Priority: MEDIUM)
- [ ] 강의 수강 신청/취소 (20-25분)
- [ ] 검색 기능 (15-20분)
- [ ] 출석 체크 시스템 (30-35분)
- [ ] 시험 관리 (20-25분)

### 유용함 (Priority: LOW)
- [ ] 파일 업로드 진행률 표시 (10-15분)
- [ ] 알림 시스템 (25-30분)
- [ ] 프로필 편집 (15-20분)
- [ ] 학습 통계 대시보드 (35-40분)
- [ ] 다크모드 (20-25분)

### 고급 기능 (Priority: FUTURE)
- [ ] AI 챗봇 (60-80분)
- [ ] 비디오 강의 스트리밍 (50-60분)
- [ ] 게이미피케이션 (40-50분)
- [ ] PWA 구현 (35-45분)

**전체 TODO:** 34개 항목 (15-18시간 예상)

---

## 📄 라이선스

MIT License - 교육 목적으로 자유롭게 사용 가능합니다.

---

## 👥 기여자

- **개발자:** ant li (antyes1212)
- **개발 기간:** 
  - MVP 완성: ~1.5시간 (2026-03-23 & 2026-03-25)
  - 추가 기능: ~1.7시간 (2026-03-26)
- **생성 파일:** 64개 (57 backend + 7 frontend) → 99개 (추가 35개)

---

## 📧 연락처

- **GitHub:** https://github.com/littlebit0/Promonts
- **개발자:** littlebit0

---

## 🎉 업데이트 히스토리

### 2026-03-26 (대규모 업데이트)
- ✅ 주차별 강의 관리 (1~15주차)
- ✅ 강의 자료 업로드/다운로드/삭제
- ✅ 과제 등록/삭제
- ✅ 과제 → 학생 할 일 자동 추가
- ✅ 학사행정 페이지 (5개 탭)
- ✅ 공지사항 필터 기능
- ✅ 관리자 페이지 (사용자 추가/삭제)
- ✅ 과제 상세 모달
- ✅ 과제 체크박스 보호 (제출 시스템 연동)
- ✅ 채팅 버그 수정 (강의별 토픽 분리)

### 2026-03-25 (초기 MVP)
- ✅ 인증, 강의, 할 일, 과제, 공지, 채팅, 대시보드

---

**❤️ 학습과 빠른 프로토타이핑을 위해 제작되었습니다**
