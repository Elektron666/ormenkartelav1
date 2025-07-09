import React, { useState } from 'react';
import { Save, Trash2, Download, Upload, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal, ModalBody, ModalFooter } from '../components/ui/Modal';
import { storageService } from '../utils/storage';
import { formatFileSize } from '../utils/helpers';

export const Settings: React.FC = () => {
  const { state, updateSettings, createBackup, restoreBackup, clearAllData } = useApp();
  const [showClearModal, setShowClearModal] = useState(false);
  const [formData, setFormData] = useState({
    companyName: state.settings.companyName,
    theme: state.settings.theme,
    language: state.settings.language,
    autoBackup: state.settings.autoBackup,
    backupInterval: state.settings.backupInterval.toString(),
  });

  const storageInfo = storageService.getStorageInfo();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedSettings = {
      ...state.settings,
      companyName: formData.companyName.trim(),
      theme: formData.theme as 'light' | 'dark',
      language: formData.language as 'tr' | 'en',
      autoBackup: formData.autoBackup,
      backupInterval: parseInt(formData.backupInterval) || 7,
    };

    updateSettings(updatedSettings);
    toast.success('Ayarlar başarıyla kaydedildi');
  };

  const handleExportBackup = () => {
    try {
      createBackup();
      toast.success('Yedek başarıyla oluşturuldu');
    } catch (error) {
      toast.error('Yedek oluşturulurken hata oluştu');
    }
  };

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
            window.location.reload();
          } catch (error) {
            toast.error('Yedek dosyası geçersiz');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearAllData = () => {
    clearAllData();
    toast.success('Tüm veriler temizlendi');
    setShowClearModal(false);
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
        <p className="text-gray-600">Sistem ayarlarını yönetin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Genel Ayarlar</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Şirket Adı"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              fullWidth
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tema
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
              >
                <option value="light">Açık Tema</option>
                <option value="dark">Koyu Tema</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dil
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoBackup"
                checked={formData.autoBackup}
                onChange={(e) => setFormData({ ...formData, autoBackup: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="autoBackup" className="ml-2 block text-sm text-gray-900">
                Otomatik yedekleme
              </label>
            </div>

            {formData.autoBackup && (
              <Input
                label="Yedekleme Aralığı (Gün)"
                type="number"
                min="1"
                max="30"
                value={formData.backupInterval}
                onChange={(e) => setFormData({ ...formData, backupInterval: e.target.value })}
                fullWidth
              />
            )}

            <Button type="submit" variant="primary" icon={Save} fullWidth>
              Ayarları Kaydet
            </Button>
          </form>
        </div>

        {/* Backup & Restore */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Yedekleme & Geri Yükleme</h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Yedekleme Hakkında</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Yedekleme işlemi tüm müşteri, kartela, hareket ve ayar verilerinizi JSON formatında dışa aktarır.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="primary"
                icon={Download}
                onClick={handleExportBackup}
                fullWidth
              >
                Yedek Oluştur
              </Button>
              
              <Button
                variant="secondary"
                icon={Upload}
                onClick={handleImportBackup}
                fullWidth
              >
                Yedek Geri Yükle
              </Button>
            </div>

            {state.settings.lastBackup && (
              <p className="text-sm text-gray-500">
                Son yedekleme: {new Date(state.settings.lastBackup).toLocaleString('tr-TR')}
              </p>
            )}
          </div>
        </div>

        {/* Storage Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Depolama Bilgisi</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Kullanılan Alan</span>
                <span className="font-medium">{formatFileSize(storageInfo.used)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                %{storageInfo.percentage.toFixed(1)} kullanılıyor
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Müşteri Sayısı:</span>
                <span className="font-medium ml-2">{state.customers.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Kartela Sayısı:</span>
                <span className="font-medium ml-2">{state.products.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Hareket Sayısı:</span>
                <span className="font-medium ml-2">{state.transactions.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Stok Hareketi:</span>
                <span className="font-medium ml-2">{state.stockMovements.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-4">Tehlikeli İşlemler</h2>
          
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Dikkat!</h3>
                  <p className="text-sm text-red-700 mt-1">
                    Bu işlem tüm verilerinizi kalıcı olarak siler. Bu işlem geri alınamaz.
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="error"
              icon={Trash2}
              onClick={() => setShowClearModal(true)}
              fullWidth
            >
              Tüm Verileri Temizle
            </Button>
          </div>
        </div>
      </div>

      {/* Clear Data Confirmation Modal */}
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Tüm Verileri Temizle"
        size="md"
      >
        <ModalBody>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-base font-medium text-red-800 mb-2">
                    Bu işlem geri alınamaz!
                  </h3>
                  <p className="text-sm text-red-700">
                    Aşağıdaki veriler kalıcı olarak silinecek:
                  </p>
                  <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
                    <li>{state.customers.length} müşteri kaydı</li>
                    <li>{state.products.length} kartela kaydı</li>
                    <li>{state.transactions.length} hareket kaydı</li>
                    <li>{state.stockMovements.length} stok hareketi</li>
                    <li>Tüm sistem ayarları</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700">
              Devam etmeden önce verilerinizi yedeklediğinizden emin olun.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setShowClearModal(false)}
          >
            İptal
          </Button>
          <Button
            variant="error"
            icon={Trash2}
            onClick={handleClearAllData}
          >
            Evet, Tüm Verileri Sil
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};