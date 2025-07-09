import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Users, Package, Calendar, Download, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatDate, formatCurrency, groupBy } from '../utils/helpers';

export const Reports: React.FC = () => {
  const { state, getTransactionsWithDetails, getDashboardStats } = useApp();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedReport, setSelectedReport] = useState('overview');

  const transactionsWithDetails = getTransactionsWithDetails();
  const stats = getDashboardStats();

  const filteredTransactions = useMemo(() => {
    return transactionsWithDetails.filter(transaction => {
      const transactionDate = new Date(transaction.createdAt);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;

      if (fromDate && transactionDate < fromDate) return false;
      if (toDate && transactionDate > toDate) return false;

      return true;
    });
  }, [transactionsWithDetails, dateFrom, dateTo]);

  const reportData = useMemo(() => {
    // Customer Analysis
    const customerStats = state.customers.map(customer => {
      const customerTransactions = filteredTransactions.filter(t => t.customerId === customer.id);
      const totalQuantity = customerTransactions.reduce((sum, t) => sum + t.quantity, 0);
      const lastTransaction = customerTransactions.length > 0 
        ? new Date(Math.max(...customerTransactions.map(t => new Date(t.createdAt).getTime())))
        : null;

      return {
        customer,
        transactionCount: customerTransactions.length,
        totalQuantity,
        lastTransaction,
        givenCount: customerTransactions.filter(t => t.type === 'given').length,
        returnedCount: customerTransactions.filter(t => t.type === 'returned').length,
        soldCount: customerTransactions.filter(t => t.type === 'sold').length,
      };
    }).sort((a, b) => b.transactionCount - a.transactionCount);

    // Product Analysis
    const productStats = state.products.map(product => {
      const productTransactions = filteredTransactions.filter(t => t.productId === product.id);
      const totalQuantity = productTransactions.reduce((sum, t) => sum + t.quantity, 0);
      const stockStatus = (product.stockQuantity || 0) <= (product.minStockLevel || 0) ? 'low' : 'ok';

      return {
        product,
        transactionCount: productTransactions.length,
        totalQuantity,
        stockStatus,
        currentStock: product.stockQuantity || 0,
        minStock: product.minStockLevel || 0,
        givenQuantity: productTransactions.filter(t => t.type === 'given').reduce((sum, t) => sum + t.quantity, 0),
        returnedQuantity: productTransactions.filter(t => t.type === 'returned').reduce((sum, t) => sum + t.quantity, 0),
        soldQuantity: productTransactions.filter(t => t.type === 'sold').reduce((sum, t) => sum + t.quantity, 0),
      };
    }).sort((a, b) => b.transactionCount - a.transactionCount);

    // Daily Activity
    const dailyActivity = Object.entries(
      groupBy(filteredTransactions, t => formatDate(t.createdAt))
    ).map(([date, transactions]) => ({
      date,
      count: transactions.length,
      totalQuantity: transactions.reduce((sum, t) => sum + t.quantity, 0),
      givenCount: transactions.filter(t => t.type === 'given').length,
      returnedCount: transactions.filter(t => t.type === 'returned').length,
      soldCount: transactions.filter(t => t.type === 'sold').length,
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Category Analysis
    const categoryStats = Object.entries(
      groupBy(state.products, p => p.category || 'Kategorisiz')
    ).map(([category, products]) => {
      const categoryTransactions = filteredTransactions.filter(t => 
        products.some(p => p.id === t.productId)
      );
      
      return {
        category,
        productCount: products.length,
        transactionCount: categoryTransactions.length,
        totalQuantity: categoryTransactions.reduce((sum, t) => sum + t.quantity, 0),
        totalStock: products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0),
      };
    }).sort((a, b) => b.transactionCount - a.transactionCount);

    return {
      customerStats,
      productStats,
      dailyActivity,
      categoryStats,
      summary: {
        totalTransactions: filteredTransactions.length,
        totalQuantity: filteredTransactions.reduce((sum, t) => sum + t.quantity, 0),
        activeCustomers: customerStats.filter(c => c.transactionCount > 0).length,
        activeProducts: productStats.filter(p => p.transactionCount > 0).length,
        lowStockProducts: productStats.filter(p => p.stockStatus === 'low').length,
      }
    };
  }, [state, filteredTransactions]);

  const exportReport = () => {
    const reportContent = generateReportContent();
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapor-${formatDate(new Date())}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateReportContent = () => {
    const { summary, customerStats, productStats, dailyActivity, categoryStats } = reportData;
    
    let content = `KARTELA YÖNETİM SİSTEMİ RAPORU\n`;
    content += `Rapor Tarihi: ${formatDate(new Date())}\n`;
    content += `Dönem: ${dateFrom || 'Başlangıç'} - ${dateTo || 'Bugün'}\n\n`;
    
    content += `ÖZET\n`;
    content += `=====\n`;
    content += `Toplam Hareket: ${summary.totalTransactions}\n`;
    content += `Toplam Miktar: ${summary.totalQuantity}\n`;
    content += `Aktif Müşteri: ${summary.activeCustomers}\n`;
    content += `Aktif Kartela: ${summary.activeProducts}\n`;
    content += `Düşük Stok: ${summary.lowStockProducts}\n\n`;
    
    content += `EN AKTİF MÜŞTERİLER\n`;
    content += `==================\n`;
    customerStats.slice(0, 10).forEach((item, index) => {
      content += `${index + 1}. ${item.customer.name} - ${item.transactionCount} hareket\n`;
    });
    content += `\n`;
    
    content += `EN ÇOK KULLANILAN KARTELALAR\n`;
    content += `===========================\n`;
    productStats.slice(0, 10).forEach((item, index) => {
      content += `${index + 1}. ${item.product.name} (${item.product.code}) - ${item.transactionCount} hareket\n`;
    });
    content += `\n`;
    
    content += `KATEGORİ ANALİZİ\n`;
    content += `===============\n`;
    categoryStats.forEach(item => {
      content += `${item.category}: ${item.productCount} ürün, ${item.transactionCount} hareket\n`;
    });
    
    return content;
  };

  const renderOverviewReport = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-md">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Toplam Hareket</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalTransactions}</p>
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
              <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalQuantity}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg shadow-md">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Aktif Müşteri</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.summary.activeCustomers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg shadow-md">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Aktif Kartela</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.summary.activeProducts}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-red-400 to-red-600 rounded-lg shadow-md">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Düşük Stok</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.summary.lowStockProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Activity Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Günlük Aktivite</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-600">Tarih</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Hareket</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Miktar</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Verildi</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">İade</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Satıldı</th>
              </tr>
            </thead>
            <tbody>
              {reportData.dailyActivity.slice(-10).map((day) => (
                <tr key={day.date} className="border-b border-gray-100">
                  <td className="py-2 text-sm text-gray-900">{day.date}</td>
                  <td className="py-2 text-sm text-gray-900">{day.count}</td>
                  <td className="py-2 text-sm text-gray-900">{day.totalQuantity}</td>
                  <td className="py-2 text-sm text-red-600">{day.givenCount}</td>
                  <td className="py-2 text-sm text-green-600">{day.returnedCount}</td>
                  <td className="py-2 text-sm text-blue-600">{day.soldCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCustomerReport = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Müşteri Analizi</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-sm font-medium text-gray-600">Müşteri</th>
              <th className="text-left py-2 text-sm font-medium text-gray-600">Hareket</th>
              <th className="text-left py-2 text-sm font-medium text-gray-600">Miktar</th>
              <th className="text-left py-2 text-sm font-medium text-gray-600">Verildi</th>
              <th className="text-left py-2 text-sm font-medium text-gray-600">İade</th>
              <th className="text-left py-2 text-sm font-medium text-gray-600">Satıldı</th>
              <th className="text-left py-2 text-sm font-medium text-gray-600">Son Hareket</th>
            </tr>
          </thead>
          <tbody>
            {reportData.customerStats.map((item) => (
              <tr key={item.customer.id} className="border-b border-gray-100">
                <td className="py-2">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.customer.name}</div>
                    {item.customer.company && (
                      <div className="text-sm text-gray-500">{item.customer.company}</div>
                    )}
                  </div>
                </td>
                <td className="py-2 text-sm text-gray-900">{item.transactionCount}</td>
                <td className="py-2 text-sm text-gray-900">{item.totalQuantity}</td>
                <td className="py-2 text-sm text-red-600">{item.givenCount}</td>
                <td className="py-2 text-sm text-green-600">{item.returnedCount}</td>
                <td className="py-2 text-sm text-blue-600">{item.soldCount}</td>
                <td className="py-2 text-sm text-gray-500">
                  {item.lastTransaction ? formatDate(item.lastTransaction) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProductReport = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Kartela Analizi</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-sm font-medium text-gray-600">Kartela</th>
              <th className="text-left py-2 text-sm font-medium text-gray-600">Hareket</th>
              <th className="text-left py-2 text-sm font-medium text-gray-600">Miktar</th>
              <th className="text-left py-2 text-sm font-medium text-gray-600">Stok</th>
              <th className="text-left py-2 text-sm font-medium text-gray-600">Verildi</th>
              <th className="text-left py-2 text-sm font-medium text-gray-600">İade</th>
              <th className="text-left py-2 text-sm font-medium text-gray-600">Satıldı</th>
            </tr>
          </thead>
          <tbody>
            {reportData.productStats.map((item) => (
              <tr key={item.product.id} className="border-b border-gray-100">
                <td className="py-2">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                    <div className="text-sm text-gray-500">{item.product.code}</div>
                  </div>
                </td>
                <td className="py-2 text-sm text-gray-900">{item.transactionCount}</td>
                <td className="py-2 text-sm text-gray-900">{item.totalQuantity}</td>
                <td className="py-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900">{item.currentStock}</span>
                    {item.stockStatus === 'low' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Düşük
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-2 text-sm text-red-600">{item.givenQuantity}</td>
                <td className="py-2 text-sm text-green-600">{item.returnedQuantity}</td>
                <td className="py-2 text-sm text-blue-600">{item.soldQuantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCategoryReport = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategori Analizi</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportData.categoryStats.map((item) => (
          <div key={item.category} className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-2">{item.category}</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ürün Sayısı:</span>
                <span className="font-medium">{item.productCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Hareket Sayısı:</span>
                <span className="font-medium">{item.transactionCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Toplam Miktar:</span>
                <span className="font-medium">{item.totalQuantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Toplam Stok:</span>
                <span className="font-medium">{item.totalStock}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCurrentReport = () => {
    switch (selectedReport) {
      case 'overview': return renderOverviewReport();
      case 'customers': return renderCustomerReport();
      case 'products': return renderProductReport();
      case 'categories': return renderCategoryReport();
      default: return renderOverviewReport();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Raporlar</h1>
          <p className="text-gray-600">Detaylı analiz ve raporlar</p>
        </div>
        
        <Button
          variant="primary"
          icon={Download}
          onClick={exportReport}
        >
          Raporu Dışa Aktar
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Başlangıç Tarihi"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            fullWidth
          />
          <Input
            label="Bitiş Tarihi"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            fullWidth
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rapor Türü
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
            >
              <option value="overview">Genel Bakış</option>
              <option value="customers">Müşteri Analizi</option>
              <option value="products">Kartela Analizi</option>
              <option value="categories">Kategori Analizi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {renderCurrentReport()}
    </div>
  );
};