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
   ```
   VITE_KAKAO_MAPS_APP_KEY=your_actual_api_key_here
   ```

3. `frontend/index.html`에서 API 키 업데이트:
   - `YOUR_APP_KEY`를 실제 API 키로 교체

## 주의사항

- `.env` 파일은 git에 커밋하지 마세요 (이미 .gitignore에 포함됨)
- API 키는 공개되지 않도록 주의하세요

