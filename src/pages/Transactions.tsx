import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, ArrowRightLeft, Calendar, User, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../components/ui/Modal';
import { Transaction } from '../types';
import { formatDate, formatDateTime, searchInText } from '../utils/helpers';

export const Transactions: React.FC = () => {
  const { state, addTransaction, updateTransaction, deleteTransaction, getTransactionsWithDetails } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const [showProductSelect, setShowProductSelect] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    type: 'given' as 'given' | 'returned' | 'sold',
    notes: '',
  });

  const transactionsWithDetails = getTransactionsWithDetails();

  const filteredTransactions = useMemo(() => {
    return transactionsWithDetails.filter(transaction => {
      const matchesSearch = searchInText(transaction.customer.name, searchTerm) ||
                           searchInText(transaction.product.name, searchTerm) ||
                           searchInText(transaction.product.code, searchTerm) ||
                           searchInText(transaction.notes || '', searchTerm);
      
      const matchesType = !typeFilter || transaction.type === typeFilter;
      const matchesCustomer = !customerFilter || transaction.customerId === customerFilter;
      const matchesProduct = !productFilter || transaction.productId === productFilter;
      
      let matchesDate = true;
      if (dateFilter) {
        const transactionDate = new Date(transaction.createdAt).toISOString().split('T')[0];
        matchesDate = transactionDate === dateFilter;
      }
      
      return matchesSearch && matchesType && matchesCustomer && matchesProduct && matchesDate;
    });
  }, [transactionsWithDetails, searchTerm, typeFilter, customerFilter, productFilter, dateFilter]);

  const resetForm = () => {
    setFormData({
      type: 'given',
      notes: '',
    });
    setSelectedCustomer(null);
    setSelectedProducts([]);
  };

  const handleAdd = () => {
    setShowCustomerSelect(true);
    resetForm();
  };

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    setShowCustomerSelect(false);
    setShowProductSelect(true);
  };

  const handleProductToggle = (product: any) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setSelectedProducts(prev => 
      prev.map(p => p.id === productId ? { ...p, quantity } : p)
    );
  };

  const handlePreview = () => {
    if (selectedProducts.length === 0) {
      toast.error('En az bir kartela seçmelisiniz');
      return;
    }
    setShowProductSelect(false);
    setShowPreview(true);
  };

  const handleConfirmTransaction = () => {
    selectedProducts.forEach(product => {
      addTransaction({
        customerId: selectedCustomer.id,
        productId: product.id,
        type: formData.type,
        quantity: product.quantity,
        notes: formData.notes.trim() || undefined,
      });
    });
    
    toast.success(`${selectedProducts.length} kartela hareketi başarıyla eklendi`);
    setShowPreview(false);
    resetForm();
  };
  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      type: transaction.type,
      notes: transaction.notes || '',
    });
    setShowEditModal(true);
  };

  const handleView = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowViewModal(true);
  };

  const handleDelete = (transaction: Transaction) => {
    const transactionWithDetails = transactionsWithDetails.find(t => t.id === transaction.id);
    if (transactionWithDetails && window.confirm(`${transactionWithDetails.customer.name} - ${transactionWithDetails.product.name} hareketini silmek istediğinizden emin misiniz?`)) {
      deleteTransaction(transaction.id);
      toast.success('Hareket başarıyla silindi');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTransaction) {
      updateTransaction({
        ...selectedTransaction,
        type: formData.type,
        notes: formData.notes.trim() || undefined,
      });
      toast.success('Hareket başarıyla güncellendi');
      setShowEditModal(false);
    }
    
    resetForm();
    setSelectedTransaction(null);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'given': return 'Verildi';
      case 'returned': return 'İade';
      case 'sold': return 'Satıldı';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'given': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-green-100 text-green-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hareketler</h1>
          <p className="text-gray-600">Toplam {transactionsWithDetails.length} hareket</p>
        </div>
        
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleAdd}
        >
          Yeni Hareket
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <Input
            icon={Search}
            placeholder="Hareket ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
          
          <div>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Tüm Türler</option>
              <option value="given">Verildi</option>
              <option value="returned">İade</option>
              <option value="sold">Satıldı</option>
            </select>
          </div>
          
          <div>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
            >
              <option value="">Tüm Müşteriler</option>
              {state.customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
            >
              <option value="">Tüm Kartelalar</option>
              {state.products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.code})
                </option>
              ))}
            </select>
          </div>
          
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            fullWidth
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kartela
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tür
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Miktar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-md">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.customer.name}
                        </div>
                        {transaction.customer.company && (
                          <div className="text-sm text-gray-500">
                            {transaction.customer.company}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center mr-3 shadow-md">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.product.code}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                      {getTypeLabel(transaction.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(transaction.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        onClick={() => handleView(transaction)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Edit}
                        onClick={() => handleEdit(transaction)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDelete(transaction)}
                        className="text-red-600 hover:text-red-700"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowRightLeft className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || typeFilter || customerFilter || productFilter || dateFilter 
                ? 'Hareket bulunamadı' 
                : 'Henüz hareket yok'
              }
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || typeFilter || customerFilter || productFilter || dateFilter
                ? 'Arama kriterlerinizi değiştirip tekrar deneyin'
                : 'İlk hareketinizi ekleyerek başlayın'
              }
            </p>
            {!searchTerm && !typeFilter && !customerFilter && !productFilter && !dateFilter && (
              <Button variant="primary" icon={Plus} onClick={handleAdd}>
                İlk Hareketi Ekle
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
          setSelectedTransaction(null);
        }}
        title="Hareket Düzenle"
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hareket Türü *
                </label>
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ormen-500 focus:border-ormen-500"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'given' | 'returned' | 'sold' })}
                  required
                >
                  <option value="given">Verildi</option>
                  <option value="returned">İade</option>
                  <option value="sold">Satıldı</option>
                </select>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notlar
                </label>
                <textarea
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ormen-500 focus:border-ormen-500"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Hareket ile ilgili notlar..."
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowEditModal(false);
                resetForm();
                setSelectedTransaction(null);
              }}
            >
              İptal
            </Button>
            <Button type="submit" variant="primary">
              Güncelle
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Customer Selection Modal */}
      <Modal
        isOpen={showCustomerSelect}
        onClose={() => {
          setShowCustomerSelect(false);
          resetForm();
        }}
        title="Müşteri Seçin"
        size="lg"
      >
        <ModalBody>
          <div className="space-y-4">
            <Input
              icon={Search}
              placeholder="Müşteri ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {state.customers
                .filter(customer => 
                  searchInText(customer.name, searchTerm) ||
                  searchInText(customer.company || '', searchTerm)
                )
                .map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => handleCustomerSelect(customer)}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-ormen-300 transition-colors"
                >
                  <div className="font-medium text-gray-900">{customer.name}</div>
                  {customer.company && (
                    <div className="text-sm text-gray-500">{customer.company}</div>
                  )}
                  {customer.phone && (
                    <div className="text-sm text-gray-500">{customer.phone}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* Product Selection Modal */}
      <Modal
        isOpen={showProductSelect}
        onClose={() => {
          setShowProductSelect(false);
          resetForm();
        }}
        title={`Kartela Seçin - ${selectedCustomer?.name}`}
        size="lg"
      >
        <ModalBody>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hareket Türü
                </label>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'given' | 'returned' | 'sold' })}
                >
                  <option value="given">Verildi</option>
                  <option value="returned">İade</option>
                  <option value="sold">Satıldı</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                Seçilen: {selectedProducts.length} kartela
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {state.products.map((product) => {
                const isSelected = selectedProducts.find(p => p.id === product.id);
                return (
                  <div
                    key={product.id}
                    className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                      isSelected 
                        ? 'border-ormen-500 bg-ormen-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleProductToggle(product)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.code}</div>
                        {product.category && (
                          <div className="text-xs text-gray-400">{product.category}</div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="ml-4 flex items-center space-x-2">
                          <input
                            type="number"
                            min="1"
                            value={isSelected.quantity}
                            onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 1)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-ormen-500"
                          />
                          <span className="text-sm text-gray-500">adet</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notlar
              </label>
              <textarea
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ormen-500 focus:border-ormen-500"
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Hareket ile ilgili notlar..."
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setShowProductSelect(false);
              setShowCustomerSelect(true);
            }}
          >
            Geri
          </Button>
          <Button
            variant="primary"
            onClick={handlePreview}
            disabled={selectedProducts.length === 0}
          >
            Önizleme ({selectedProducts.length})
          </Button>
        </ModalFooter>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          setShowProductSelect(true);
        }}
        title="Hareket Önizlemesi"
        size="md"
      >
        <ModalBody>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Müşteri Bilgileri</h4>
              <p className="text-gray-700">{selectedCustomer?.name}</p>
              {selectedCustomer?.company && (
                <p className="text-sm text-gray-500">{selectedCustomer.company}</p>
              )}
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Seçilen Kartelalar</h4>
              <div className="space-y-2">
                {selectedProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.code}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{product.quantity} adet</div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        formData.type === 'given' ? 'bg-red-100 text-red-800' :
                        formData.type === 'returned' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {formData.type === 'given' ? 'Verildi' :
                         formData.type === 'returned' ? 'İade' : 'Satıldı'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {formData.notes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Notlar</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{formData.notes}</p>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setShowPreview(false);
              setShowProductSelect(true);
            }}
          >
            Düzenle
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmTransaction}
          >
            Kaydet
          </Button>
        </ModalFooter>
      </Modal>
      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedTransaction(null);
        }}
        title="Hareket Detayları"
        size="md"
      >
        {selectedTransaction && (
          <ModalBody>
            {(() => {
              const transactionWithDetails = transactionsWithDetails.find(t => t.id === selectedTransaction.id);
              if (!transactionWithDetails) return null;

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Müşteri
                      </label>
                      <p className="text-gray-900">{transactionWithDetails.customer.name}</p>
                      {transactionWithDetails.customer.company && (
                        <p className="text-sm text-gray-500">{transactionWithDetails.customer.company}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kartela
                      </label>
                      <p className="text-gray-900">{transactionWithDetails.product.name}</p>
                      <p className="text-sm text-gray-500">{transactionWithDetails.product.code}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hareket Türü
                      </label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(transactionWithDetails.type)}`}>
                        {getTypeLabel(transactionWithDetails.type)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Miktar
                      </label>
                      <p className="text-gray-900">{transactionWithDetails.quantity}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tarih
                      </label>
                      <p className="text-gray-900">{formatDateTime(transactionWithDetails.createdAt)}</p>
                    </div>
                    {transactionWithDetails.notes && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notlar
                        </label>
                        <p className="text-gray-900">{transactionWithDetails.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </ModalBody>
        )}
      </Modal>
    </div>
  );
};