import { useState, useEffect } from 'react';
import { getAllRoutes, createRoute, updateRoute, deleteRoute } from '../api/route';
import type { Route, CreateRouteRequest } from '../types/route';

function RouteManagement() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState<Route | null>(null);
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
    const [formData, setFormData] = useState<CreateRouteRequest>({
        name: '',
        groupName: '',
        description: '',
        isActive: true
    });

    // 노선 목록 조회
    const fetchRoutes = async () => {
        try {
            setLoading(true);
            const data = await getAllRoutes();
            setRoutes(data);
            setError(null);
        } catch (err) {
            setError('노선 목록을 불러오는데 실패했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutes();
    }, []);

    // 모달 열기
    const openModal = (route?: Route) => {
        if (route) {
            setEditingRoute(route);
            setFormData({
                name: route.name,
                groupName: route.groupName || '',
                description: route.description || '',
                isActive: route.isActive
            });
        } else {
            setEditingRoute(null);
            setFormData({
                name: '',
                groupName: '',
                description: '',
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    // 모달 닫기
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRoute(null);
    };

    // 생성/수정 제출
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert('노선 이름을 입력해주세요.');
            return;
        }

        try {
            if (editingRoute) {
                await updateRoute(editingRoute.routeId, formData);
            } else {
                await createRoute(formData);
            }
            await fetchRoutes();
            closeModal();
            // If updating selected route, refresh selection
            if (editingRoute && selectedRoute?.routeId === editingRoute.routeId) {
                const updated = { ...editingRoute, ...formData } as Route;
                setSelectedRoute(updated);
            }
        } catch (err) {
            alert('저장에 실패했습니다.');
            console.error(err);
        }
    };

    // 삭제
    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`'${name}' 노선을 삭제하시겠습니까?`)) {
            return;
        }

        try {
            await deleteRoute(id);
            await fetchRoutes();
            if (selectedRoute?.routeId === id) {
                setSelectedRoute(null);
            }
        } catch (err) {
            alert('삭제에 실패했습니다.');
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-100px)]">
            {/* Left: Route List Card */}
            <div className="w-full md:w-1/3 flex flex-col gap-4">
                <div className="bg-white rounded-xl shadow-sm p-4 h-full flex flex-col border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800">노선 목록</h2>
                        <button
                            onClick={() => {
                                setSelectedRoute(null);
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
                            {routes.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                    등록된 노선이 없습니다.
                                </div>
                            ) : (
                                routes.map((route) => (
                                    <div
                                        key={route.routeId}
                                        onClick={() => setSelectedRoute(route)}
                                        className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedRoute?.routeId === route.routeId
                                                ? 'bg-[#0FBA81]/10 border-[#0FBA81] text-[#0FBA81]'
                                                : 'bg-gray-50 border-transparent hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="font-semibold">{route.name}</div>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${route.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                                {route.isActive ? '운행중' : '중단'}
                                            </span>
                                        </div>
                                        {route.groupName && (
                                            <div className="text-xs mt-1 opacity-70">
                                                {route.groupName}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Detail Card */}
            <div className="w-full md:w-2/3">
                <div className="bg-white rounded-xl shadow-sm p-6 h-full border border-gray-100 overflow-y-auto custom-scrollbar">
                    {selectedRoute ? (
                        <div className="h-full flex flex-col">
                            <div className="mb-6 flex justify-between items-start">
                                <div>
                                    <span className="text-xs font-semibold text-[#0FBA81] bg-[#0FBA81]/10 px-2 py-0.5 rounded-full mb-2 inline-block">
                                        SELECTED ROUTE
                                    </span>
                                    <h2 className="text-2xl font-bold text-gray-800">{selectedRoute.name}</h2>
                                    {selectedRoute.groupName && (
                                        <p className="text-gray-500 text-sm mt-1">{selectedRoute.groupName}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openModal(selectedRoute)}
                                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm transition-colors"
                                    >
                                        수정
                                    </button>
                                    <button
                                        onClick={() => handleDelete(selectedRoute.routeId, selectedRoute.name)}
                                        className="px-3 py-1.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 text-sm transition-colors"
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Status */}
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">운행 상태</h3>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${selectedRoute.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                        <span className="font-medium text-gray-700">{selectedRoute.isActive ? '현재 운행 중' : '운행 중단됨'}</span>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">설명</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">
                                        {selectedRoute.description || '등록된 설명이 없습니다.'}
                                    </p>
                                </div>

                                {/* Statistics (Placeholder) */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                        <h3 className="text-sm font-semibold text-gray-500 mb-1">등록일</h3>
                                        <p className="text-gray-800 font-medium">
                                            {new Date(selectedRoute.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                        <h3 className="text-sm font-semibold text-gray-500 mb-1">마지막 수정</h3>
                                        <p className="text-gray-800 font-medium">
                                            {new Date(selectedRoute.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-300">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <span className="text-2xl">🚌</span>
                            </div>
                            <p>왼쪽 목록에서 노선을 선택하거나 추가해주세요.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            {editingRoute ? '노선 수정' : '노선 추가'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        노선 이름 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0FBA81] focus:border-transparent outline-none transition-all"
                                        placeholder="예: 강남 순환 버스"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        그룹 이름
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.groupName}
                                        onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0FBA81] focus:border-transparent outline-none transition-all"
                                        placeholder="예: 서울 시티투어"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        설명
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0FBA81] focus:border-transparent outline-none transition-all"
                                        rows={3}
                                        placeholder="노선에 대한 설명을 입력하세요"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-4 h-4 text-[#0FBA81] border-gray-300 rounded focus:ring-[#0FBA81]"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                                        운행 중
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
                                    {editingRoute ? '수정' : '추가'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RouteManagement;
