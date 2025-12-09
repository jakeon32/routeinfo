import { useEffect, useRef, useState } from 'react';
import { loadKakaoMapScript } from '../utils/kakaoMapLoader';

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
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Search State */
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // Kakao Maps SDK 로드
  useEffect(() => {
    loadKakaoMapScript()
      .then(() => {
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error('Kakao Maps 로드 실패:', err);
        setError(err.message);
      });
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !window.kakao || !isLoaded) return;

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

      kakao.maps.event.addListener(map, 'click', function (mouseEvent: any) {
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

        // 주소 검색 및 부모 컴포넌트 알림
        searchDetailAddrFromCoords(latlng, function (result: any, status: any) {
          let address = '';
          if (status === kakao.maps.services.Status.OK && result[0]) {
            address = result[0].address.address_name;
          }
          onLocationSelect(latlng.getLat(), latlng.getLng(), address);
        });
      });

      const geocoder = new kakao.maps.services.Geocoder();
      function searchDetailAddrFromCoords(coords: any, callback: any) {
        geocoder.coord2Address(coords.getLng(), coords.getLat(), callback);
      }
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

        kakao.maps.event.addListener(marker, 'mouseover', function () {
          infowindow.open(map, marker);
        });

        kakao.maps.event.addListener(marker, 'mouseout', function () {
          infowindow.close();
        });

        bounds.extend(position);
      });

      // 모든 마커가 보이도록 지도 범위 조정
      if (markers.length > 1) {
        map.setBounds(bounds);
      }
    }

  }, [latitude, longitude, markers, onLocationSelect, isLoaded]);

  // 장소 검색 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim() || !window.kakao) return;

    const ps = new window.kakao.maps.services.Places();

    ps.keywordSearch(keyword, (data: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setSearchResults(data);
        setIsSearchVisible(true);

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정
        const bounds = new window.kakao.maps.LatLngBounds();
        for (let i = 0; i < data.length; i++) {
          bounds.extend(new window.kakao.maps.LatLng(data[i].y, data[i].x));
        }
        if (mapRef.current) {
          mapRef.current.setBounds(bounds);
        }

      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 존재하지 않습니다.');
        setSearchResults([]);
      } else if (status === window.kakao.maps.services.Status.ERROR) {
        alert('검색 중 오류가 발생했습니다.');
      }
    });
  };

  const moveToLocation = (place: any) => {
    const moveLatLon = new window.kakao.maps.LatLng(place.y, place.x);

    if (mapRef.current) {
      mapRef.current.setCenter(moveLatLon);
      mapRef.current.setLevel(3);
    }

    // 만약 선택 모드라면 마커 찍고 주소 업데이트
    if (onLocationSelect) {
      // Simulate click or reuse logic?
      // let's just create marker and update
      // Note: Ideally we should reuse the marker instance from the useEffect for consistency,
      // but without refactoring the whole component state, we'll rely on the map center update
      // AND triggering the callback. 
      // However, for best UX, let's just center the map. The user can click to confirm exact spot or
      // we can auto-select.
      // Let's auto-select:
      onLocationSelect(parseFloat(place.y), parseFloat(place.x), place.address_name || place.road_address_name);

      // We also need to visually update the marker if possible, but the useEffect creates a local 'marker' variable.
      // To properly update marker, we'd need to store marker in a ref accessible here. 
      // For now, let's just centering. The User can click again or we trust the state update will re-render if we put marker logic in effect dependent on lat/lng props (currently it is).
      // Wait, the useEffect only runs on mount or if lat/lng changes?
      // Yes, [latitude, longitude...]. So if onLocationSelect updates parent state, and parent passes new lat/lng, component re-renders.
      // But re-rendering re-initializes map? 
      // No, we should avoid re-initializing map on every lat/lng change if map already exists.
      // The current implementation re-initializes map on every lat/lng change because of the dependency array.
      // This is inefficient but functional for now. Let's stick to it.
    }
    setIsSearchVisible(false);
  };


  if (error) {
    return (
      <div
        style={{ width: '100%', height }}
        className="rounded-lg border border-red-300 bg-red-50 flex items-center justify-center"
      >
        <div className="text-red-600 text-sm text-center p-4">
          <p className="font-semibold">지도 로드 실패</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        style={{ width: '100%', height }}
        className="rounded-lg border border-gray-300 bg-gray-50 flex items-center justify-center"
      >
        <div className="text-gray-500 text-sm">지도 로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: '100%', height }}>
      {/* Search Box Overlay */}
      {onLocationSelect && (
        <div className="absolute top-2 left-2 right-2 z-10 flex flex-col gap-1">
          <form onSubmit={handleSearch} className="flex shadow-md">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="장소 검색 (예: 강남역, 시청)"
              className="flex-1 px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg outline-none text-sm bg-white"
            />
            <button
              type="submit"
              className="bg-[#0FBA81] text-white px-4 py-2 rounded-r-lg text-sm font-medium hover:bg-[#0e9f6e]"
            >
              검색
            </button>
          </form>

          {/* Search Results Dropdown */}
          {isSearchVisible && searchResults.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto mt-1">
              <ul>
                {searchResults.map((place, idx) => (
                  <li
                    key={idx}
                    onClick={() => moveToLocation(place)}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                  >
                    <div className="font-medium text-sm text-gray-800">{place.place_name}</div>
                    <div className="text-xs text-gray-500">{place.address_name}</div>
                  </li>
                ))}
              </ul>
              <div
                className="p-2 text-center text-xs text-gray-500 cursor-pointer bg-gray-50 hover:bg-gray-100"
                onClick={() => setIsSearchVisible(false)}
              >
                닫기
              </div>
            </div>
          )}
        </div>
      )}

      <div
        ref={mapContainer}
        style={{ width: '100%', height }}
        className="rounded-lg border border-gray-300"
      />
    </div>
  );
}

export default KakaoMap;
