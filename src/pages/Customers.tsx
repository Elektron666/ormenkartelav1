import React, { useState, useMemo } from 'react';
import { Plus, Search, Download, Upload, Edit, Trash2, Eye, Phone, Mail, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../components/ui/Modal';
import { Customer } from '../types';
import { formatDate, formatRelativeTime, searchInText } from '../utils/helpers';
import { CSVService } from '../utils/csv';

export const Customers: React.FC = () => {
  const { state, addCustomer, updateCustomer, deleteCustomer, importCustomers, getCustomerTransactions } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    notes: '',
  });
  const [bulkNames, setBulkNames] = useState('');

  const filteredCustomers = useMemo(() => {
    const filtered = state.customers.filter(customer =>
      searchInText(customer.name, searchTerm) ||
      searchInText(customer.company || '', searchTerm) ||
      searchInText(customer.phone || '', searchTerm) ||
      searchInText(customer.city || '', searchTerm)
    );
    
    // Alfabetik sıralama
    return filtered.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  }, [state.customers, searchTerm]);

  const resetForm = () => {
    setFormData({
      name: '',
      company: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      notes: '',
    });
  };

  const handleAdd = () => {
    setShowAddModal(true);
    resetForm();
  };

  const handleBulkAdd = () => {
    setBulkNames('');
    setShowBulkAddModal(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      company: customer.company || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      city: customer.city || '',
      notes: customer.notes || '',
    });
    setShowEditModal(true);
  };

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
  };

  const handleDelete = (customer: Customer) => {
    if (window.confirm(`${customer.name} müşterisini silmek istediğinizden emin misiniz?`)) {
      deleteCustomer(customer.id);
      toast.success('Müşteri başarıyla silindi');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Müşteri adı gerekli');
      return;
    }

    if (showEditModal && selectedCustomer) {
      updateCustomer({
        ...selectedCustomer,
        ...formData,
      });
      toast.success('Müşteri başarıyla güncellendi');
      setShowEditModal(false);
    } else {
      addCustomer(formData);
      toast.success('Müşteri başarıyla eklendi');
      setShowAddModal(false);
    }
    
    resetForm();
    setSelectedCustomer(null);
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bulkNames.trim()) {
      toast.error('En az bir müşteri adı girmelisiniz');
      return;
    }

    const names = bulkNames
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (names.length === 0) {
      toast.error('Geçerli müşteri adı bulunamadı');
      return;
    }

    // Alfabetik sıralama
    names.sort((a, b) => a.localeCompare(b, 'tr'));

    names.forEach(name => {
      addCustomer({
        name: name,
        company: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        notes: '',
      });
    });

    toast.success(`${names.length} müşteri başarıyla eklendi`);
    setShowBulkAddModal(false);
    setBulkNames('');
  };

  const handleExport = () => {
    try {
      const csvContent = CSVService.exportCustomersToCSV(state.customers);
      CSVService.downloadCSV(csvContent, `musteriler-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Müşteriler başarıyla dışa aktarıldı');
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
          const result = await CSVService.importCustomersFromCSV(file);
          if (result.success) {
            importCustomers(result.data);
            toast.success(`${result.data.length} müşteri başarıyla içe aktarıldı`);
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
    const template = CSVService.generateCustomerTemplate();
    CSVService.downloadCSV(template, 'musteri-sablonu.csv');
    toast.success('Şablon dosyası indirildi');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Müşteriler</h1>
          <p className="text-gray-600">Toplam {state.customers.length} müşteri</p>
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
            Yeni Müşteri
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <Input
          icon={Search}
          placeholder="Müşteri ara (ad, şirket, telefon, şehir)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer, index) => {
          const transactions = getCustomerTransactions(customer.id);
          const lastTransaction = transactions.length > 0 ? transactions[0] : null;
          
          return (
            <div key={customer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0 shadow-lg">
                  <span className="text-sm font-bold text-white">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {customer.name}
                  </h3>
                  {customer.company && (
                    <p className="text-sm text-gray-600 mb-2">{customer.company}</p>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Eye}
                    onClick={() => handleView(customer)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Edit}
                    onClick={() => handleEdit(customer)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDelete(customer)}
                    className="text-red-600 hover:text-red-700"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {customer.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {customer.phone}
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {customer.email}
                  </div>
                )}
                {customer.city && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {customer.city}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Toplam Hareket:</span>
                  <button 
                    onClick={() => handleView(customer)}
                    className="font-medium text-primary-600 hover:text-primary-700 cursor-pointer"
                  >
                    {transactions.length} hareket
                  </button>
                </div>
                {lastTransaction && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">Son Hareket:</span>
                    <span className="font-medium">
                      {formatRelativeTime(lastTransaction.createdAt)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Kayıt Tarihi:</span>
                  <span className="font-medium">{formatDate(customer.createdAt)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Müşteri bulunamadı' : 'Henüz müşteri yok'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Arama kriterlerinizi değiştirip tekrar deneyin'
              : 'İlk müşterinizi ekleyerek başlayın'
            }
          </p>
          {!searchTerm && (
            <Button variant="primary" icon={Plus} onClick={handleAdd}>
              İlk Müşteriyi Ekle
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
          setSelectedCustomer(null);
        }}
        title={showEditModal ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Müşteri Adı *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
              />
              <Input
                label="Şirket"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                fullWidth
              />
              <Input
                label="Telefon"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                fullWidth
              />
              <Input
                label="E-posta"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                fullWidth
              />
              <Input
                label="Şehir"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                fullWidth
              />
              <div className="md:col-span-2">
                <Input
                  label="Adres"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  fullWidth
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notlar
                </label>
                <textarea
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                setSelectedCustomer(null);
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
          setBulkNames('');
        }}
        title="Toplu Müşteri Ekleme"
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
                      Her satıra bir müşteri adı yazın. Sistem otomatik olarak alfabetik sıralayacak ve numaralandıracak.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Müşteri Adları (Her satıra bir ad)
                </label>
                <textarea
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={8}
                  value={bulkNames}
                  onChange={(e) => setBulkNames(e.target.value)}
                  placeholder="Ahmet Yılmaz&#10;Mehmet Demir&#10;Ayşe Kaya&#10;..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {bulkNames.split('\n').filter(name => name.trim().length > 0).length} müşteri eklenecek
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
              Müşterileri Ekle
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedCustomer(null);
        }}
        title="Müşteri Detayları"
        size="lg"
      >
        {selectedCustomer && (
          <ModalBody>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Müşteri Adı
                  </label>
                  <p className="text-gray-900">{selectedCustomer.name}</p>
                </div>
                {selectedCustomer.company && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Şirket
                    </label>
                    <p className="text-gray-900">{selectedCustomer.company}</p>
                  </div>
                )}
                {selectedCustomer.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon
                    </label>
                    <p className="text-gray-900">{selectedCustomer.phone}</p>
                  </div>
                )}
                {selectedCustomer.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-posta
                    </label>
                    <p className="text-gray-900">{selectedCustomer.email}</p>
                  </div>
                )}
                {selectedCustomer.city && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Şehir
                    </label>
                    <p className="text-gray-900">{selectedCustomer.city}</p>
                  </div>
                )}
                {selectedCustomer.address && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adres
                    </label>
                    <p className="text-gray-900">{selectedCustomer.address}</p>
                  </div>
                )}
                {selectedCustomer.notes && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notlar
                    </label>
                    <p className="text-gray-900">{selectedCustomer.notes}</p>
                  </div>
                )}
              </div>

              {/* Transaction History */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Hareket Geçmişi</h4>
                {(() => {
                  const transactions = getCustomerTransactions(selectedCustomer.id);
                  return transactions.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div>
                            <p className="font-medium text-gray-900">
                              {transaction.product.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {transaction.product.code}
                            </p>
                            <p className="text-sm text-gray-600">
                              {transaction.quantity} adet - {formatDate(transaction.createdAt)}
                            </p>
                            {transaction.notes && (
                              <p className="text-xs text-gray-500 mt-1">
                                {transaction.notes}
                              </p>
                            )}
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