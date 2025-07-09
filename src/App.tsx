import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { AppProvider, useApp } from './context/AppContext';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Products } from './pages/Products';
import { Stock } from './pages/Stock';
import { Transactions } from './pages/Transactions';
import { Reports } from './pages/Reports';
import { Quotes } from './pages/Quotes';
import { Notes } from './pages/Notes';
import { Settings } from './pages/Settings';
import { databaseService } from './utils/database';
import { SecurityManager } from './utils/security';
import { analytics, setupAutoTracking } from './utils/analytics';
import { PerformanceMonitor } from './utils/performance';
import { useOfflineSync } from './hooks/useOfflineSync';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { createBackup, restoreBackup } = useApp();
  const { isOnline, pendingChanges } = useOfflineSync();
  const performanceMonitor = PerformanceMonitor.getInstance();

  // Initialize services
  useEffect(() => {
    const initializeApp = async () => {
      performanceMonitor.startMeasure('app-initialization');
      
      try {
        // Initialize database
        await databaseService.init();
        
        // Check existing session
        if (SecurityManager.validateSession()) {
          setIsLoggedIn(true);
        }
        
        // Setup analytics
        setupAutoTracking();
        analytics.trackPageView('app-start');
        
        performanceMonitor.endMeasure('app-initialization');
        
      } catch (error) {
        console.error('App initialization failed:', error);
        analytics.trackError(error as Error, 'app-initialization');
      }
    };

    initializeApp();
  }, []);

  const handleLogin = (success: boolean) => {
    if (success) {
      SecurityManager.createSession();
      setIsLoggedIn(true);
      analytics.trackUserAction('login', { success: true });
      toast.success('Başarıyla giriş yapıldı');
    } else {
      analytics.trackUserAction('login', { success: false });
      toast.error('Giriş başarısız');
    }
  };

  useEffect(() => {
    // Handle backup export
    const handleExportBackup = () => {
      try {
        createBackup();
        toast.success('Yedek başarıyla oluşturuldu');
      } catch (error) {
        toast.error('Yedek oluşturulurken hata oluştu');
      }
    };

    // Handle backup import
    const handleImportBackup = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const backupData = JSON.parse(e.target?.result as string);
              restoreBackup(backupData);
              toast.success('Yedek başarıyla geri yüklendi');
              window.location.reload(); // Refresh to show restored data
            } catch (error) {
              toast.error('Yedek dosyası geçersiz');
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    };

    window.addEventListener('export-backup', handleExportBackup);
    window.addEventListener('import-backup', handleImportBackup);

    return () => {
      window.removeEventListener('export-backup', handleExportBackup);
      window.removeEventListener('import-backup', handleImportBackup);
    };
  }, [createBackup, restoreBackup]);

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    performanceMonitor.startMeasure(`page-render-${currentPage}`);
    
    let pageComponent;
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'customers':
        return <Customers />;
      case 'products':
        return <Products />;
      case 'stock':
        return <Stock />;
      case 'transactions':
        return <Transactions />;
      case 'reports':
        return <Reports />;
      case 'quotes':
        return <Quotes />;
      case 'notes':
        return <Notes />;
      case 'settings':
        return <Settings />;
      default:
        pageComponent = <Dashboard />;
    }
    
    performanceMonitor.endMeasure(`page-render-${currentPage}`);
    analytics.trackPageView(currentPage);
    
    return pageComponent;
  };

  return (
    <ErrorBoundary>
      <Layout 
        currentPage={currentPage} 
        onPageChange={(page) => {
          setCurrentPage(page);
          analytics.trackUserAction('navigation', { from: currentPage, to: page });
        }}
      >
        {/* Offline indicator */}
        {!isOnline && (
          <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm">
            🔌 Çevrimdışı mod - {pendingChanges} değişiklik senkronizasyon bekliyor
          </div>
        )}
        
        {renderPage()}
      </Layout>
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;