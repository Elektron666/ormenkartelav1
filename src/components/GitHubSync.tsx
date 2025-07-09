import React, { useState, useEffect } from 'react';
import { GitBranch, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface GitHubSyncProps {
  onSync?: () => void;
}

export const GitHubSync: React.FC<GitHubSyncProps> = ({ onSync }) => {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    // Check if we're in a GitHub-connected environment
    const checkGitHubConnection = () => {
      // This would normally check for GitHub integration
      // For now, we'll simulate the connection status
      const isConnected = window.location.hostname.includes('bolt.new');
      if (isConnected) {
        setSyncStatus('success');
        setLastSync(new Date());
      }
    };

    checkGitHubConnection();
  }, []);

  const handleSync = async () => {
    setSyncStatus('syncing');
    
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSyncStatus('success');
      setLastSync(new Date());
      onSync?.();
    } catch (error) {
      setSyncStatus('error');
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <Loader className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <GitBranch className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Senkronize ediliyor...';
      case 'success':
        return lastSync ? `Son sync: ${lastSync.toLocaleTimeString('tr-TR')}` : 'Senkronize edildi';
      case 'error':
        return 'Sync hatası';
      default:
        return 'GitHub';
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleSync}
        disabled={syncStatus === 'syncing'}
        className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${getStatusColor()} hover:bg-gray-100 disabled:opacity-50`}
      >
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </button>
    </div>
  );
};