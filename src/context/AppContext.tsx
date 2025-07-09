import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Customer, Product, Transaction, StockMovement, StockItem, AppSettings, DashboardStats, TransactionWithDetails } from '../types';
import { storageService } from '../utils/storage';
import { generateId } from '../utils/helpers';

interface AppState {
  customers: Customer[];
  products: Product[];
  transactions: Transaction[];
  stockMovements: StockMovement[];
  stockItems: StockItem[];
  settings: AppSettings;
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_DATA'; payload: Omit<AppState, 'loading' | 'error'> }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'SET_CUSTOMERS'; payload: Customer[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_STOCK_MOVEMENT'; payload: StockMovement }
  | { type: 'SET_STOCK_MOVEMENTS'; payload: StockMovement[] }
  | { type: 'ADD_STOCK_ITEM'; payload: StockItem }
  | { type: 'UPDATE_STOCK_ITEM'; payload: StockItem }
  | { type: 'DELETE_STOCK_ITEM'; payload: string }
  | { type: 'SET_STOCK_ITEMS'; payload: StockItem[] }
  | { type: 'UPDATE_SETTINGS'; payload: AppSettings };

const initialState: AppState = {
  customers: [],
  products: [],
  transactions: [],
  stockMovements: [],
  stockItems: [],
  settings: {
    companyName: 'ORMEN TEKSTİL V1',
    theme: 'light',
    language: 'tr',
    autoBackup: true,
    backupInterval: 7,
  },
  loading: false,
  error: null,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'LOAD_DATA':
      return { ...state, ...action.payload };
    
    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };
    
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map(c => 
          c.id === action.payload.id ? action.payload : c
        ),
      };
    
    case 'DELETE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.filter(c => c.id !== action.payload),
      };
    
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload };
    
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p => 
          p.id === action.payload.id ? action.payload : p
        ),
      };
    
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload),
      };
    
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.payload] };
    
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t => 
          t.id === action.payload.id ? action.payload : t
        ),
      };
    
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
      };
    
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    
    case 'ADD_STOCK_MOVEMENT':
      return { ...state, stockMovements: [...state.stockMovements, action.payload] };
    
    case 'SET_STOCK_MOVEMENTS':
      return { ...state, stockMovements: action.payload };
    
    case 'ADD_STOCK_ITEM':
      return { ...state, stockItems: [...state.stockItems, action.payload] };
    
    case 'UPDATE_STOCK_ITEM':
      return {
        ...state,
        stockItems: state.stockItems.map(s => 
          s.id === action.payload.id ? action.payload : s
        ),
      };
    
    case 'DELETE_STOCK_ITEM':
      return {
        ...state,
        stockItems: state.stockItems.filter(s => s.id !== action.payload),
      };
    
    case 'SET_STOCK_ITEMS':
      return { ...state, stockItems: action.payload };
    
    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.payload };
    
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Customer methods
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  getCustomer: (id: string) => Customer | undefined;
  
  // Product methods
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  
  // Transaction methods
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsWithDetails: () => TransactionWithDetails[];
  getCustomerTransactions: (customerId: string) => TransactionWithDetails[];
  getProductTransactions: (productId: string) => TransactionWithDetails[];
  
  // Stock methods
  addStockMovement: (movement: Omit<StockMovement, 'id' | 'createdAt'>) => void;
  updateProductStock: (productId: string, quantity: number, type: 'in' | 'out' | 'adjustment', reason?: string) => void;
  
  // Stock Item methods
  addStockItem: (stockItem: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStockItem: (stockItem: StockItem) => void;
  deleteStockItem: (id: string) => void;
  getStockItem: (id: string) => StockItem | undefined;
  
  // Dashboard methods
  getDashboardStats: () => DashboardStats;
  
  // Bulk operations
  importCustomers: (customers: Customer[]) => void;
  importProducts: (products: Product[]) => void;
  
  // Backup & restore
  createBackup: () => void;
  restoreBackup: (backupData: any) => void;
  clearAllData: () => void;
  
  // Settings
  updateSettings: (settings: AppSettings) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data on mount
  useEffect(() => {
    const loadData = () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const customers = storageService.getCustomers();
        const products = storageService.getProducts();
        const transactions = storageService.getTransactions();
        const stockMovements = storageService.getStockMovements();
        const stockItems = storageService.getStockItems();
        const settings = storageService.getSettings();
        
        dispatch({
          type: 'LOAD_DATA',
          payload: { customers, products, transactions, stockMovements, stockItems, settings }
        });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Veri yüklenirken hata oluştu' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadData();
  }, []);

  // Save data when state changes
  useEffect(() => {
    if (state.customers.length > 0 || state.products.length > 0 || state.stockItems.length > 0) {
      storageService.saveCustomers(state.customers);
      storageService.saveProducts(state.products);
      storageService.saveTransactions(state.transactions);
      storageService.saveStockMovements(state.stockMovements);
      storageService.saveStockItems(state.stockItems);
      storageService.saveSettings(state.settings);
    }
  }, [state.customers, state.products, state.transactions, state.stockMovements, state.stockItems, state.settings]);

  // Customer methods
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const customer: Customer = {
      ...customerData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'ADD_CUSTOMER', payload: customer });
  };

  const updateCustomer = (customer: Customer) => {
    const updatedCustomer = { ...customer, updatedAt: new Date() };
    dispatch({ type: 'UPDATE_CUSTOMER', payload: updatedCustomer });
  };

  const deleteCustomer = (id: string) => {
    dispatch({ type: 'DELETE_CUSTOMER', payload: id });
  };

  const getCustomer = (id: string) => {
    return state.customers.find(c => c.id === id);
  };

  // Product methods
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const product: Product = {
      ...productData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'ADD_PRODUCT', payload: product });
  };

  const updateProduct = (product: Product) => {
    const updatedProduct = { ...product, updatedAt: new Date() };
    dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
  };

  const deleteProduct = (id: string) => {
    dispatch({ type: 'DELETE_PRODUCT', payload: id });
  };

  const getProduct = (id: string) => {
    return state.products.find(p => p.id === id);
  };

  // Transaction methods
  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const transaction: Transaction = {
      ...transactionData,
      id: generateId(),
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });

    // Update product stock
    const product = getProduct(transaction.productId);
    if (product) {
      const stockChange = transaction.type === 'given' ? -transaction.quantity : 
                         transaction.type === 'returned' ? transaction.quantity : 
                         -transaction.quantity;
      
      updateProductStock(
        transaction.productId, 
        stockChange, 
        stockChange > 0 ? 'in' : 'out',
        `${transaction.type} - ${getCustomer(transaction.customerId)?.name}`
      );
    }
  };

  const updateTransaction = (transaction: Transaction) => {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
  };

  const deleteTransaction = (id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  };

  const getTransactionsWithDetails = (): TransactionWithDetails[] => {
    return state.transactions.map(transaction => ({
      ...transaction,
      customer: getCustomer(transaction.customerId)!,
      product: getProduct(transaction.productId)!,
    })).filter(t => t.customer && t.product);
  };

  const getCustomerTransactions = (customerId: string): TransactionWithDetails[] => {
    return getTransactionsWithDetails().filter(t => t.customerId === customerId);
  };

  const getProductTransactions = (productId: string): TransactionWithDetails[] => {
    return getTransactionsWithDetails().filter(t => t.productId === productId);
  };

  // Stock methods
  const addStockMovement = (movementData: Omit<StockMovement, 'id' | 'createdAt'>) => {
    const movement: StockMovement = {
      ...movementData,
      id: generateId(),
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_STOCK_MOVEMENT', payload: movement });
  };

  const updateProductStock = (productId: string, quantity: number, type: 'in' | 'out' | 'adjustment', reason?: string) => {
    const product = getProduct(productId);
    if (!product) return;

    let newStockQuantity = product.stockQuantity || 0;
    
    if (type === 'in') {
      newStockQuantity += Math.abs(quantity);
    } else if (type === 'out') {
      newStockQuantity -= Math.abs(quantity);
    } else {
      newStockQuantity = quantity;
    }

    newStockQuantity = Math.max(0, newStockQuantity);

    updateProduct({
      ...product,
      stockQuantity: newStockQuantity,
    });

    addStockMovement({
      productId,
      type,
      quantity: Math.abs(quantity),
      reason,
    });
  };

  // Stock Item methods
  const addStockItem = (stockItemData: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const stockItem: StockItem = {
      ...stockItemData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'ADD_STOCK_ITEM', payload: stockItem });
  };

  const updateStockItem = (stockItem: StockItem) => {
    const updatedStockItem = { ...stockItem, updatedAt: new Date() };
    dispatch({ type: 'UPDATE_STOCK_ITEM', payload: updatedStockItem });
  };

  const deleteStockItem = (id: string) => {
    dispatch({ type: 'DELETE_STOCK_ITEM', payload: id });
  };

  const getStockItem = (id: string) => {
    return state.stockItems.find(s => s.id === id);
  };

  // Dashboard methods
  const getDashboardStats = (): DashboardStats => {
    const transactionsWithDetails = getTransactionsWithDetails();
    const lowStockProducts = state.products.filter(p => 
      (p.stockQuantity || 0) <= (p.minStockLevel || 0)
    ).length;

    const recentTransactions = transactionsWithDetails
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // Top customers by transaction count
    const customerTransactionCounts = state.customers.map(customer => {
      const customerTransactions = transactionsWithDetails.filter(t => t.customerId === customer.id);
      const lastTransaction = customerTransactions.length > 0 
        ? new Date(Math.max(...customerTransactions.map(t => new Date(t.createdAt).getTime())))
        : new Date(0);
      
      return {
        customer,
        transactionCount: customerTransactions.length,
        lastTransaction,
      };
    }).sort((a, b) => b.transactionCount - a.transactionCount).slice(0, 5);

    // Top products by transaction count
    const productTransactionCounts = state.products.map(product => {
      const productTransactions = transactionsWithDetails.filter(t => t.productId === product.id);
      const totalQuantity = productTransactions.reduce((sum, t) => sum + t.quantity, 0);
      
      return {
        product,
        transactionCount: productTransactions.length,
        totalQuantity,
      };
    }).sort((a, b) => b.transactionCount - a.transactionCount).slice(0, 5);

    return {
      totalCustomers: state.customers.length,
      totalProducts: state.products.length,
      totalTransactions: state.transactions.length,
      lowStockProducts,
      recentTransactions,
      topCustomers: customerTransactionCounts,
      topProducts: productTransactionCounts,
    };
  };

  // Bulk operations
  const importCustomers = (customers: Customer[]) => {
    dispatch({ type: 'SET_CUSTOMERS', payload: [...state.customers, ...customers] });
  };

  const importProducts = (products: Product[]) => {
    dispatch({ type: 'SET_PRODUCTS', payload: [...state.products, ...products] });
  };

  // Backup & restore
  const createBackup = () => {
    const backupData = storageService.createBackup();
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kartela-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const restoreBackup = (backupData: any) => {
    try {
      storageService.restoreFromBackup(backupData);
      
      dispatch({
        type: 'LOAD_DATA',
        payload: {
          customers: backupData.customers || [],
          products: backupData.products || [],
          transactions: backupData.transactions || [],
          stockMovements: backupData.stockMovements || [],
        stockItems: backupData.stockItems || [],
          settings: backupData.settings || state.settings,
        }
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Yedek geri yükleme başarısız' });
    }
  };

  const clearAllData = () => {
    storageService.clearAllData();
    dispatch({
      type: 'LOAD_DATA',
      payload: {
        customers: [],
        products: [],
        transactions: [],
        stockMovements: [],
      stockItems: [],
        settings: initialState.settings,
      }
    });
  };

  // Settings
  const updateSettings = (settings: AppSettings) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomer,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsWithDetails,
    getCustomerTransactions,
    getProductTransactions,
    addStockMovement,
    updateProductStock,
    addStockItem,
    updateStockItem,
    deleteStockItem,
    getStockItem,
    getDashboardStats,
    importCustomers,
    importProducts,
    createBackup,
    restoreBackup,
    clearAllData,
    updateSettings,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};