import { useState, useEffect } from 'react';
import { getAllStations, createStation, updateStation, deleteStation } from '../api/station';
import { createStop, updateStop, deleteStop } from '../api/stop';
import type { Station, Stop, CreateStationRequest, CreateStopRequest } from '../types/station';
import KakaoMap from '../components/KakaoMap';
import { uploadFile } from '../api/upload';

function StationManagement() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [editingStop, setEditingStop] = useState<Stop | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [stationFormData, setStationFormData] = useState<CreateStationRequest>({ name: '' });
  const [stopFormData, setStopFormData] = useState<CreateStopRequest>({
    stationId: 0,
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    description: '',
    photoUrl: ''
  });
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [isUploading, setIsUploading] = useState(false);

  // 위치 선택 핸들러
  const handleLocationSelect = (lat: number, lng: number, addr: string) => {
    setStopFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: addr || prev.address
    }));
  };

  // 파일 업로드 핸들러
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const { url } = await uploadFile(file);
      setStopFormData(prev => ({ ...prev, photoUrl: url }));
    } catch (err) {
      console.error('File upload error:', err);
      alert('파일 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  // 정거장 목록 조회
  const fetchStations = async () => {
    try {
      setLoading(true);
      const data = await getAllStations();
      setStations(data);
      setError(null);
    } catch (err) {
      setError('정거장 목록을 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  // 정거장 모달 열기
  const openStationModal = (station?: Station) => {
    if (station) {
      setEditingStation(station);
      setStationFormData({ name: station.name, primaryStopId: station.primaryStopId || undefined });
    } else {
      setEditingStation(null);
      setStationFormData({ name: '' });
    }
    setIsStationModalOpen(true);
  };

  // 승하차장 모달 열기
  const openStopModal = (station: Station, stop?: Stop) => {
    setSelectedStation(station);
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
        stationId: station.stationId,
        name: '',
        address: '',
        latitude: 0,
        longitude: 0,
        description: '',
        photoUrl: ''
      });
    }

    setUploadMode('url');
    setIsStopModalOpen(true);
  };

  // 모달 닫기
  const closeStationModal = () => {
    setIsStationModalOpen(false);
    setEditingStation(null);
    setStationFormData({ name: '' });
  };

  const closeStopModal = () => {
    setIsStopModalOpen(false);
    setEditingStop(null);
    // setSelectedStation(null); // Keep selected station when closing stop modal
  };

  // 정거장 생성/수정
  const handleStationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stationFormData.name.trim()) {
      alert('정거장 이름을 입력해주세요.');
      return;
    }

    try {
      if (editingStation) {
        await updateStation(editingStation.stationId, stationFormData);
      } else {
        await createStation(stationFormData);
      }
      await fetchStations();
      closeStationModal();
    } catch (err) {
      alert('저장에 실패했습니다.');
      console.error(err);
    }
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
      await fetchStations();
      closeStopModal();
    } catch (err) {
      alert('저장에 실패했습니다.');
      console.error(err);
    }
  };

  // 정거장 삭제
  const handleDeleteStation = async (id: number, name: string) => {
    if (!confirm(`'${name}' 정거장을 삭제하시겠습니까?\n\n이 정거장에 속한 모든 승하차장도 함께 삭제됩니다.`)) {
      return;
    }

    try {
      await deleteStation(id);
      await fetchStations();
      setSelectedStation(null); // Deselect station after deletion
    } catch (err) {
      alert('삭제에 실패했습니다.');
      console.error(err);
    }
  };

  // 승하차장 삭제
  const handleDeleteStop = async (id: number, name: string) => {
    if (!confirm(`'${name}' 승하차장을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteStop(id);
      await fetchStations();
    } catch (err) {
      alert('삭제에 실패했습니다.');
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-100px)]">
      {/* Left: Station List Card */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 h-full flex flex-col border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">정거장 목록</h2>
            <button
              onClick={() => {
                setSelectedStation(null);
                openStationModal();
              }}
              className="bg-[#0FBA81] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#0e9f6e] transition-colors shadow-sm flex items-center gap-1"
            >
              <span>+</span> 추가
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">로딩 중...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
              {stations.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  등록된 정거장이 없습니다.
                </div>
              ) : (
                stations.map((station) => (
                  <div
                    key={station.stationId}
                    onClick={() => setSelectedStation(station)}
                    className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedStation?.stationId === station.stationId
                      ? 'bg-[#0FBA81]/10 border-[#0FBA81] text-[#0FBA81]'
                      : 'bg-gray-50 border-transparent hover:bg-gray-100 text-gray-700'
                      }`}
                  >
                    <div className="font-semibold">{station.name}</div>
                    <div className="text-xs mt-1 opacity-70">
                      승하차장 {station.stops?.length || 0}개
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Detail/Create Card */}
      <div className="w-full md:w-2/3">
        <div className="bg-white rounded-xl shadow-sm p-6 h-full border border-gray-100 overflow-y-auto custom-scrollbar">
          {selectedStation ? (
            <div className="h-full flex flex-col">
              <div className="mb-4 flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-[#0FBA81] bg-[#0FBA81]/10 px-2 py-0.5 rounded-full mb-2 inline-block">
                    SELECTED
                  </span>
                  <h2 className="text-xl font-bold text-gray-800">{selectedStation.name}</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openStationModal(selectedStation)}
                    className="text-gray-400 hover:text-blue-500"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteStation(selectedStation.stationId, selectedStation.name)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    삭제
                  </button>
                </div>
              </div>

              {/* Stops List for Selected Station */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-700">승하차장 목록</h3>
                  <button
                    onClick={() => openStopModal(selectedStation)}
                    className="text-sm text-[#0FBA81] hover:underline font-medium"
                  >
                    + 승하차장 추가
                  </button>
                </div>

                {selectedStation.stops && selectedStation.stops.length > 0 ? (
                  <div className="space-y-3">
                    {selectedStation.stops.map(stop => (
                      <div key={stop.stopId} className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-800">{stop.name}</div>
                          <div className="text-sm text-gray-500 mt-0.5">{stop.address || '주소 없음'}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            Lat: {stop.latitude}, Lng: {stop.longitude}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openStopModal(selectedStation, stop)} className="text-gray-400 hover:text-blue-500 text-sm">수정</button>
                          <button onClick={() => handleDeleteStop(stop.stopId, stop.name)} className="text-gray-400 hover:text-red-500 text-sm">삭제</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    등록된 승하차장이 없습니다.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-300">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🚏</span>
              </div>
              <p>왼쪽 목록에서 정거장을 선택하거나 추가해주세요.</p>
            </div>
          )}
        </div>
      </div>

      {/* 정거장 생성/수정 모달 */}
      {isStationModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingStation ? '정거장 수정' : '정거장 추가'}
            </h2>

            <form onSubmit={handleStationSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  정거장 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={stationFormData.name}
                  onChange={(e) => setStationFormData({ ...stationFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0FBA81] focus:border-transparent outline-none transition-all"
                  placeholder="예: 서울역"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <button
                  type="button"
                  onClick={closeStationModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0FBA81] hover:bg-[#0e9f6e] text-white rounded-lg transition-colors font-medium"
                >
                  {editingStation ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 승하차장 생성/수정 모달 */}
      {isStopModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingStop ? '승하차장 수정' : '승하차장 추가'}
              {selectedStation && <span className="text-gray-600 text-base ml-2">({selectedStation.name})</span>}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0FBA81] focus:border-transparent outline-none transition-all"
                    placeholder="예: 서울역 1번 출구"
                    required
                  />
                </div>

                {/* 주소 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    위치 찾기 & 주소
                  </label>
                  <div className="mb-3 rounded-lg overflow-hidden border border-gray-300">
                    <KakaoMap
                      latitude={stopFormData.latitude || 37.5665}
                      longitude={stopFormData.longitude || 126.9780}
                      onLocationSelect={handleLocationSelect}
                      height="250px"
                    />
                  </div>
                  <input
                    type="text"
                    value={stopFormData.address}
                    onChange={(e) => setStopFormData({ ...stopFormData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0FBA81] focus:border-transparent outline-none transition-all"
                    placeholder="예: 서울특별시 용산구 한강대로 405"
                  />
                </div>

                {/* 위도/경도 */}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0FBA81] focus:border-transparent outline-none transition-all"
                      placeholder="37.554722"
                      required
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0FBA81] focus:border-transparent outline-none transition-all"
                      placeholder="126.970833"
                      required
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0FBA81] focus:border-transparent outline-none transition-all"
                    rows={3}
                    placeholder="승하차장에 대한 추가 정보를 입력하세요"
                  />
                </div>

                {/* 사진 URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    사진
                  </label>
                  <div className="flex gap-4 mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="uploadMode"
                        checked={uploadMode === 'url'}
                        onChange={() => setUploadMode('url')}
                        className="text-[#0FBA81] focus:ring-[#0FBA81]"
                      />
                      <span className="text-sm text-gray-600">URL 입력</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="uploadMode"
                        checked={uploadMode === 'file'}
                        onChange={() => setUploadMode('file')}
                        className="text-[#0FBA81] focus:ring-[#0FBA81]"
                      />
                      <span className="text-sm text-gray-600">직접 업로드</span>
                    </label>
                  </div>

                  {uploadMode === 'url' ? (
                    <input
                      type="text"
                      value={stopFormData.photoUrl}
                      onChange={(e) => setStopFormData({ ...stopFormData, photoUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0FBA81] focus:border-transparent outline-none transition-all"
                      placeholder="https://example.com/photo.jpg"
                    />
                  ) : (
                    <div className="flex gap-2 items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#0FBA81]/10 file:text-[#0FBA81] hover:file:bg-[#0FBA81]/20"
                      />
                      {isUploading && <span className="text-xs text-gray-400">업로드 중...</span>}
                    </div>
                  )}
                  {stopFormData.photoUrl && (
                    <div className="mt-2 relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      <img src={stopFormData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setStopFormData({ ...stopFormData, photoUrl: '' })}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                  )}
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
                  className="px-4 py-2 bg-[#0FBA81] hover:bg-[#0e9f6e] text-white rounded-lg transition-colors font-medium"
                >
                  {editingStop ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StationManagement;
