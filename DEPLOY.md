# 배포 가이드

## 🚂 Railway (백엔드)

### 1. Railway 프로젝트 생성
1. [railway.app](https://railway.app) 접속 → New Project
2. **Deploy from GitHub repo** → `littlebit0/Promonts` 선택
3. **Dockerfile** 자동 감지됨

### 2. PostgreSQL 추가
1. Railway 프로젝트에서 **+ New** → **Database** → **PostgreSQL**
2. Variables 탭에서 `DATABASE_URL` 자동 생성됨

### 3. 환경변수 설정 (Railway Variables 탭)

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `SPRING_PROFILES_ACTIVE` | `prod` | 프로덕션 프로파일 |
| `DATABASE_URL` | Railway PostgreSQL URL | DB 연결 (자동 생성) |
| `DATABASE_USERNAME` | Railway DB 유저 | DB 접속 유저 |
| `DATABASE_PASSWORD` | Railway DB 비번 | DB 접속 비번 |
| `JWT_SECRET` | 랜덤 32자 이상 문자열 | JWT 서명 키 |
| `CORS_ALLOWED_ORIGINS` | `https://your-app.netlify.app` | 프론트 도메인 |

### 4. 도메인 확인
- 배포 후 Railway 제공 도메인 복사 (예: `promonts.up.railway.app`)

---

## 🌐 Netlify (프론트엔드)

### 1. Netlify 사이트 생성
1. [netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**
2. `littlebit0/Promonts` 선택
3. 빌드 설정 (`netlify.toml` 자동 감지):
   - Base: `frontend`
   - Build: `npm run build`
   - Publish: `dist`

### 2. 환경변수 설정 (Site Configuration → Environment variables)

| 변수명 | 값 |
|--------|-----|
| `VITE_API_URL` | `https://promonts.up.railway.app/api` |

### 3. 배포
- `master` 브랜치 push 시 자동 배포됨

---

## 🔄 CI/CD 자동배포 연동 (선택)

### Netlify 자동배포 (GitHub Actions)
`.github/workflows/ci.yml`의 deploy job에 추가:

```yaml
- name: Deploy to Netlify
  uses: nwtgck/actions-netlify@v3
  with:
    publish-dir: frontend/dist
    production-branch: master
    github-token: ${{ secrets.GITHUB_TOKEN }}
  env:
    NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
    NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

**GitHub Secrets 설정:**
- `NETLIFY_AUTH_TOKEN`: Netlify → User Settings → Personal access tokens
- `NETLIFY_SITE_ID`: Netlify 사이트 → Site Configuration → Site ID

---

## ✅ 배포 체크리스트

- [ ] Railway PostgreSQL 생성
- [ ] Railway 환경변수 설정 (5개)
- [ ] Railway 배포 완료 + 헬스체크 확인 (`/actuator/health`)
- [ ] Netlify 사이트 생성
- [ ] Netlify `VITE_API_URL` 환경변수 설정
- [ ] Netlify 배포 완료 + 로그인 테스트
- [ ] CORS 도메인 업데이트 (Railway `CORS_ALLOWED_ORIGINS`)
