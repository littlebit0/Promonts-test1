# Promonts 📚

상명대학교 학사 관리 시스템 — 강의, 과제, 성적, 출석, 채팅을 한 곳에서.

> Ubion Coursemos UI/UX 분석 기반으로 설계된 차세대 LMS

## 기술 스택

**Backend**
- Java 17, Spring Boot 3
- Spring Security (JWT)
- WebSocket (STOMP)
- H2 (dev) / PostgreSQL (prod)
- Gradle

**Frontend**
- React 18 + Vite
- TailwindCSS v4
- Pretendard 폰트
- Chart.js / react-chartjs-2
- @stomp/stompjs + sockjs-client
- PWA (Service Worker, 오프라인 캐싱)

## 주요 기능

| 기능 | 설명 |
|------|------|
| 🔐 인증 | JWT 기반 로그인, 역할 분리 (학생/교수/관리자) |
| 📚 강의 | 강의 생성/수강신청, 주차별 자료 업로드 |
| 📝 과제 | 과제 등록/제출/채점, 파일 첨부, 지각 제출 표시 |
| 🏛️ 학사행정 | 성적 조회/그래프, GPA 계산기, 학기별 필터 |
| ✅ 출석 | QR 코드 출석 (교수 생성 → 학생 입력), 출석률 통계 |
| 💬 채팅 | 강의별 실시간 채팅, 파일/이미지 첨부, Discord 스타일 UI |
| 📅 캘린더 | 월/주 뷰, 개인 일정 + 학사 일정 통합 |
| 🔔 알림 | WebSocket 실시간 푸시 알림 |
| 👤 프로필 | 학번/학과/전화번호/프로필사진 수정 |
| 🔒 보안 설정 | 비밀번호 변경, 강도 표시 |
| 🌙 다크모드 | 시스템 연동 자동 전환 |
| 📱 반응형 | 모바일 햄버거 메뉴, 하단 탭바 |

## UI/UX 개선 사항 (2026-04-05)

유비온 코스모스(상명대 e-캠퍼스) 분석을 기반으로 다음 개선 사항 적용:

- **Pretendard 폰트** 적용 — 가독성 및 모던한 디자인
- **Empty State 컴포넌트** — 단순 텍스트 → 아이콘 + 메시지 + 액션 버튼
- **로딩 스켈레톤** — animate-pulse 기반 전 페이지 통일
- **프로필 드롭다운** → 별도 페이지 이동 방식
- **학사일정** CalendarPage 통합 (탭 전환)
- **공지사항** 카드 클릭 → 상세 모달

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

## 남은 작업 (TODO)

| 우선순위 | 항목 | 설명 |
|---------|------|------|
| 🔴 높음 | 전체 테스트 & 최적화 | 크로스 브라우저, API 통합 테스트, 번들 최적화 |
| 🟡 중간 | 배포 | Netlify + Railway + PostgreSQL 전환 |
| 🟢 낮음 | 시험 관리 기능 | 시험 일정 및 결과 관리 |

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
        ├── components/      # Navbar, Layout, Dashboard, EmptyState
        ├── pages/           # 각 기능 페이지 + SecurityPage
        ├── services/        # API 클라이언트
        ├── hooks/           # useEscapeKey 등 커스텀 훅
        └── contexts/        # Theme Context
```

## 변경 이력

### 2026-04-05
- Ubion Coursemos UI/UX 분석 기반 전면 개선
- 프로필 학번/학과/전화번호/사진 업로드 추가
- 보안 설정 페이지 분리 (비밀번호 강도 표시)
- 공지사항 글로벌 API 추가 (로그아웃 버그 수정)
- 학사일정 CalendarPage 통합

### 2026-04-02
- 알림 WebSocket 실시간 푸시
- 출석 QR 시스템 완성
- PWA (Service Worker, 오프라인 캐싱)
- CI/CD GitHub Actions 설정

### 2026-03-30
- 과제 제출 시스템 완성
- 채팅 Discord 스타일 2분할 UI
- 다크모드, 모바일 반응형 완성
- 성적 그래프 실제 데이터 연동
