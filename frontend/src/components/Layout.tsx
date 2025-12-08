import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();

    const menuItems = [
        { path: '/', label: '대시보드', icon: '📊' },
        { path: '/stations', label: '정거장 관리', icon: '🚏' },
        { path: '/routes', label: '노선 관리', icon: '🚌' },
        { path: '/schedules', label: '스케줄 관리', icon: '📅' },
    ];

    return (
        <div className="flex min-h-screen bg-[#F5F6FA]">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg fixed h-full z-10 hidden md:block border-r border-gray-100">
                <div className="p-6 border-b border-gray-100 bg-white">
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-[#0FBA81]">●</span> RouteInfo
                    </h1>
                </div>

                <div className="h-full overflow-y-auto sidebar-scroll pb-20">
                    <nav className="p-4 space-y-1">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2 mt-2">
                            Overview
                        </div>
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-[#0FBA81]/10 text-[#0FBA81]'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* User Profile */}
                <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 font-bold">
                            AD
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Admin User</p>
                            <p className="text-xs text-gray-500">admin@routeinfo.com</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-x-hidden">
                {/* Mobile Header */}
                <div className="md:hidden mb-6 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-[#0FBA81]">●</span> RouteInfo
                    </h1>
                    <button className="text-gray-500 p-2 hover:bg-gray-100 rounded-lg">
                        <span className="text-xl">☰</span>
                    </button>
                    {/* Mobile menu toggle implementation omitted for simplicity */}
                </div>

                {/* Page Content */}
                <div className="max-w-7xl mx-auto h-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
