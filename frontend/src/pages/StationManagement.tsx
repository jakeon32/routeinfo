import { useState, useEffect } from 'react';
import { getAllStations, createStation, updateStation, deleteStation } from '../api/station';
import { getAllStops, createStop, updateStop, deleteStop } from '../api/stop';
import type { Station, Stop, CreateStationRequest, CreateStopRequest } from '../types/station';

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
    setSelectedStation(null);
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">정거장 관리</h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">정거장 및 승하차장 정보를 관리합니다</p>
            </div>
            <button
              onClick={() => openStationModal()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full md:w-auto"
            >
              + 정거장 추가
            </button>
          </div>
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-600">로딩 중...</div>
          </div>
        )}

        {/* 에러 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* 정거장 목록 */}
        {!loading && !error && (
          <div className="space-y-4">
            {stations.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                등록된 정거장이 없습니다. 정거장을 추가해주세요.
              </div>
            ) : (
              stations.map((station) => (
                <div key={station.stationId} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* 정거장 헤더 */}
                  <div className="bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{station.name}</h3>
                      <p className="text-sm text-gray-600">
                        승하차장 {station.stops?.length || 0}개
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openStopModal(station)}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors"
                      >
                        + 승하차장
                      </button>
                      <button
                        onClick={() => openStationModal(station)}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteStation(station.stationId, station.name)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  {/* 승하차장 목록 */}
                  {station.stops && station.stops.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">승하차장명</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 hidden md:table-cell">주소</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 hidden lg:table-cell">위도/경도</th>
                            <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700">관리</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {station.stops.map((stop) => (
                            <tr key={stop.stopId} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-900">{stop.name}</td>
                              <td className="px-4 py-2 text-sm text-gray-600 hidden md:table-cell">
                                {stop.address || '-'}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600 hidden lg:table-cell">
                                {Number(stop.latitude).toFixed(4)}, {Number(stop.longitude).toFixed(4)}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => openStopModal(station, stop)}
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
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500">
                      등록된 승하차장이 없습니다. "+ 승하차장" 버튼을 눌러 추가해주세요.
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* 정거장 생성/수정 모달 */}
        {isStationModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="승하차장에 대한 추가 정보를 입력하세요"
                    />
                  </div>

                  {/* 사진 URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      사진 URL
                    </label>
                    <input
                      type="text"
                      value={stopFormData.photoUrl}
                      onChange={(e) => setStopFormData({ ...stopFormData, photoUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/photo.jpg"
                    />
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

export default StationManagement;
