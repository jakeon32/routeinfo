// Kakao Maps SDK 동적 로드
export const loadKakaoMapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 이미 로드되었는지 확인
    if (window.kakao && window.kakao.maps) {
      resolve();
      return;
    }

    // 환경 변수에서 API 키 가져오기
    const appKey = import.meta.env.VITE_KAKAO_MAPS_APP_KEY;

    if (!appKey) {
      reject(new Error('Kakao Maps API 키가 설정되지 않았습니다. .env 파일을 확인하세요.'));
      return;
    }

    // 스크립트 태그 생성
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`;
    script.async = true;

    script.onload = () => {
      // SDK 로드 완료 후 kakao.maps.load 호출
      window.kakao.maps.load(() => {
        resolve();
      });
    };

    script.onerror = () => {
      reject(new Error('Kakao Maps SDK 로드 실패'));
    };

    document.head.appendChild(script);
  });
};

// Kakao Maps 타입 정의
declare global {
  interface Window {
    kakao: any;
  }
}
