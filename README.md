# 🚌 노선 및 스케줄 관리 시스템

버스, 셔틀 등의 노선 정보와 스케줄을 관리하고 사용자에게 제공하는 풀스택 웹 애플리케이션입니다.

## 📋 목차

- [기능 개요](#기능-개요)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [설치 및 실행](#설치-및-실행)
- [개발 로드맵](#개발-로드맵)

## 🎯 기능 개요

### Phase 1: 기본 인프라 구축 ✅
- 백엔드 API 서버 (Node.js + Express + TypeScript)
- 프론트엔드 웹 애플리케이션 (React + Vite + TypeScript)
- 데이터베이스 스키마 설계 (MySQL + TypeORM)
- 헬스체크 API

### Phase 2: 정거장 관리 기능 (예정)
- 정거장 및 승하차장 CRUD
- 지도 API 연동 (위치 선택/표시)
- 사진 업로드 기능

### Phase 3: 노선 관리 기능 (예정)
- 노선 정보 관리
- 노선 속성 관리
- 노선 구성 (정거장 순서, 시간/거리 설정)

### Phase 4: 스케줄 관리 기능 (예정)
- 정기/단발 스케줄 생성
- 회차별 시간 설정
- 도착 시간 자동 계산

### Phase 5: 사용자 페이지 (예정)
- 노선도 시각화
- 스케줄 표시
- 반응형 디자인 (PC/Mobile)

## 🛠️ 기술 스택

### 백엔드
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: TypeORM
- **Database**: MySQL 8.0+

### 프론트엔드
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router

## 📁 프로젝트 구조

```
routeinfo/
├── backend/              # 백엔드 서버
│   ├── src/
│   │   ├── config/      # 데이터베이스 설정
│   │   ├── models/      # TypeORM 엔티티
│   │   ├── routes/      # API 라우트
│   │   ├── controllers/ # 비즈니스 로직
│   │   ├── middlewares/ # 미들웨어
│   │   └── server.ts    # 서버 진입점
│   ├── migrations/      # SQL 마이그레이션
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/            # 프론트엔드 애플리케이션
│   ├── src/
│   │   ├── api/         # API 호출 함수
│   │   ├── components/  # React 컴포넌트
│   │   ├── pages/       # 페이지
│   │   ├── types/       # TypeScript 타입
│   │   ├── App.tsx      # 메인 앱
│   │   └── main.tsx     # 진입점
│   ├── package.json
│   └── .env.example
│
├── doc/                 # 문서
│   └── 노선 및 스케줄 관리.md
└── README.md
```

## 🚀 설치 및 실행

### 1. 사전 요구사항

- Node.js 18+ 설치
- MySQL 8.0+ 설치 및 실행
- Git

### 2. 프로젝트 클론

```bash
git clone <repository-url>
cd routeinfo
```

### 3. 데이터베이스 설정

MySQL에 접속하여 데이터베이스를 생성합니다:

```sql
CREATE DATABASE routeinfo DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

마이그레이션 SQL 실행:

```bash
mysql -u root -p routeinfo < backend/migrations/001_initial_schema.sql
```

### 4. 백엔드 설정 및 실행

```bash
cd backend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어서 데이터베이스 정보 입력

# 개발 서버 실행
npm run dev
```

백엔드 서버가 http://localhost:3000 에서 실행됩니다.

### 5. 프론트엔드 설정 및 실행

새 터미널을 열어서:

```bash
cd frontend

# 의존성 설치
npm install

# 환경 변수 설정 (필요시)
cp .env.example .env

# 개발 서버 실행
npm run dev
```

프론트엔드 서버가 http://localhost:5173 에서 실행됩니다.

### 6. 동작 확인

브라우저에서 http://localhost:5173 을 열어 다음을 확인합니다:
- 시스템 상태가 "OK"로 표시
- 데이터베이스 연결 상태가 "Connected"로 표시

## 🔧 환경 변수 설정

### 백엔드 (.env)

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=routeinfo

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 프론트엔드 (.env)

```env
VITE_API_BASE_URL=http://localhost:3000
```

## 📅 개발 로드맵

- [x] **Phase 1**: 기본 인프라 구축
  - [x] 프로젝트 초기화
  - [x] 데이터베이스 스키마 설계
  - [x] TypeORM 모델 작성
  - [x] 헬스체크 API

- [ ] **Phase 2**: 정거장 관리 기능
  - [ ] 정거장/승하차장 CRUD API
  - [ ] 관리자 UI
  - [ ] 지도 API 연동

- [ ] **Phase 3**: 노선 관리 기능
  - [ ] 노선 CRUD API
  - [ ] 노선 구성 관리
  - [ ] 노선 속성 관리

- [ ] **Phase 4**: 스케줄 관리 기능
  - [ ] 스케줄 CRUD API
  - [ ] 시간 자동 계산 로직

- [ ] **Phase 5**: 사용자 페이지
  - [ ] 페이지 설정 관리
  - [ ] 노선도 시각화
  - [ ] 반응형 디자인

- [ ] **Phase 6**: 고도화
  - [ ] 이미지 업로드
  - [ ] HTML 에디터
  - [ ] 최적화 및 테스트

## 📝 라이선스

이 프로젝트는 학습 목적으로 개발되었습니다.

## 🤝 기여

이 프로젝트는 현재 개인 학습 프로젝트입니다.

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.
