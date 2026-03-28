# Promonts - 대학 강의 관리 시스템 (LMS)

**Promonts**는 학생, 교수, 관리자를 위한 현대적인 강의 관리 시스템(LMS)입니다.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-6db33f.svg)

---

## 🌟 주요 기능

### 👨‍🎓 학생 기능
- ✅ 강의 수강 신청/취소
- 📚 과제 제출 및 확인
- 📊 성적 조회
- ✅ QR 코드 출석 체크
- 📅 일정 관리
- 💬 강의별 채팅
- 🔔 실시간 알림

### 👨‍🏫 교수 기능
- 📝 강의 생성 및 관리
- 📋 과제 출제 및 채점
- ✅ QR 출석 세션 생성
- 📊 학생 성적 관리
- 📝 시험 일정 등록
- 📢 공지사항 작성

### 👤 관리자 기능
- 📊 전체 통계 대시보드
- 👥 사용자 관리
- 📚 강의 현황 관리
- 💾 시스템 백업/복원
- 📈 활동 로그 조회

---

## 🚀 기술 스택

### Frontend
- **React 18** - UI 라이브러리
- **Vite 8.0.2** - 빌드 도구
- **TailwindCSS v4** - 스타일링
- **React Router** - 라우팅
- **Axios** - HTTP 클라이언트
- **Lucide React** - 아이콘
- **SockJS + STOMP** - WebSocket (실시간 채팅)

### Backend
- **Spring Boot 3.2.0** - 백엔드 프레임워크
- **Java 17** - 프로그래밍 언어
- **H2 Database** - 개발용 인메모리 DB
- **Spring Data JPA** - ORM
- **Spring Security + JWT** - 인증/인가
- **WebSocket** - 실시간 통신
- **Gradle** - 빌드 도구

---

## 📦 설치 및 실행

### 사전 요구사항
- **Node.js** 18+ 및 npm
- **Java** 17+
- **Gradle** 8+

### 1. 저장소 클론
```bash
git clone https://github.com/littlebit0/Promonts.git
cd Promonts
```

### 2. 백엔드 실행
```bash
cd backend
./gradlew bootRun
```
- 서버: http://localhost:8080
- H2 Console: http://localhost:8080/h2-console
- Swagger: http://localhost:8080/swagger-ui.html

### 3. 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev
```
- 개발 서버: http://localhost:5173

---

## 🔑 테스트 계정

애플리케이션 시작 시 자동으로 생성됩니다:

| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 관리자 | admin@promonts.com | admin123 |
| 교수 | professor@promonts.com | prof123 |
| 학생 | student@promonts.com | student123 |

---

## 📂 프로젝트 구조

```
Promonts/
├── backend/
│   ├── src/main/java/com/promonts/
│   │   ├── config/          # 설정 (JWT, Security, WebSocket)
│   │   ├── controller/      # REST API 컨트롤러
│   │   ├── domain/          # 엔티티 (User, Course, Assignment...)
│   │   ├── dto/             # 데이터 전송 객체
│   │   ├── repository/      # JPA 리포지토리
│   │   └── service/         # 비즈니스 로직
│   └── src/main/resources/
│       └── application.yml  # 애플리케이션 설정
│
├── frontend/
│   ├── src/
│   │   ├── components/      # 재사용 가능한 컴포넌트
│   │   ├── pages/           # 페이지 컴포넌트
│   │   ├── services/        # API 호출 (api.js)
│   │   ├── contexts/        # React Context (ThemeContext)
│   │   └── index.css        # 글로벌 스타일
│   └── vite.config.js       # Vite 설정
│
├── TESTING_CHECKLIST.md     # 테스트 체크리스트
├── NEXT_STEPS.md            # 다음 개선 사항
└── README.md                # 프로젝트 문서 (이 파일)
```

---

## 📡 주요 API 엔드포인트

### 인증
```
POST /api/auth/register - 회원가입
POST /api/auth/login    - 로그인
```

### 강의
```
GET    /api/courses          - 전체 강의 목록
GET    /api/courses/my       - 내 강의 목록
POST   /api/courses          - 강의 생성 (교수)
POST   /api/enrollments      - 수강 신청 (학생)
DELETE /api/enrollments/{id} - 수강 취소 (학생)
```

### 과제
```
POST /api/submissions/{assignmentId}  - 과제 제출
GET  /api/submissions/assignment/{id} - 제출물 조회
```

### 출석
```
POST /api/attendance/session - QR 세션 생성 (교수)
POST /api/attendance/check   - 출석 체크 (학생)
GET  /api/attendance/my      - 내 출석 기록
```

### 성적
```
POST /api/grades     - 성적 등록 (교수)
GET  /api/grades/my  - 내 성적 조회 (학생)
```

### 알림
```
GET   /api/notifications          - 알림 목록
GET   /api/notifications/unread   - 미읽음 알림
PATCH /api/notifications/{id}/read - 읽음 처리
```

전체 API 문서: http://localhost:8080/swagger-ui.html

---

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary (Classic Blue)**: `#2563EB`
- **Accent (Warm Orange)**: `#F97316`
- **Success**: `#10B981`
- **Warning**: `#F59E0B`
- **Error**: `#EF4444`

