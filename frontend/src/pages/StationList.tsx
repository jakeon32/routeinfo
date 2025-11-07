import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllStations, createStation, deleteStation } from '../api/station';
import type { Station, CreateStationRequest } from '../types/station';

function StationList() {
  const navigate = useNavigate();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateStationRequest>({ name: '' });

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

  // 모달 열기
  const openModal = () => {
    setFormData({ name: '' });
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '' });
  };

  // 정거장 생성
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('정거장 이름을 입력해주세요.');
      return;
    }

    try {
      await createStation(formData);
      await fetchStations();
      closeModal();
    } catch (err) {
      alert('저장에 실패했습니다.');
      console.error(err);
    }
  };

  // 정거장 삭제
  const handleDelete = async (id: number, name: string) => {
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">정거장 관리</h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">정거장을 클릭하면 승하차장을 관리할 수 있습니다</p>
            </div>
            <button
              onClick={() => openModal()}
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
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {stations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                등록된 정거장이 없습니다. 정거장을 추가해주세요.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">정거장명</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 hidden md:table-cell">승하차장 수</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 hidden lg:table-cell">등록일</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stations.map((station) => (
                      <tr
                        key={station.stationId}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/stations/${station.stationId}`)}
                      >
                        <td className="px-4 py-3 text-sm text-gray-900">{station.stationId}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{station.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                          {station.stops?.length || 0}개
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                          {new Date(station.createdAt).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-4 py-3 text-sm" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleDelete(station.stationId, station.name)}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                정거장 추가
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    정거장 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 서울역"
                    required
                  />
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
                    추가
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

export default StationList;
