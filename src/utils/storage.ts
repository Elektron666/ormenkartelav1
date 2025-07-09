import { Customer, Product, Transaction, StockMovement, AppSettings, BackupData } from '../types';
import { StockItem } from '../types';

const STORAGE_KEYS = {
  CUSTOMERS: 'kartela_customers',
  PRODUCTS: 'kartela_products',
  TRANSACTIONS: 'kartela_transactions',
  STOCK_MOVEMENTS: 'kartela_stock_movements',
  STOCK_ITEMS: 'kartela_stock_items',
  SETTINGS: 'kartela_settings',
} as const;

class StorageService {
  private getFromStorage<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from storage (${key}):`, error);
      return defaultValue;
    }
  }

  private saveToStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving to storage (${key}):`, error);
      throw new Error(`Veri kaydedilemedi: ${error}`);
    }
  }

  // Customers
  getCustomers(): Customer[] {
    return this.getFromStorage(STORAGE_KEYS.CUSTOMERS, []);
  }

  saveCustomers(customers: Customer[]): void {
    this.saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
  }

  // Products
  getProducts(): Product[] {
    return this.getFromStorage(STORAGE_KEYS.PRODUCTS, []);
  }

  saveProducts(products: Product[]): void {
    this.saveToStorage(STORAGE_KEYS.PRODUCTS, products);
  }

  // Transactions
  getTransactions(): Transaction[] {
    return this.getFromStorage(STORAGE_KEYS.TRANSACTIONS, []);
  }

  saveTransactions(transactions: Transaction[]): void {
    this.saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
  }

  // Stock Movements
  getStockMovements(): StockMovement[] {
    return this.getFromStorage(STORAGE_KEYS.STOCK_MOVEMENTS, []);
  }

  saveStockMovements(movements: StockMovement[]): void {
    this.saveToStorage(STORAGE_KEYS.STOCK_MOVEMENTS, movements);
  }

  // Stock Items
  getStockItems(): StockItem[] {
    return this.getFromStorage(STORAGE_KEYS.STOCK_ITEMS, []);
  }

  saveStockItems(stockItems: StockItem[]): void {
    this.saveToStorage(STORAGE_KEYS.STOCK_ITEMS, stockItems);
  }

  // Settings
  getSettings(): AppSettings {
    return this.getFromStorage(STORAGE_KEYS.SETTINGS, {
      companyName: 'Kartela Yönetim Sistemi',
      theme: 'light' as const,
      language: 'tr' as const,
      autoBackup: true,
      backupInterval: 7,
    });
  }

  saveSettings(settings: AppSettings): void {
    this.saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  }

  // Backup & Restore
  createBackup(): BackupData {
    return {
      customers: this.getCustomers(),
      products: this.getProducts(),
      transactions: this.getTransactions(),
      stockMovements: this.getStockMovements(),
      stockItems: this.getStockItems(),
      settings: this.getSettings(),
      exportDate: new Date(),
      version: '1.0.0',
    };
  }

  restoreFromBackup(backupData: BackupData): void {
    try {
      if (backupData.customers) this.saveCustomers(backupData.customers);
      if (backupData.products) this.saveProducts(backupData.products);
      if (backupData.transactions) this.saveTransactions(backupData.transactions);
      if (backupData.stockMovements) this.saveStockMovements(backupData.stockMovements);
      if (backupData.stockItems) this.saveStockItems(backupData.stockItems);
      if (backupData.settings) this.saveSettings(backupData.settings);
    } catch (error) {
      console.error('Backup restore error:', error);
      throw new Error('Yedek geri yükleme sırasında hata oluştu');
    }
  }

  // Clear all data
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Get storage size info
  getStorageInfo(): { used: number; available: number; percentage: number } {
    let used = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    const available = 5 * 1024 * 1024; // 5MB typical localStorage limit
    const percentage = (used / available) * 100;
    
    return { used, available, percentage };
  }
}

export const storageService = new StorageService();