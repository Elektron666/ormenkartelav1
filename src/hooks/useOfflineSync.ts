import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface SyncItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'customer' | 'product' | 'transaction' | 'stockItem';
  data: any;
  timestamp: number;
}

const SYNC_QUEUE_KEY = 'ormen_sync_queue';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load sync queue from localStorage
  useEffect(() => {
    const savedQueue = localStorage.getItem(SYNC_QUEUE_KEY);
    if (savedQueue) {
      setSyncQueue(JSON.parse(savedQueue));
    }
  }, []);

  // Save sync queue to localStorage
  useEffect(() => {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(syncQueue));
  }, [syncQueue]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('İnternet bağlantısı geri geldi');
      // Auto-sync when coming back online
      if (syncQueue.length > 0) {
        processSyncQueue();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('İnternet bağlantısı kesildi - Çevrimdışı modda çalışıyor');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncQueue]);

  // Add item to sync queue
  const addToSyncQueue = useCallback((item: Omit<SyncItem, 'id' | 'timestamp'>) => {
    const syncItem: SyncItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    setSyncQueue(prev => [...prev, syncItem]);

    if (!isOnline) {
      toast('Değişiklik kaydedildi - Çevrimiçi olduğunuzda senkronize edilecek', {
        icon: '📱'
      });
    }
  }, [isOnline]);

  // Process sync queue
  const processSyncQueue = useCallback(async () => {
    if (syncQueue.length === 0 || isSyncing || !isOnline) return;

    setIsSyncing(true);
    
    try {
      // Simulate API calls - replace with actual API endpoints
      for (const item of syncQueue) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
        
        // Here you would make actual API calls based on item.type and item.entity
        console.log('Syncing:', item);
      }

      // Clear sync queue after successful sync
      setSyncQueue([]);
      toast.success(`${syncQueue.length} değişiklik senkronize edildi`);
      
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Senkronizasyon başarısız - Tekrar denenecek');
    } finally {
      setIsSyncing(false);
    }
  }, [syncQueue, isSyncing, isOnline]);

  // Manual sync trigger
  const manualSync = useCallback(() => {
    if (!isOnline) {
      toast.error('Senkronizasyon için internet bağlantısı gerekli');
      return;
    }
    processSyncQueue();
  }, [processSyncQueue, isOnline]);

  // Clear sync queue
  const clearSyncQueue = useCallback(() => {
    setSyncQueue([]);
    toast.success('Senkronizasyon kuyruğu temizlendi');
  }, []);

  return {
    isOnline,
    syncQueue,
    isSyncing,
    addToSyncQueue,
    manualSync,
    clearSyncQueue,
    pendingChanges: syncQueue.length
  };
};