### 테마
- ☀️ 라이트 모드 (기본)
- 🌙 다크 모드 (네비게이션 바에서 토글)

---

## 🧪 테스트

### 테스트 체크리스트
상세한 테스트 가이드는 `TESTING_CHECKLIST.md` 참고

```bash
# 프론트엔드 테스트 (Jest + React Testing Library)
cd frontend
npm test

# 백엔드 테스트 (JUnit 5)
cd backend
./gradlew test
```

---

## 🚢 배포

### 프론트엔드 배포 (Netlify/Vercel)
```bash
cd frontend
npm run build
# dist/ 폴더를 Netlify/Vercel에 배포
```

### 백엔드 배포 (Heroku/Railway)
```bash
cd backend
./gradlew build
# build/libs/*.jar 파일을 배포
```

### 환경 변수 설정
**프론트엔드 (.env):**
```env
VITE_API_URL=https://your-backend-url.com
```

**백엔드 (application.yml):**
```yaml
jwt:
  secret: your-secret-key-here
  expiration: 86400000

spring:
  datasource:
    url: jdbc:postgresql://your-db-url
    username: your-db-user
    password: your-db-password
```

---

## 📈 개선 로드맵

### Phase 1 ✅ (완료)
- [x] 백엔드 34개 기능 구현
- [x] 프론트엔드 8개 주요 페이지
- [x] 로딩 스켈레톤
- [x] 에러 바운더리
- [x] 토스트 알림
- [x] 다크모드

### Phase 2 ⏳ (진행 예정)
- [ ] 파일 미리보기 (이미지/PDF)
- [ ] 성적 그래프 (Chart.js)
- [ ] 캘린더 UI 개선
- [ ] 모바일 반응형 최적화

### Phase 3 🔮 (계획)
- [ ] 실시간 알림 푸시
- [ ] 모바일 앱 (React Native)
- [ ] 다국어 지원 (i18n)
- [ ] CI/CD 파이프라인

전체 로드맵: `NEXT_STEPS.md` 참고

---

## 🤝 기여하기

1. Fork 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

## 📧 문의

- **GitHub**: [@littlebit0](https://github.com/littlebit0)
- **Repository**: [Promonts](https://github.com/littlebit0/Promonts)
- **Issues**: [버그 리포트 / 기능 요청](https://github.com/littlebit0/Promonts/issues)

---

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들을 사용합니다:
- [React](https://reactjs.org/)
- [Spring Boot](https://spring.io/projects/spring-boot)
- [TailwindCSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

**Made with ❤️ by ant li**
