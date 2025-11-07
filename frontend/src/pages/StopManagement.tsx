import { useState, useEffect } from 'react';
import { getAllStops, createStop, updateStop, deleteStop } from '../api/stop';
import { getAllStations } from '../api/station';
import type { Stop, Station, CreateStopRequest } from '../types/station';

function StopManagement() {
  const [stops, setStops] = useState<Stop[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<Stop | null>(null);
  const [filterStationId, setFilterStationId] = useState<number | undefined>(undefined);
  const [formData, setFormData] = useState<CreateStopRequest>({
    stationId: 0,
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    description: '',
    photoUrl: ''
  });

  // 승하차장 목록 조회
  const fetchStops = async (stationId?: number) => {
    try {
      setLoading(true);
      const data = await getAllStops(stationId);
      setStops(data);
      setError(null);
    } catch (err) {
      setError('승하차장 목록을 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 정거장 목록 조회
  const fetchStations = async () => {
    try {
      const data = await getAllStations();
      setStations(data);
    } catch (err) {
      console.error('정거장 목록 조회 실패:', err);
    }
  };

  useEffect(() => {
    fetchStations();
    fetchStops();
  }, []);

  // 정거장 필터 변경
  const handleFilterChange = (stationId: string) => {
    const id = stationId ? parseInt(stationId) : undefined;
    setFilterStationId(id);
    fetchStops(id);
  };

  // 모달 열기 (생성 또는 수정)
  const openModal = (stop?: Stop) => {
    if (stop) {
      setEditingStop(stop);
      setFormData({
        stationId: stop.stationId,
        name: stop.name,
        address: stop.address || '',
        latitude: stop.latitude,
        longitude: stop.longitude,
        description: stop.description || '',
        photoUrl: stop.photoUrl || ''
      });
    } else {
      setEditingStop(null);
      setFormData({
        stationId: filterStationId || (stations[0]?.stationId || 0),
        name: '',
        address: '',
        latitude: 0,
        longitude: 0,
        description: '',
        photoUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStop(null);
  };

  // 승하차장 생성/수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.stationId) {
      alert('필수 항목을 입력해주세요.');
      return;
    }

    try {
      if (editingStop) {
        await updateStop(editingStop.stopId, formData);
      } else {
        await createStop(formData);
      }
      await fetchStops(filterStationId);
      closeModal();
    } catch (err) {
      alert('저장에 실패했습니다.');
      console.error(err);
    }
  };

  // 승하차장 삭제
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`'${name}' 승하차장을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteStop(id);
      await fetchStops(filterStationId);
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
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">승하차장 관리</h1>
                <p className="text-gray-600 mt-1 text-sm md:text-base">승하차장 정보를 등록하고 관리합니다</p>
              </div>
              <button
                onClick={() => openModal()}
                disabled={stations.length === 0}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full md:w-auto disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                + 승하차장 추가
              </button>
            </div>

            {/* 정거장 필터 */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">정거장 필터:</label>
              <select
                value={filterStationId || ''}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">전체</option>
                {stations.map((station) => (
                  <option key={station.stationId} value={station.stationId}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 정거장이 없을 때 안내 */}
        {stations.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              먼저 정거장을 등록해주세요. 승하차장은 정거장에 속해야 합니다.
            </p>
          </div>
        )}

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

        {/* 승하차장 목록 */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {stops.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {filterStationId
                  ? '이 정거장에 등록된 승하차장이 없습니다.'
                  : '등록된 승하차장이 없습니다. 승하차장을 추가해주세요.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">정거장</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">승하차장명</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 hidden md:table-cell">주소</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 hidden lg:table-cell">위도/경도</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stops.map((stop) => (
                      <tr key={stop.stopId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{stop.stopId}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{stop.station?.name}</td>
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
                              onClick={() => openModal(stop)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleDelete(stop.stopId, stop.name)}
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
        )}

        {/* 생성/수정 모달 */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingStop ? '승하차장 수정' : '승하차장 추가'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* 정거장 선택 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      정거장 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.stationId}
                      onChange={(e) => setFormData({ ...formData, stationId: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={!!editingStop}
                    >
                      <option value={0}>정거장을 선택하세요</option>
                      {stations.map((station) => (
                        <option key={station.stationId} value={station.stationId}>
                          {station.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 승하차장명 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      승하차장명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
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
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
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
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                      value={formData.photoUrl}
                      onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
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

export default StopManagement;
