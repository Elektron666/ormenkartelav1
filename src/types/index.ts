export interface Customer {
  id: string;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  category?: string;
  description?: string;
  unit?: string;
  price?: number;
  stockQuantity?: number;
  minStockLevel?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  customerId: string;
  productId: string;
  type: 'given' | 'returned' | 'sold';
  quantity: number;
  notes?: string;
  createdAt: Date;
  createdBy?: string;
}

export interface TransactionWithDetails extends Transaction {
  customer: Customer;
  product: Product;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason?: string;
  notes?: string;
  createdAt: Date;
  createdBy?: string;
}

export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  location: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppSettings {
  companyName: string;
  theme: 'light' | 'dark';
  language: 'tr' | 'en';
  autoBackup: boolean;
  backupInterval: number; // days
  lastBackup?: Date;
}

export interface BackupData {
  customers: Customer[];
  products: Product[];
  transactions: Transaction[];
  stockMovements: StockMovement[];
  stockItems: StockItem[];
  settings: AppSettings;
  exportDate: Date;
  version: string;
}

export interface FilterOptions {
  search?: string;
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  type?: string;
  customerId?: string;
  productId?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  totalTransactions: number;
  lowStockProducts: number;
  recentTransactions: TransactionWithDetails[];
  topCustomers: Array<{
    customer: Customer;
    transactionCount: number;
    lastTransaction: Date;
  }>;
  topProducts: Array<{
    product: Product;
    transactionCount: number;
    totalQuantity: number;
  }>;
}