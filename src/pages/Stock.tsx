import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Package, MapPin, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal, ModalBody, ModalFooter } from '../components/ui/Modal';
import { StockItem } from '../types';
import { formatDate, searchInText } from '../utils/helpers';

export const Stock: React.FC = () => {
  const { state, addStockItem, updateStockItem, deleteStockItem } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState<StockItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    location: '',
    notes: '',
  });
  const [bulkData, setBulkData] = useState('');

  const locations = useMemo(() => {
    const locs = state.stockItems.map(s => s.location).filter(Boolean);
    return [...new Set(locs)];
  }, [state.stockItems]);

  const filteredStockItems = useMemo(() => {
    return state.stockItems.filter(item => {
      const matchesSearch = searchInText(item.name, searchTerm) ||
                           searchInText(item.location, searchTerm) ||
                           searchInText(item.notes || '', searchTerm);
      
      const matchesLocation = !locationFilter || item.location === locationFilter;
      
      return matchesSearch && matchesLocation;
    });
  }, [state.stockItems, searchTerm, locationFilter]);

  const resetForm = () => {
    setFormData({
      name: '',
      quantity: 0,
      location: '',
      notes: '',
    });
  };

  const handleAdd = () => {
    setShowAddModal(true);
    resetForm();
  };

  const handleBulkAdd = () => {
    setBulkData('');
    setShowBulkAddModal(true);
  };

  const handleEdit = (stockItem: StockItem) => {
    setSelectedStockItem(stockItem);
    setFormData({
      name: stockItem.name,
      quantity: stockItem.quantity,
      location: stockItem.location,
      notes: stockItem.notes || '',
    });
    setShowEditModal(true);
  };

  const handleDelete = (stockItem: StockItem) => {
    if (window.confirm(`${stockItem.name} stok kaydını silmek istediğinizden emin misiniz?`)) {
      deleteStockItem(stockItem.id);
      toast.success('Stok kaydı başarıyla silindi');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Kartela adı gerekli');
      return;
    }

    if (!formData.location.trim()) {
      toast.error('Konum bilgisi gerekli');
      return;
    }

    if (formData.quantity < 0) {
      toast.error('Miktar 0 veya pozitif olmalı');
      return;
    }

    const stockItemData = {
      name: formData.name.trim(),
      quantity: formData.quantity,
      location: formData.location.trim(),
      notes: formData.notes.trim() || undefined,
    };

    if (showEditModal && selectedStockItem) {
      updateStockItem({
        ...selectedStockItem,
        ...stockItemData,
      });
      toast.success('Stok kaydı başarıyla güncellendi');
      setShowEditModal(false);
    } else {
      addStockItem(stockItemData);
      toast.success('Stok kaydı başarıyla eklendi');
      setShowAddModal(false);
    }
    
    resetForm();
    setSelectedStockItem(null);
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bulkData.trim()) {
      toast.error('Stok verilerini girmelisiniz');
      return;
    }

    const lines = bulkData
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      toast.error('Geçerli stok verisi bulunamadı');
      return;
    }

    let addedCount = 0;
    let errorCount = 0;

    lines.forEach((line, index) => {
      try {
        // Format: "Kartela Adı | Miktar | Konum" veya "Kartela Adı, Miktar, Konum"
        const parts = line.split(/[|,]/).map(part => part.trim());
        
        if (parts.length < 3) {
          toast.error(`Satır ${index + 1}: Format hatalı. Örnek: "Atlantis | 200 | Depo-1"`);
          errorCount++;
          return;
        }

        const name = parts[0];
        const quantity = parseInt(parts[1]) || 0;
        const location = parts[2];

        if (!name || !location) {
          toast.error(`Satır ${index + 1}: Kartela adı ve konum gerekli`);
          errorCount++;
          return;
        }

        addStockItem({
          name,
          quantity,
          location,
          notes: parts[3] || undefined,
        });
        
        addedCount++;
      } catch (error) {
        errorCount++;
      }
    });

    if (addedCount > 0) {
      toast.success(`${addedCount} stok kaydı başarıyla eklendi`);
    }
    
    if (errorCount > 0) {
      toast.error(`${errorCount} kayıt eklenemedi`);
    }

    setShowBulkAddModal(false);
    setBulkData('');
  };

  const getTotalQuantity = () => {
    return filteredStockItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getLowStockItems = () => {
    return filteredStockItems.filter(item => item.quantity <= 10);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kartela Stok</h1>
          <p className="text-gray-600">
            Toplam {state.stockItems.length} kayıt - {getTotalQuantity()} adet
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            icon={Plus}
            onClick={handleBulkAdd}
            size="sm"
          >
            Toplu Ekle
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleAdd}
          >
            Yeni Stok Kaydı
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-md">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Toplam Kayıt</p>
              <p className="text-2xl font-bold text-gray-900">{state.stockItems.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow-md">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Toplam Miktar</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalQuantity()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-red-400 to-red-600 rounded-lg shadow-md">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Düşük Stok</p>
              <p className="text-2xl font-bold text-gray-900">{getLowStockItems().length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            icon={Search}
            placeholder="Stok ara (ad, konum, not)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
          <div>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="">Tüm Konumlar</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stock Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStockItems.map((stockItem) => (
          <div key={stockItem.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {stockItem.name}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Package className="w-4 h-4 mr-2 text-gray-400" />
                    <span className={`font-medium ${
                      stockItem.quantity <= 10 ? 'text-red-600' : 
                      stockItem.quantity <= 50 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {stockItem.quantity} adet
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    {stockItem.location}
                  </div>
                </div>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Edit}
                  onClick={() => handleEdit(stockItem)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  onClick={() => handleDelete(stockItem)}
                  className="text-red-600 hover:text-red-700"
                />
              </div>
            </div>

            {stockItem.notes && (
              <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-2 rounded">
                {stockItem.notes}
              </p>
            )}

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Oluşturma:</span>
                <span className="font-medium">{formatDate(stockItem.createdAt)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">Güncelleme:</span>
                <span className="font-medium">{formatDate(stockItem.updatedAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStockItems.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || locationFilter ? 'Stok kaydı bulunamadı' : 'Henüz stok kaydı yok'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || locationFilter
              ? 'Arama kriterlerinizi değiştirip tekrar deneyin'
              : 'İlk stok kaydınızı ekleyerek başlayın'
            }
          </p>
          {!searchTerm && !locationFilter && (
            <Button variant="primary" icon={Plus} onClick={handleAdd}>
              İlk Stok Kaydını Ekle
            </Button>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          resetForm();
          setSelectedStockItem(null);
        }}
        title={showEditModal ? 'Stok Kaydı Düzenle' : 'Yeni Stok Kaydı'}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Kartela Adı *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
              />
              <Input
                label="Miktar *"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                required
                fullWidth
              />
              <Input
                label="Konum *"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Depo-1, Raf-A, vb."
                required
                fullWidth
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notlar
                </label>
                <textarea
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ek bilgiler..."
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                resetForm();
                setSelectedStockItem(null);
              }}
            >
              İptal
            </Button>
            <Button type="submit" variant="primary">
              {showEditModal ? 'Güncelle' : 'Ekle'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Bulk Add Modal */}
      <Modal
        isOpen={showBulkAddModal}
        onClose={() => {
          setShowBulkAddModal(false);
          setBulkData('');
        }}
        title="Toplu Stok Ekleme"
        size="lg"
      >
        <form onSubmit={handleBulkSubmit}>
          <ModalBody>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="w-5 h-5 text-blue-600 mt-0.5 mr-2">ℹ️</div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Format</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Her satıra: <strong>Kartela Adı | Miktar | Konum | Notlar (opsiyonel)</strong>
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Örnek: Atlantis | 200 | Depo-2 | VIP müşteri için
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stok Verileri
                </label>
                <textarea
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={10}
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                  placeholder="Atlantis | 200 | Depo-2&#10;Azure | 150 | Depo-1&#10;Bentley | 75 | Raf-A | Özel seri"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {bulkData.split('\n').filter(line => line.trim().length > 0).length} kayıt eklenecek
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowBulkAddModal(false);
                setBulkData('');
              }}
            >
              İptal
            </Button>
            <Button type="submit" variant="primary">
              Stok Kayıtlarını Ekle
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};