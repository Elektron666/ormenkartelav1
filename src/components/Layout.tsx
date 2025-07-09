import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  Package, 
  ArrowRightLeft, 
  BarChart3, 
  Quote,
  Settings, 
  Menu, 
  X,
  Download,
  Upload,
  FileText
} from 'lucide-react';
import { Button } from './ui/Button';
import { DateTimeDisplay } from './DateTimeDisplay';
import { GitHubSync } from './GitHubSync';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Ana Sayfa', icon: Home },
  { id: 'customers', label: 'Müşteriler', icon: Users },
  { id: 'products', label: 'Kartelalar', icon: Package },
  { id: 'transactions', label: 'Hareketler', icon: ArrowRightLeft },
  { id: 'reports', label: 'Raporlar', icon: BarChart3 },
  { id: 'stock', label: 'Kartela Stok', icon: Package },
  { id: 'quotes', label: 'Motivasyon', icon: Quote },
  { id: 'notes', label: 'Notlarım', icon: FileText },
  { id: 'settings', label: 'Ayarlar', icon: Settings },
];

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-ormen-600 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36c-.5-.23-1.05-.36-1.64-.36-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l2.36 2.36c-.23.5-.36 1.05-.36 1.64 0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4c-.59 0-1.14.13-1.64.36L14 12l2.36-2.36c.5.23 1.05.36 1.64.36 2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4c0 .59.13 1.14.36 1.64L12 10 9.64 7.64z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">ORMEN TEKSTİL</h1>
              <p className="text-xs text-gray-500">Kartela Sistemi V1</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={X}
            onClick={toggleSidebar}
            className="lg:hidden"
          />
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive 
                      ? 'bg-ormen-100 text-ormen-700 border-r-2 border-ormen-600' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Quick Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              fullWidth
              onClick={() => {
                // Handle backup export
                const event = new CustomEvent('export-backup');
                window.dispatchEvent(event);
              }}
            >
              Yedek Al
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Upload}
              fullWidth
              onClick={() => {
                // Handle backup import
                const event = new CustomEvent('import-backup');
                window.dispatchEvent(event);
              }}
            >
              Yedek Yükle
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            icon={Menu}
            onClick={toggleSidebar}
            className="lg:hidden"
          />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {menuItems.find(item => item.id === currentPage)?.label || 'Ana Sayfa'}
              </h2>
            </div>
            
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
              
              {/* Date Time Display */}
              <DateTimeDisplay />
              
              {/* GitHub Sync Status */}
              <GitHubSync />
              
              {/* User info */}
              <div className="flex items-center gap-x-2">
                <div className="h-8 w-8 rounded-full bg-ormen-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">A</span>
                </div>
                <span className="hidden lg:block text-sm font-medium text-gray-700">
                  ORMEN
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};