# 🚌 노선 및 스케줄 관리 시스템 - 설치 진행 상황

## ✅ 완료된 작업 (Phase 1)

### 1. 프로젝트 구조 생성 완료
```
routeinfo/
├── backend/              # 백엔드 서버 (완료)
│   ├── src/
│   │   ├── config/      # 데이터베이스 설정
│   │   ├── models/      # TypeORM 엔티티 (5개 작성 완료)
│   │   └── server.ts    # Express 서버
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # 데이터베이스 스키마
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/            # 프론트엔드 (완료)
│   ├── src/
│   │   ├── api/         # API 호출 함수
│   │   ├── App.tsx      # 메인 앱 (헬스체크 UI)
│   │   └── index.css    # Tailwind CSS 설정
│   ├── package.json
│   └── .env.example
│
└── README.md            # 프로젝트 문서
```

### 2. 백엔드 설정 완료
- ✅ Node.js + Express + TypeScript 설정
- ✅ TypeORM 설정
- ✅ 헬스체크 API 구현 (`/api/health`)
- ✅ CORS 설정
- ✅ 의존성 패키지 설치 완료

### 3. 프론트엔드 설정 완료
- ✅ React + Vite + TypeScript 설정
- ✅ Tailwind CSS 설정
- ✅ Axios API 연동
- ✅ 헬스체크 UI 구현
- ✅ 의존성 패키지 설치 완료

### 4. 데이터베이스 스키마 작성 완료
- ✅ MySQL 스키마 설계 (개선된 버전)
- ✅ 9개 테이블 정의:
  - stations (정거장)
  - stops (승하차장)
  - routes (노선)
  - route_attributes (노선 속성)
  - route_route_attributes (노선-속성 연결)
  - route_stops (노선 구성)
  - schedules (스케줄)
  - schedule_details (회차별 시간)
  - user_pages (사용자 페이지)
  - user_page_routes (페이지-노선 연결)

### 5. TypeORM 엔티티 작성 완료
- ✅ Station.ts
- ✅ Stop.ts
- ✅ Route.ts
- ✅ RouteAttribute.ts
- ✅ RouteStop.ts

---

## ⏳ 현재 진행 중인 작업

### MySQL 설치 및 설정
**상태**: 설치 중 - 서비스 시작 문제 해결 필요

**현재 상황**:
- XAMPP 설치됨: `C:\xampp`
- MySQL Workbench 8.0 CE 설치됨
- XAMPP MySQL이 시작되지 않음 (Start 버튼 클릭 후 멈춤)

**문제 원인 가능성**:
1. 기존 MySQL 서비스와 포트 충돌 (Get-Service에서 "MySQL" 서비스 발견)
2. 3306 포트가 다른 프로그램에 의해 사용 중
3. XAMPP MySQL 설정 오류

---

## 📋 리부팅 후 다음 단계

### 1단계: MySQL 서비스 정리
```powershell
# 기존 MySQL 서비스 확인
Get-Service -Name *mysql*

# 중지되어 있다면 비활성화
Get-Service -Name MySQL | Set-Service -StartupType Disabled
```

### 2단계: XAMPP MySQL 시작
1. XAMPP Control Panel 실행
2. MySQL "Start" 버튼 클릭
3. 초록색으로 변하는지 확인

**문제가 계속되면**:
- XAMPP Control Panel에서 "Logs" 버튼 클릭하여 에러 확인
- 또는 `C:\xampp\mysql\data\*.err` 파일 확인

### 3단계: MySQL 접속 및 데이터베이스 생성
```powershell
# MySQL 접속
C:\xampp\mysql\bin\mysql -u root

# 데이터베이스 생성
CREATE DATABASE routeinfo DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
EXIT;
```

### 4단계: 스키마 적용
```powershell
# 프로젝트 폴더로 이동
cd D:\study\claude\routeinfo

# 스키마 파일 적용
C:\xampp\mysql\bin\mysql -u root routeinfo < backend\migrations\001_initial_schema.sql

# 확인
C:\xampp\mysql\bin\mysql -u root -e "USE routeinfo; SHOW TABLES;"
```

### 5단계: 백엔드 환경 변수 설정
```powershell
cd D:\study\claude\routeinfo\backend

# .env 파일 생성
cp .env.example .env
```

**`.env` 파일 내용** (메모장으로 열어서 수정):
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=routeinfo

CORS_ORIGIN=http://localhost:5173
```
주의: XAMPP MySQL은 기본적으로 비밀번호가 없으므로 `DB_PASSWORD=` 비워두기

### 6단계: 백엔드 실행
```powershell
# 터미널 1 (백엔드 폴더에서)
cd D:\study\claude\routeinfo\backend
npm run dev
```

**성공 메시지**:
```
✅ Database connection established
🚀 Server is running on http://localhost:3000
📍 Health check: http://localhost:3000/api/health
```

### 7단계: 프론트엔드 실행
```powershell
# 터미널 2 (새 터미널 열기)
cd D:\study\claude\routeinfo\frontend
npm run dev
```

**성공 메시지**:
```
➜  Local:   http://localhost:5173/
```

### 8단계: 브라우저에서 확인
- http://localhost:5173 접속
- 시스템 상태: ✅ OK
- 데이터베이스: Connected

---

## 🔧 문제 해결 가이드

### MySQL 시작 안 됨
```powershell
# 포트 사용 확인
netstat -ano | findstr :3306

# 기존 MySQL 서비스 확인 및 중지
Get-Service -Name *mysql*
Stop-Service -Name MySQL

# 에러 로그 확인
Get-Content C:\xampp\mysql\data\*.err -Tail 50
```

### 백엔드 실행 오류
- `Database connection failed` → .env 파일의 DB 설정 확인
- `Port 3000 already in use` → 다른 프로그램이 3000 포트 사용 중

### 프론트엔드 연결 실패
- `Failed to connect to API server` → 백엔드가 실행 중인지 확인
- CORS 에러 → 백엔드 .env의 CORS_ORIGIN 확인

---

## 📚 참고 파일 경로

**중요 파일들**:
- 데이터베이스 스키마: `D:\study\claude\routeinfo\backend\migrations\001_initial_schema.sql`
- 백엔드 설정: `D:\study\claude\routeinfo\backend\.env`
- 프론트엔드 설정: `D:\study\claude\routeinfo\frontend\.env`
- 프로젝트 문서: `D:\study\claude\routeinfo\README.md`

**XAMPP 경로**:
- MySQL 실행 파일: `C:\xampp\mysql\bin\mysql.exe`
- 에러 로그: `C:\xampp\mysql\data\*.err`
- Control Panel: `C:\xampp\xampp-control.exe`

---

## 🎯 다음 Phase (Phase 2)

Phase 1이 완료되면 Phase 2로 진행:
- 정거장/승하차장 CRUD API 구현
- 관리자 UI 페이지 개발
- 지도 API 연동 (Kakao Map 또는 Naver Map)

---

**작성일**: 2025-11-06
**Phase**: 1 (기본 인프라 구축 - MySQL 설정 진행 중)
