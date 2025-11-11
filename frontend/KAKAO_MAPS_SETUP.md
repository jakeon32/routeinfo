# Kakao Maps API 설정 가이드

## API 키 발급 방법

1. [Kakao Developers](https://developers.kakao.com/)에 접속
2. 로그인 후 '내 애플리케이션' 메뉴로 이동
3. '애플리케이션 추가하기' 버튼 클릭
4. 앱 이름을 입력하고 저장
5. 생성된 앱의 'JavaScript 키'를 복사

## 설정 방법

1. `frontend/.env.example`을 복사하여 `frontend/.env` 파일 생성:
   ```bash
   cp frontend/.env.example frontend/.env
   ```

2. `.env` 파일을 열고 발급받은 API 키 입력:
   ```env
   VITE_KAKAO_MAPS_APP_KEY=your_actual_api_key_here
   ```

3. 개발 서버 재시작:
   ```bash
   cd frontend
   npm run dev
   ```

## 보안 설정 (중요!)

### 1. 플랫폼 등록
Kakao Developers 콘솔에서 앱 설정 → 플랫폼 → Web 플랫폼 등록:
- 개발: `http://localhost:5173`
- 운영: 실제 도메인 주소

### 2. 사이트 도메인 등록
앱 설정 → Web → 사이트 도메인 등록으로 허용된 도메인만 API를 사용할 수 있도록 제한

### 3. 환경 변수 관리
- `.env` 파일은 **절대 git에 커밋하지 마세요** (이미 .gitignore에 포함됨)
- Vite는 `VITE_` 접두사가 붙은 환경 변수만 클라이언트에 노출됩니다
- API 키는 클라이언트에 노출되지만, 도메인 제한으로 보호됩니다

## 동작 방식

이 프로젝트는 **보안을 위해** Kakao Maps SDK를 동적으로 로드합니다:

1. API 키는 `.env` 파일에서 환경 변수로 관리
2. `kakaoMapLoader.ts`가 런타임에 SDK 스크립트를 동적 로드
3. HTML에 직접 노출되지 않아 소스 코드 공개 시 안전

## 문제 해결

### 지도가 로드되지 않는 경우
1. `.env` 파일이 `frontend/` 디렉토리에 있는지 확인
2. API 키가 올바르게 입력되었는지 확인
3. 개발 서버를 재시작했는지 확인
4. 브라우저 콘솔에서 에러 메시지 확인

### API 키 관련 에러
- Kakao Developers 콘솔에서 플랫폼과 도메인이 올바르게 등록되었는지 확인
- JavaScript 키를 사용하는지 확인 (REST API 키가 아님)

