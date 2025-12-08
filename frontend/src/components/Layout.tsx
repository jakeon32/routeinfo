import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();

    const menuItems = [
        { path: '/', label: 'Overview', icon: '📊' },
        { path: '/stations', label: 'Stations', icon: '🚏' },
        // { path: '/routes', label: 'Routes', icon: '🛣️' }, // Future feature
        // { path: '/documents', label: 'Documents', icon: '📁' }, // Example from design
    ];

    return (
        <div className="flex min-h-screen bg-[#F5F6FA]">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg fixed h-full z-10 hidden md:block">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-[#0FBA81]">●</span> RouteInfo
                    </h1>
                </div>

                <nav className="p-4 space-y-1">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
                        Dashboard
                    </div>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                        ? 'bg-[#0FBA81]/10 text-[#0FBA81]'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="mr-3">{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile (Dummy) */}
                <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
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
            <main className="flex-1 md:ml-64 p-4 md:p-8">
                {/* Mobile Header */}
                <div className="md:hidden mb-6 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
                    <h1 className="text-lg font-bold text-gray-800">RouteInfo</h1>
                    <button className="text-gray-500">☰</button>
                    {/* Mobile menu toggle implementation omitted for simplicity, can be added if needed */}
                </div>

                {/* Page Content */}
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
