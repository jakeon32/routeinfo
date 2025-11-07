import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStationById, updateStation } from '../api/station';
import { getAllStops, createStop, updateStop, deleteStop } from '../api/stop';
import type { Station, Stop, CreateStopRequest } from '../types/station';
import KakaoMap from '../components/KakaoMap';
import { uploadPhoto, getPhotoUrl } from '../api/upload';

function StationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [isEditingStationName, setIsEditingStationName] = useState(false);
  const [stationName, setStationName] = useState('');
  const [editingStop, setEditingStop] = useState<Stop | null>(null);
  const [uploading, setUploading] = useState(false);
  const [stopFormData, setStopFormData] = useState<CreateStopRequest>({
    stationId: parseInt(id || '0'),
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    description: '',
    photoUrl: ''
  });

  // 정거장 정보 조회
  const fetchStation = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await getStationById(parseInt(id));
      setStation(data);
      setStationName(data.name);
      setError(null);
    } catch (err) {
      setError('정거장 정보를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStation();
  }, [id]);

  // 정거장 이름 수정
  const handleUpdateStationName = async () => {
    if (!station || !stationName.trim()) {
      alert('정거장 이름을 입력해주세요.');
      return;
    }

    try {
      await updateStation(station.stationId, { name: stationName });
      await fetchStation();
      setIsEditingStationName(false);
    } catch (err) {
      alert('저장에 실패했습니다.');
      console.error(err);
    }
  };

  // 승하차장 모달 열기
  const openStopModal = (stop?: Stop) => {
    if (stop) {
      setEditingStop(stop);
      setStopFormData({
        stationId: stop.stationId,
        name: stop.name,
        address: stop.address || '',
        latitude: Number(stop.latitude),
        longitude: Number(stop.longitude),
        description: stop.description || '',
        photoUrl: stop.photoUrl || ''
      });
    } else {
      setEditingStop(null);
      setStopFormData({
        stationId: parseInt(id || '0'),
        name: '',
        address: '',
        latitude: 0,
        longitude: 0,
        description: '',
        photoUrl: ''
      });
    }
    setIsStopModalOpen(true);
  };

  // 모달 닫기
  const closeStopModal = () => {
    setIsStopModalOpen(false);
    setEditingStop(null);
  };

  // 승하차장 생성/수정
  const handleStopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stopFormData.name.trim()) {
      alert('승하차장 이름을 입력해주세요.');
      return;
    }

    try {
      if (editingStop) {
        await updateStop(editingStop.stopId, stopFormData);
      } else {
        await createStop(stopFormData);
      }
      await fetchStation();
      closeStopModal();
    } catch (err) {
      alert('저장에 실패했습니다.');
      console.error(err);
    }
  };

  // 승하차장 삭제
  const handleDeleteStop = async (stopId: number, name: string) => {
    if (!confirm(`'${name}' 승하차장을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteStop(stopId);
      await fetchStation();
    } catch (err) {
      alert('삭제에 실패했습니다.');
      console.error(err);
    }
  };

  // 사진 파일 업로드
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 파일 형식 체크
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('jpg, jpeg, png, gif 형식의 이미지만 업로드 가능합니다.');
      return;
    }

    try {
      setUploading(true);
      const result = await uploadPhoto(file);
      setStopFormData({
        ...stopFormData,
        photoUrl: result.url
      });
      alert('사진이 업로드되었습니다.');
    } catch (err) {
      alert('사진 업로드에 실패했습니다.');
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-600">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error || '정거장을 찾을 수 없습니다.'}</p>
            <button
              onClick={() => navigate('/stations')}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              ← 목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
          <button
            onClick={() => navigate('/stations')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1"
          >
            ← 정거장 목록
          </button>
          <div className="flex flex-col gap-4">
            {/* 정거장 이름 */}
            <div className="flex items-center gap-2">
              {isEditingStationName ? (
                <>
                  <input
                    type="text"
                    value={stationName}
                    onChange={(e) => setStationName(e.target.value)}
                    className="text-2xl md:text-3xl font-bold text-gray-800 px-2 py-1 border-2 border-blue-500 rounded-lg focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleUpdateStationName}
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingStationName(false);
                      setStationName(station.name);
                    }}
                    className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                  >
                    취소
                  </button>
                </>
              ) : (
                <>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{station.name}</h1>
                  <button
                    onClick={() => setIsEditingStationName(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    ✏️ 수정
                  </button>
                </>
              )}
            </div>

            {/* 승하차장 수 */}
            <div className="flex items-center justify-between">
              <p className="text-gray-600 text-sm md:text-base">
                승하차장 {station.stops?.length || 0}개 등록됨
              </p>
              <button
                onClick={() => openStopModal()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                + 승하차장 추가
              </button>
            </div>
          </div>
        </div>

        {/* 지도 뷰 */}
        {station.stops && station.stops.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">승하차장 위치</h2>
            <KakaoMap
              latitude={Number(station.stops[0].latitude)}
              longitude={Number(station.stops[0].longitude)}
              markers={station.stops.map(stop => ({
                latitude: Number(stop.latitude),
                longitude: Number(stop.longitude),
                name: stop.name
              }))}
              height="400px"
            />
          </div>
        )}

        {/* 승하차장 목록 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {!station.stops || station.stops.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              등록된 승하차장이 없습니다. 승하차장을 추가해주세요.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 hidden sm:table-cell">사진</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">승하차장명</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 hidden md:table-cell">주소</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 hidden lg:table-cell">위도/경도</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {station.stops.map((stop) => (
                    <tr key={stop.stopId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm hidden sm:table-cell">
                        {stop.photoUrl ? (
                          <img
                            src={getPhotoUrl(stop.photoUrl)}
                            alt={stop.name}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                            없음
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{stop.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                        {stop.address || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                        {Number(stop.latitude).toFixed(4)}, {Number(stop.longitude).toFixed(4)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openStopModal(stop)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDeleteStop(stop.stopId, stop.name)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 승하차장 생성/수정 모달 */}
        {isStopModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingStop ? '승하차장 수정' : '승하차장 추가'}
                <span className="text-gray-600 text-base ml-2">({station.name})</span>
              </h2>

              <form onSubmit={handleStopSubmit}>
                <div className="space-y-4">
                  {/* 승하차장명 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      승하차장명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={stopFormData.name}
                      onChange={(e) => setStopFormData({ ...stopFormData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="예: 서울역 1번 출구"
                      required
                    />
                  </div>

                  {/* 주소 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      주소
                    </label>
                    <input
                      type="text"
                      value={stopFormData.address}
                      onChange={(e) => setStopFormData({ ...stopFormData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="예: 서울특별시 용산구 한강대로 405"
                    />
                  </div>

                  {/* 지도에서 위치 선택 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      위치 선택 <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">지도를 클릭하여 위치를 선택하세요</p>
                    <KakaoMap
                      latitude={stopFormData.latitude || 37.5665}
                      longitude={stopFormData.longitude || 126.9780}
                      onLocationSelect={(lat, lng, address) => {
                        setStopFormData({
                          ...stopFormData,
                          latitude: lat,
                          longitude: lng,
                          address: address || stopFormData.address
                        });
                      }}
                      height="300px"
                    />
                  </div>

                  {/* 위도/경도 (읽기 전용 표시) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        위도 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={stopFormData.latitude}
                        onChange={(e) => setStopFormData({ ...stopFormData, latitude: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        placeholder="37.554722"
                        required
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        경도 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={stopFormData.longitude}
                        onChange={(e) => setStopFormData({ ...stopFormData, longitude: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        placeholder="126.970833"
                        required
                        readOnly
                      />
                    </div>
                  </div>

                  {/* 설명 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      설명
                    </label>
                    <textarea
                      value={stopFormData.description}
                      onChange={(e) => setStopFormData({ ...stopFormData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="승하차장에 대한 추가 정보를 입력하세요"
                    />
                  </div>

                  {/* 사진 업로드 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      사진
                    </label>
                    <div className="space-y-2">
                      {/* 파일 업로드 버튼 */}
                      <div className="flex gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                        >
                          {uploading ? '업로드 중...' : '사진 업로드'}
                        </button>
                        <span className="text-xs text-gray-500 self-center">
                          jpg, jpeg, png, gif (최대 5MB)
                        </span>
                      </div>

                      {/* URL 직접 입력 */}
                      <input
                        type="text"
                        value={stopFormData.photoUrl}
                        onChange={(e) => setStopFormData({ ...stopFormData, photoUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="또는 URL을 직접 입력: https://example.com/photo.jpg"
                      />

                      {/* 사진 미리보기 */}
                      {stopFormData.photoUrl && (
                        <div className="mt-2">
                          <img
                            src={getPhotoUrl(stopFormData.photoUrl)}
                            alt="미리보기"
                            className="max-w-xs max-h-40 rounded-lg border border-gray-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end mt-6">
                  <button
                    type="button"
                    onClick={closeStopModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    {editingStop ? '수정' : '추가'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StationDetail;
