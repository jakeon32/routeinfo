import { useState, useEffect } from 'react';
import { getAllSchedules, createSchedule, updateSchedule, deleteSchedule } from '../api/schedule';
import { getAllRoutes } from '../api/route';
import type { Schedule, CreateScheduleRequest } from '../types/schedule';
import type { Route } from '../types/route';

function ScheduleManagement() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

    const [formData, setFormData] = useState<CreateScheduleRequest>({
        routeId: 0,
        startDate: '',
        endDate: '',
        scheduleType: 'REGULAR',
        daysOfWeek: '', // e.g., "MON,TUE,WED"
        isActive: true
    });

    // 데이터 조회
    const fetchData = async () => {
        try {
            setLoading(true);
            const [schedulesData, routesData] = await Promise.all([
                getAllSchedules(),
                getAllRoutes()
            ]);
            setSchedules(schedulesData);
            setRoutes(routesData);
            setError(null);
        } catch (err) {
            setError('스케줄 목록을 불러오는데 실패했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 모달 열기
    const openModal = (schedule?: Schedule) => {
        if (schedule) {
            setEditingSchedule(schedule);
            setFormData({
                routeId: schedule.routeId,
                startDate: schedule.startDate,
                endDate: schedule.endDate,
                scheduleType: schedule.scheduleType,
                daysOfWeek: schedule.daysOfWeek || '',
                isActive: schedule.isActive
            });
        } else {
            setEditingSchedule(null);
            // Default to first route if available
            const defaultRouteId = routes.length > 0 ? routes[0].routeId : 0;
            setFormData({
                routeId: defaultRouteId,
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                scheduleType: 'REGULAR',
                daysOfWeek: 'MON,TUE,WED,THU,FRI',
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    // 모달 닫기
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSchedule(null);
    };

    // 생성/수정 제출
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.routeId === 0) {
            alert('노선을 선택해주세요.');
            return;
        }

        try {
            if (editingSchedule) {
                await updateSchedule(editingSchedule.scheduleId, formData);
            } else {
                await createSchedule(formData);
            }
            await fetchData();
            closeModal();
            if (editingSchedule && selectedSchedule?.scheduleId === editingSchedule.scheduleId) {
                // Refresh selection logic could be improved but re-fetch handles list
                setSelectedSchedule(null);
            }
        } catch (err) {
            alert('저장에 실패했습니다.');
            console.error(err);
        }
    };

    // 삭제
    const handleDelete = async (id: number) => {
        if (!confirm('정말로 이 스케줄을 삭제하시겠습니까?')) {
            return;
        }

        try {
            await deleteSchedule(id);
            await fetchData();
            if (selectedSchedule?.scheduleId === id) {
                setSelectedSchedule(null);
            }
        } catch (err) {
            alert('삭제에 실패했습니다.');
            console.error(err);
        }
    };

    const getRouteName = (routeId: number) => {
        return routes.find(r => r.routeId === routeId)?.name || '알 수 없는 노선';
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-100px)]">
            {/* Left: Schedule List */}
            <div className="w-full md:w-1/3 flex flex-col gap-4">
                <div className="bg-white rounded-xl shadow-sm p-4 h-full flex flex-col border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800">스케줄 목록</h2>
                        <button
                            onClick={() => {
                                setSelectedSchedule(null);
                                openModal();
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
                            {schedules.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                    등록된 스케줄이 없습니다.
                                </div>
                            ) : (
                                schedules.map((schedule) => (
                                    <div
                                        key={schedule.scheduleId}
                                        onClick={() => setSelectedSchedule(schedule)}
                                        className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedSchedule?.scheduleId === schedule.scheduleId
                                                ? 'bg-[#0FBA81]/10 border-[#0FBA81] text-[#0FBA81]'
                                                : 'bg-gray-50 border-transparent hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold">{getRouteName(schedule.routeId)}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${schedule.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                                {schedule.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="text-xs opacity-70">
                                            {schedule.startDate} ~ {schedule.endDate}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Details */}
            <div className="w-full md:w-2/3">
                <div className="bg-white rounded-xl shadow-sm p-6 h-full border border-gray-100 overflow-y-auto custom-scrollbar">
                    {selectedSchedule ? (
                        <div className="h-full flex flex-col">
                            <div className="mb-6 flex justify-between items-start">
                                <div>
                                    <span className="text-xs font-semibold text-[#0FBA81] bg-[#0FBA81]/10 px-2 py-0.5 rounded-full mb-2 inline-block">
                                        SCHEDULE DETAILS
                                    </span>
                                    <h2 className="text-2xl font-bold text-gray-800">{getRouteName(selectedSchedule.routeId)}</h2>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openModal(selectedSchedule)}
                                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm transition-colors"
                                    >
                                        수정
                                    </button>
                                    <button
                                        onClick={() => handleDelete(selectedSchedule.scheduleId)}
                                        className="px-3 py-1.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 text-sm transition-colors"
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                        <h3 className="text-sm font-semibold text-gray-500 mb-1">유형</h3>
                                        <p className="text-gray-800 font-medium">
                                            {selectedSchedule.scheduleType === 'REGULAR' ? '정기 운행' : '1회성 운행'}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                        <h3 className="text-sm font-semibold text-gray-500 mb-1">운행 요일</h3>
                                        <p className="text-gray-800 font-medium break-all">
                                            {selectedSchedule.daysOfWeek || '-'}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">기간</h3>
                                    <div className="flex items-center gap-2 text-gray-800 font-medium">
                                        <span>{selectedSchedule.startDate}</span>
                                        <span>➔</span>
                                        <span>{selectedSchedule.endDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-300">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <span className="text-2xl">📅</span>
                            </div>
                            <p>왼쪽 목록에서 스케줄을 선택하거나 추가해주세요.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            {editingSchedule ? '스케줄 수정' : '스케줄 추가'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">노선 선택</label>
                                    <select
                                        value={formData.routeId}
                                        onChange={(e) => setFormData({ ...formData, routeId: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0FBA81] outline-none"
                                    >
                                        <option value={0}>노선 선택</option>
                                        {routes.map(r => (
                                            <option key={r.routeId} value={r.routeId}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">시작일</label>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0FBA81] outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">종료일</label>
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0FBA81] outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">유형</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="scheduleType"
                                                value="REGULAR"
                                                checked={formData.scheduleType === 'REGULAR'}
                                                onChange={() => setFormData({ ...formData, scheduleType: 'REGULAR' })}
                                                className="text-[#0FBA81] focus:ring-[#0FBA81]"
                                            />
                                            <span className="text-sm">정기 운행</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="scheduleType"
                                                value="ONCE"
                                                checked={formData.scheduleType === 'ONCE'}
                                                onChange={() => setFormData({ ...formData, scheduleType: 'ONCE' })}
                                                className="text-[#0FBA81] focus:ring-[#0FBA81]"
                                            />
                                            <span className="text-sm">1회성</span>
                                        </label>
                                    </div>
                                </div>

                                {formData.scheduleType === 'REGULAR' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">운행 요일 (예: MON,TUE)</label>
                                        <input
                                            type="text"
                                            value={formData.daysOfWeek}
                                            onChange={(e) => setFormData({ ...formData, daysOfWeek: e.target.value })}
                                            placeholder="MON,TUE,WED,THU,FRI"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0FBA81] outline-none"
                                        />
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isActiveSchedule"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-4 h-4 text-[#0FBA81] border-gray-300 rounded focus:ring-[#0FBA81]"
                                    />
                                    <label htmlFor="isActiveSchedule" className="text-sm font-medium text-gray-700">
                                        활성화
                                    </label>
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
                                    className="px-4 py-2 bg-[#0FBA81] hover:bg-[#0e9f6e] text-white rounded-lg transition-colors font-medium"
                                >
                                    {editingSchedule ? '수정' : '추가'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ScheduleManagement;
