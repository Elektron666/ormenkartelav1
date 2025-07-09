import React, { useState, useMemo } from 'react';
import { Plus, Search, Download, Upload, Edit, Trash2, Eye, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../components/ui/Modal';
import { Product } from '../types';
import { formatDate, formatCurrency, searchInText } from '../utils/helpers';
import { CSVService } from '../utils/csv';

export const Products: React.FC = () => {
  const { state, addProduct, updateProduct, deleteProduct, importProducts, getProductTransactions, updateProductStock } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockData, setStockData] = useState({
    quantity: 0,
    type: 'in' as 'in' | 'out' | 'adjustment',
    reason: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
  });
  const [bulkNames, setBulkNames] = useState('');

  const categories = useMemo(() => {
    const cats = state.products.map(p => p.category).filter(Boolean);
    return [...new Set(cats)];
  }, [state.products]);

  const filteredProducts = useMemo(() => {
    return state.products.filter(product => {
      const matchesSearch = searchInText(product.name, searchTerm) ||
                           searchInText(product.code, searchTerm) ||
                           searchInText(product.category || '', searchTerm) ||
                           searchInText(product.description || '', searchTerm);
      
      const matchesCategory = !categoryFilter || product.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [state.products, searchTerm, categoryFilter]);

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      category: '',
    });
  };

  const handleAdd = () => {
    setShowAddModal(true);
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      code: product.code,
      category: product.category || '',
    });
    setShowEditModal(true);
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleStockUpdate = (product: Product) => {
    setSelectedProduct(product);
    setStockData({
      quantity: 0,
      type: 'in',
      reason: '',
    });
    setShowStockModal(true);
  };

  const handleBulkAdd = () => {
    setBulkNames('');
    setShowBulkAddModal(true);
  };

  const handleDelete = (product: Product) => {
    if (window.confirm(`${product.name} kartelasını silmek istediğinizden emin misiniz?`)) {
      deleteProduct(product.id);
      toast.success('Kartela başarıyla silindi');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Kartela adı gerekli');
      return;
    }

    if (!formData.code.trim()) {
      toast.error('Kartela kodu gerekli');
      return;
    }

    const productData = {
      name: formData.name.trim(),
      code: formData.code.trim(),
      category: formData.category.trim() || undefined,
      stockQuantity: 0,
      minStockLevel: 0,
    };

    if (showEditModal && selectedProduct) {
      updateProduct({
        ...selectedProduct,
        ...productData,
      });
      toast.success('Kartela başarıyla güncellendi');
      setShowEditModal(false);
    } else {
      addProduct(productData);
      toast.success('Kartela başarıyla eklendi');
      setShowAddModal(false);
    }
    
    resetForm();
    setSelectedProduct(null);
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bulkNames.trim()) {
      toast.error('En az bir kartela adı girmelisiniz');
      return;
    }

    const names = bulkNames
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (names.length === 0) {
      toast.error('Geçerli kartela adı bulunamadı');
      return;
    }

    // Get existing codes to find next number
    const existingCodes = state.products
      .map(p => p.code)
      .filter(code => code.startsWith('ORM-'))
      .map(code => {
        const match = code.match(/ORM-(\d+)/);
        return match ? parseInt(match[1]) : 0;
      });
    
    let nextNumber = existingCodes.length > 0 ? Math.max(...existingCodes) + 1 : 1;

    names.forEach(name => {
      const code = `ORM-${nextNumber.toString().padStart(4, '0')}`;
      addProduct({
        name: name,
        code: code,
        category: 'Genel',
        stockQuantity: 0,
        minStockLevel: 0,
      });
      nextNumber++;
    });

    toast.success(`${names.length} kartela başarıyla eklendi`);
    setShowBulkAddModal(false);
    setBulkNames('');
  };

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) return;
    
    if (stockData.quantity <= 0) {
      toast.error('Miktar 0\'dan büyük olmalı');
      return;
    }

    updateProductStock(
      selectedProduct.id,
      stockData.quantity,
      stockData.type,
      stockData.reason
    );

    toast.success('Stok başarıyla güncellendi');
    setShowStockModal(false);
    setSelectedProduct(null);
  };

  const handleExport = () => {
    try {
      const csvContent = CSVService.exportProductsToCSV(state.products);
      CSVService.downloadCSV(csvContent, `kartelalar-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Kartelalar başarıyla dışa aktarıldı');
    } catch (error) {
      toast.error('Dışa aktarma sırasında hata oluştu');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const result = await CSVService.importProductsFromCSV(file);
          if (result.success) {
            importProducts(result.data);
            toast.success(`${result.data.length} kartela başarıyla içe aktarıldı`);
          } else {
            toast.error(`İçe aktarma hatası: ${result.errors.join(', ')}`);
          }
        } catch (error) {
          toast.error('Dosya okuma hatası');
        }
      }
    };
    input.click();
  };

  const handleDownloadTemplate = () => {
    const template = CSVService.generateProductTemplate();
    CSVService.downloadCSV(template, 'kartela-sablonu.csv');
    toast.success('Şablon dosyası indirildi');
  };

  const getStockStatus = (product: Product) => {
    const stock = product.stockQuantity || 0;
    const minStock = product.minStockLevel || 0;
    
    if (stock === 0) return { status: 'out', label: 'Stokta Yok', color: 'bg-red-100 text-red-800' };
    if (stock <= minStock) return { status: 'low', label: 'Düşük Stok', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'ok', label: 'Stokta', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kartelalar</h1>
          <p className="text-gray-600">Toplam {state.products.length} kartela</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            icon={Download}
            onClick={handleDownloadTemplate}
            size="sm"
          >
            Şablon İndir
          </Button>
          <Button
            variant="outline"
            icon={Upload}
            onClick={handleBulkAdd}
            size="sm"
          >
            Toplu Ekle
          </Button>
          <Button
            variant="secondary"
            icon={Download}
            onClick={handleExport}
            size="sm"
          >
            Dışa Aktar
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleAdd}
          >
            Yeni Kartela
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            icon={Search}
            placeholder="Kartela ara (ad, kod, kategori, açıklama)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
          <div>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const transactions = getProductTransactions(product.id);
          const stockStatus = getStockStatus(product);
          
          return (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-ormen-100 to-ormen-200 text-ormen-800 border border-ormen-300">
                      {product.code}
                    </span>
                  </div>
                  {product.category && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300">
                      {product.category}
                    </span>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={TrendingUp}
                    onClick={() => handleStockUpdate(product)}
                    title="Stok Güncelle"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Eye}
                    onClick={() => handleView(product)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Edit}
                    onClick={() => handleEdit(product)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDelete(product)}
                    className="text-red-600 hover:text-red-700"
                  />
                </div>
              </div>

              {product.description && (
                <p className="text-sm text-gray-600 mb-4">{product.description}</p>
              )}


              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Toplam Hareket:</span>
                  <span className="font-medium">{transactions.length}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Kayıt Tarihi:</span>
                  <span className="font-medium">{formatDate(product.createdAt)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || categoryFilter ? 'Kartela bulunamadı' : 'Henüz kartela yok'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || categoryFilter
              ? 'Arama kriterlerinizi değiştirip tekrar deneyin'
              : 'İlk kartelanızı ekleyerek başlayın'
            }
          </p>
          {!searchTerm && !categoryFilter && (
            <Button variant="primary" icon={Plus} onClick={handleAdd}>
              İlk Kartelayı Ekle
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
          setSelectedProduct(null);
        }}
        title={showEditModal ? 'Kartela Düzenle' : 'Yeni Kartela Ekle'}
        size="lg"
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
                label="Kartela Kodu *"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                fullWidth
              />
              <Input
                label="Kategori"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                fullWidth
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                resetForm();
                setSelectedProduct(null);
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

      {/* Stock Update Modal */}
      <Modal
        isOpen={showStockModal}
        onClose={() => {
          setShowStockModal(false);
          setSelectedProduct(null);
        }}
        title="Stok Güncelle"
        size="md"
      >
        {selectedProduct && (
          <form onSubmit={handleStockSubmit}>
            <ModalBody>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    {selectedProduct.name} ({selectedProduct.code})
                  </h4>
                  <p className="text-sm text-gray-600">
                    Mevcut Stok: {selectedProduct.stockQuantity || 0}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İşlem Türü
                  </label>
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={stockData.type}
                    onChange={(e) => setStockData({ ...stockData, type: e.target.value as 'in' | 'out' | 'adjustment' })}
                  >
                    <option value="in">Stok Girişi (+)</option>
                    <option value="out">Stok Çıkışı (-)</option>
                    <option value="adjustment">Stok Düzeltme (=)</option>
                  </select>
                </div>
                
                <Input
                  label="Miktar"
                  type="number"
                  min="1"
                  value={stockData.quantity}
                  onChange={(e) => setStockData({ ...stockData, quantity: parseInt(e.target.value) || 0 })}
                  required
                  fullWidth
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    rows={2}
                    value={stockData.reason}
                    onChange={(e) => setStockData({ ...stockData, reason: e.target.value })}
                    placeholder="Stok değişikliği sebebi..."
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowStockModal(false);
                  setSelectedProduct(null);
                }}
              >
                İptal
              </Button>
              <Button type="submit" variant="primary">
                Güncelle
              </Button>
            </ModalFooter>
          </form>
        )}
      </Modal>

      {/* Bulk Add Modal */}
      <Modal
        isOpen={showBulkAddModal}
        onClose={() => {
          setShowBulkAddModal(false);
          setBulkNames('');
        }}
        title="Toplu Kartela Ekleme"
        size="md"
      >
        <form onSubmit={handleBulkSubmit}>
          <ModalBody>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="w-5 h-5 text-blue-600 mt-0.5 mr-2">ℹ️</div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Nasıl Kullanılır</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Her satıra bir kartela adı yazın. Sistem otomatik olarak ORM-0001, ORM-0002 şeklinde kodlar oluşturacak.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kartela Adları (Her satıra bir ad)
                </label>
                <textarea
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={8}
                  value={bulkNames}
                  onChange={(e) => setBulkNames(e.target.value)}
                  placeholder="Atlantis&#10;Azure&#10;Bentley&#10;..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {bulkNames.split('\n').filter(name => name.trim().length > 0).length} kartela eklenecek
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowBulkAddModal(false);
                setBulkNames('');
              }}
            >
              İptal
            </Button>
            <Button type="submit" variant="primary">
              Kartelaları Ekle
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedProduct(null);
        }}
        title="Kartela Detayları"
        size="lg"
      >
        {selectedProduct && (
          <ModalBody>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kartela Adı
                  </label>
                  <p className="text-gray-900">{selectedProduct.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kartela Kodu
                  </label>
                  <p className="text-gray-900">{selectedProduct.code}</p>
                </div>
                {selectedProduct.category && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori
                    </label>
                    <p className="text-gray-900">{selectedProduct.category}</p>
                  </div>
                )}
              </div>

              {/* Transaction History */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Hareket Geçmişi</h4>
                {(() => {
                  const transactions = getProductTransactions(selectedProduct.id);
                  return transactions.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">
                              {transaction.customer.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {transaction.quantity} adet - {formatDate(transaction.createdAt)}
                            </p>
                          </div>
                          <span className={`
                            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${transaction.type === 'given' ? 'bg-red-100 text-red-800' : 
                              transaction.type === 'returned' ? 'bg-green-100 text-green-800' : 
                              'bg-blue-100 text-blue-800'}
                          `}>
                            {transaction.type === 'given' ? 'Verildi' : 
                             transaction.type === 'returned' ? 'İade' : 'Satıldı'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Henüz hareket bulunmuyor</p>
                  );
                })()}
              </div>
            </div>
          </ModalBody>
        )}
      </Modal>
    </div>
  );
};