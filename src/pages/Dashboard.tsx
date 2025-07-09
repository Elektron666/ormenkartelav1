import React from 'react';
import { Users, Package, ArrowRightLeft, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DateTimeDisplay } from '../components/DateTimeDisplay';
import { formatDate, formatRelativeTime } from '../utils/helpers';

export const Dashboard: React.FC = () => {
  const { getDashboardStats } = useApp();
  const stats = getDashboardStats();

  const statCards = [
    {
      title: 'Toplam Müşteri',
      value: stats.totalCustomers,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Toplam Kartela',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Toplam Hareket',
      value: stats.totalTransactions,
      icon: ArrowRightLeft,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Düşük Stok',
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-ormen-gradient rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36c-.5-.23-1.05-.36-1.64-.36-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l2.36 2.36c-.23.5-.36 1.05-.36 1.64 0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4c-.59 0-1.14.13-1.64.36L14 12l2.36-2.36c.5.23 1.05.36 1.64.36 2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4c0 .59.13 1.14.36 1.64L12 10 9.64 7.64z"/>
            </svg>
            <div className="ml-3">
            <h1 className="text-2xl font-bold mb-1">ORMEN TEKSTİL</h1>
            <p className="text-sm opacity-90">Kartela Yönetim Sistemi V1</p>
            </div>
          </div>
          
          {/* Prominent Clock Display */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-30">
            <DateTimeDisplay />
          </div>
        </div>
        <p className="text-white text-opacity-90">
          Hoş geldiniz! Sistem durumunuzu ve son aktiviteleri aşağıda görebilirsiniz.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Son Hareketler</h3>
            </div>
          </div>
          <div className="p-6">
            {stats.recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {stats.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.customer.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.product.name} - {transaction.quantity} adet
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatRelativeTime(transaction.createdAt)}
                      </p>
                    </div>
                    <div className="ml-4">
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Henüz hareket bulunmuyor</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">En Aktif Müşteriler</h3>
            </div>
          </div>
          <div className="p-6">
            {stats.topCustomers.length > 0 ? (
              <div className="space-y-4">
                {stats.topCustomers.map((item, index) => (
                  <div key={item.customer.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center mr-3 shadow-md">
                        <span className="text-xs font-bold text-white">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.customer.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Son hareket: {formatDate(item.lastTransaction)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {item.transactionCount} hareket
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Henüz müşteri bulunmuyor</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Package className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">En Çok Kullanılan Kartelalar</h3>
          </div>
        </div>
        <div className="p-6">
          {stats.topProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.topProducts.map((item, index) => (
                <div key={item.product.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {item.product.name}
                    </h4>
                    <span className="text-xs text-gray-500">#{index + 1}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{item.product.code}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Hareket:</span>
                    <span className="font-medium">{item.transactionCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Toplam:</span>
                    <span className="font-medium">{item.totalQuantity} adet</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Henüz kartela bulunmuyor</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};