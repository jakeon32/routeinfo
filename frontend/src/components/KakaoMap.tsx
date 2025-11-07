import { useEffect, useRef } from 'react';

// Kakao Maps 타입 정의
declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapProps {
  latitude: number;
  longitude: number;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  markers?: Array<{
    latitude: number;
    longitude: number;
    name: string;
  }>;
  height?: string;
}

function KakaoMap({ latitude, longitude, onLocationSelect, markers, height = '400px' }: KakaoMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainer.current || !window.kakao) return;

    const { kakao } = window;

    // 지도 생성
    const mapOption = {
      center: new kakao.maps.LatLng(latitude || 37.5665, longitude || 126.9780), // 기본값: 서울시청
      level: 3
    };

    const map = new kakao.maps.Map(mapContainer.current, mapOption);
    mapRef.current = map;

    // 클릭 이벤트 등록 (위치 선택 모드)
    if (onLocationSelect) {
      let marker: any = null;

      // 초기 마커 표시
      if (latitude && longitude) {
        marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(latitude, longitude),
          map: map
        });
      }

      kakao.maps.event.addListener(map, 'click', function(mouseEvent: any) {
        const latlng = mouseEvent.latLng;

        // 기존 마커 제거
        if (marker) {
          marker.setMap(null);
        }

        // 새 마커 생성
        marker = new kakao.maps.Marker({
          position: latlng,
          map: map
        });

        // 주소 검색
        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result: any, status: any) => {
          let address = '';
          if (status === kakao.maps.services.Status.OK && result[0]) {
            address = result[0].address.address_name;
          }
          onLocationSelect(latlng.getLat(), latlng.getLng(), address);
        });
      });
    }

    // 여러 마커 표시 (읽기 전용 모드)
    if (markers && markers.length > 0) {
      const bounds = new kakao.maps.LatLngBounds();

      markers.forEach(markerData => {
        const position = new kakao.maps.LatLng(markerData.latitude, markerData.longitude);

        const marker = new kakao.maps.Marker({
          position: position,
          map: map
        });

        // 인포윈도우 생성
        const infowindow = new kakao.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:12px;">${markerData.name}</div>`
        });

        kakao.maps.event.addListener(marker, 'mouseover', function() {
          infowindow.open(map, marker);
        });

        kakao.maps.event.addListener(marker, 'mouseout', function() {
          infowindow.close();
        });

        bounds.extend(position);
      });

      // 모든 마커가 보이도록 지도 범위 조정
      if (markers.length > 1) {
        map.setBounds(bounds);
      }
    }

  }, [latitude, longitude, markers, onLocationSelect]);

  return (
    <div
      ref={mapContainer}
      style={{ width: '100%', height }}
      className="rounded-lg border border-gray-300"
    />
  );
}

export default KakaoMap;
