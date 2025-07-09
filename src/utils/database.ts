import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Customer, Product, Transaction, StockMovement, StockItem, AppSettings } from '../types';

interface OrmenDB extends DBSchema {
  customers: {
    key: string;
    value: Customer;
    indexes: { 'by-name': string; 'by-company': string };
  };
  products: {
    key: string;
    value: Product;
    indexes: { 'by-name': string; 'by-code': string; 'by-category': string };
  };
  transactions: {
    key: string;
    value: Transaction;
    indexes: { 'by-customer': string; 'by-product': string; 'by-date': Date };
  };
  stockMovements: {
    key: string;
    value: StockMovement;
    indexes: { 'by-product': string; 'by-date': Date };
  };
  stockItems: {
    key: string;
    value: StockItem;
    indexes: { 'by-name': string; 'by-location': string };
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

class DatabaseService {
  private db: IDBPDatabase<OrmenDB> | null = null;
  private readonly DB_NAME = 'OrmenDB';
  private readonly DB_VERSION = 1;

  async init(): Promise<void> {
    try {
      this.db = await openDB<OrmenDB>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          // Customers store
          const customerStore = db.createObjectStore('customers', { keyPath: 'id' });
          customerStore.createIndex('by-name', 'name');
          customerStore.createIndex('by-company', 'company');

          // Products store
          const productStore = db.createObjectStore('products', { keyPath: 'id' });
          productStore.createIndex('by-name', 'name');
          productStore.createIndex('by-code', 'code');
          productStore.createIndex('by-category', 'category');

          // Transactions store
          const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
          transactionStore.createIndex('by-customer', 'customerId');
          transactionStore.createIndex('by-product', 'productId');
          transactionStore.createIndex('by-date', 'createdAt');

          // Stock movements store
          const stockMovementStore = db.createObjectStore('stockMovements', { keyPath: 'id' });
          stockMovementStore.createIndex('by-product', 'productId');
          stockMovementStore.createIndex('by-date', 'createdAt');

          // Stock items store
          const stockItemStore = db.createObjectStore('stockItems', { keyPath: 'id' });
          stockItemStore.createIndex('by-name', 'name');
          stockItemStore.createIndex('by-location', 'location');

          // Settings store
          db.createObjectStore('settings', { keyPath: 'id' });
        },
      });
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  private ensureDB(): IDBPDatabase<OrmenDB> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  // Generic CRUD operations
  async getAll<T extends keyof OrmenDB>(storeName: T): Promise<OrmenDB[T]['value'][]> {
    const db = this.ensureDB();
    return await db.getAll(storeName);
  }

  async get<T extends keyof OrmenDB>(storeName: T, key: string): Promise<OrmenDB[T]['value'] | undefined> {
    const db = this.ensureDB();
    return await db.get(storeName, key);
  }

  async add<T extends keyof OrmenDB>(storeName: T, value: OrmenDB[T]['value']): Promise<void> {
    const db = this.ensureDB();
    await db.add(storeName, value);
  }

  async put<T extends keyof OrmenDB>(storeName: T, value: OrmenDB[T]['value']): Promise<void> {
    const db = this.ensureDB();
    await db.put(storeName, value);
  }

  async delete<T extends keyof OrmenDB>(storeName: T, key: string): Promise<void> {
    const db = this.ensureDB();
    await db.delete(storeName, key);
  }

  async clear<T extends keyof OrmenDB>(storeName: T): Promise<void> {
    const db = this.ensureDB();
    await db.clear(storeName);
  }

  // Specialized queries
  async getCustomersByName(name: string): Promise<Customer[]> {
    const db = this.ensureDB();
    const tx = db.transaction('customers', 'readonly');
    const index = tx.store.index('by-name');
    return await index.getAll(IDBKeyRange.bound(name, name + '\uffff'));
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const db = this.ensureDB();
    const tx = db.transaction('products', 'readonly');
    const index = tx.store.index('by-category');
    return await index.getAll(category);
  }

  async getTransactionsByCustomer(customerId: string): Promise<Transaction[]> {
    const db = this.ensureDB();
    const tx = db.transaction('transactions', 'readonly');
    const index = tx.store.index('by-customer');
    return await index.getAll(customerId);
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    const db = this.ensureDB();
    const tx = db.transaction('transactions', 'readonly');
    const index = tx.store.index('by-date');
    return await index.getAll(IDBKeyRange.bound(startDate, endDate));
  }

  // Backup and restore
  async createBackup(): Promise<any> {
    const backup = {
      customers: await this.getAll('customers'),
      products: await this.getAll('products'),
      transactions: await this.getAll('transactions'),
      stockMovements: await this.getAll('stockMovements'),
      stockItems: await this.getAll('stockItems'),
      settings: await this.getAll('settings'),
      exportDate: new Date(),
      version: '1.0.0'
    };
    return backup;
  }

  async restoreFromBackup(backup: any): Promise<void> {
    const db = this.ensureDB();
    const tx = db.transaction(['customers', 'products', 'transactions', 'stockMovements', 'stockItems', 'settings'], 'readwrite');

    try {
      // Clear existing data
      await Promise.all([
        tx.objectStore('customers').clear(),
        tx.objectStore('products').clear(),
        tx.objectStore('transactions').clear(),
        tx.objectStore('stockMovements').clear(),
        tx.objectStore('stockItems').clear(),
        tx.objectStore('settings').clear()
      ]);

      // Restore data
      if (backup.customers) {
        for (const customer of backup.customers) {
          await tx.objectStore('customers').add(customer);
        }
      }

      if (backup.products) {
        for (const product of backup.products) {
          await tx.objectStore('products').add(product);
        }
      }

      if (backup.transactions) {
        for (const transaction of backup.transactions) {
          await tx.objectStore('transactions').add(transaction);
        }
      }

      if (backup.stockMovements) {
        for (const movement of backup.stockMovements) {
          await tx.objectStore('stockMovements').add(movement);
        }
      }

      if (backup.stockItems) {
        for (const item of backup.stockItems) {
          await tx.objectStore('stockItems').add(item);
        }
      }

      if (backup.settings) {
        for (const setting of backup.settings) {
          await tx.objectStore('settings').add(setting);
        }
      }

      await tx.done;
    } catch (error) {
      tx.abort();
      throw error;
    }
  }

  async getStorageSize(): Promise<{ used: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0
      };
    }
    return { used: 0, quota: 0 };
  }
}

export const databaseService = new DatabaseService();