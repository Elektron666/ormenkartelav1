import Papa from 'papaparse';
import { Customer, Product, Transaction } from '../types';

export interface CSVImportResult<T> {
  success: boolean;
  data: T[];
  errors: string[];
  skipped: number;
}

export class CSVService {
  // Customer CSV operations
  static exportCustomersToCSV(customers: Customer[]): string {
    const csvData = customers.map(customer => ({
      'Ad': customer.name,
      'Şirket': customer.company || '',
      'Telefon': customer.phone || '',
      'E-posta': customer.email || '',
      'Adres': customer.address || '',
      'Şehir': customer.city || '',
      'Notlar': customer.notes || '',
      'Oluşturma Tarihi': new Date(customer.createdAt).toLocaleDateString('tr-TR'),
    }));

    return Papa.unparse(csvData, {
      delimiter: ',',
      header: true,
      encoding: 'utf-8'
    });
  }

  static async importCustomersFromCSV(file: File): Promise<CSVImportResult<Customer>> {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        encoding: 'utf-8',
        complete: (results) => {
          const customers: Customer[] = [];
          const errors: string[] = [];
          let skipped = 0;

          results.data.forEach((row: any, index: number) => {
            try {
              // Required field validation
              if (!row['Ad'] && !row['Name'] && !row['name']) {
                errors.push(`Satır ${index + 1}: Müşteri adı gerekli`);
                skipped++;
                return;
              }

              const customer: Customer = {
                id: crypto.randomUUID(),
                name: row['Ad'] || row['Name'] || row['name'] || '',
                company: row['Şirket'] || row['Company'] || row['company'] || '',
                phone: row['Telefon'] || row['Phone'] || row['phone'] || '',
                email: row['E-posta'] || row['Email'] || row['email'] || '',
                address: row['Adres'] || row['Address'] || row['address'] || '',
                city: row['Şehir'] || row['City'] || row['city'] || '',
                notes: row['Notlar'] || row['Notes'] || row['notes'] || '',
                createdAt: new Date(),
                updatedAt: new Date(),
              };

              customers.push(customer);
            } catch (error) {
              errors.push(`Satır ${index + 1}: ${error}`);
              skipped++;
            }
          });

          resolve({
            success: errors.length === 0,
            data: customers,
            errors,
            skipped
          });
        },
        error: (error) => {
          resolve({
            success: false,
            data: [],
            errors: [`CSV okuma hatası: ${error.message}`],
            skipped: 0
          });
        }
      });
    });
  }

  // Product CSV operations
  static exportProductsToCSV(products: Product[]): string {
    const csvData = products.map(product => ({
      'Ad': product.name,
      'Kod': product.code,
      'Kategori': product.category || '',
      'Açıklama': product.description || '',
      'Birim': product.unit || '',
      'Fiyat': product.price || '',
      'Stok Miktarı': product.stockQuantity || '',
      'Min. Stok': product.minStockLevel || '',
      'Oluşturma Tarihi': new Date(product.createdAt).toLocaleDateString('tr-TR'),
    }));

    return Papa.unparse(csvData, {
      delimiter: ',',
      header: true,
      encoding: 'utf-8'
    });
  }

  static async importProductsFromCSV(file: File): Promise<CSVImportResult<Product>> {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        encoding: 'utf-8',
        complete: (results) => {
          const products: Product[] = [];
          const errors: string[] = [];
          let skipped = 0;

          results.data.forEach((row: any, index: number) => {
            try {
              // Required field validation
              if (!row['Ad'] && !row['Name'] && !row['name']) {
                errors.push(`Satır ${index + 1}: Ürün adı gerekli`);
                skipped++;
                return;
              }

              if (!row['Kod'] && !row['Code'] && !row['code']) {
                errors.push(`Satır ${index + 1}: Ürün kodu gerekli`);
                skipped++;
                return;
              }

              const product: Product = {
                id: crypto.randomUUID(),
                name: row['Ad'] || row['Name'] || row['name'] || '',
                code: row['Kod'] || row['Code'] || row['code'] || '',
                category: row['Kategori'] || row['Category'] || row['category'] || '',
                description: row['Açıklama'] || row['Description'] || row['description'] || '',
                unit: row['Birim'] || row['Unit'] || row['unit'] || '',
                price: parseFloat(row['Fiyat'] || row['Price'] || row['price'] || '0') || undefined,
                stockQuantity: parseInt(row['Stok Miktarı'] || row['Stock'] || row['stock'] || '0') || 0,
                minStockLevel: parseInt(row['Min. Stok'] || row['MinStock'] || row['minStock'] || '0') || 0,
                createdAt: new Date(),
                updatedAt: new Date(),
              };

              products.push(product);
            } catch (error) {
              errors.push(`Satır ${index + 1}: ${error}`);
              skipped++;
            }
          });

          resolve({
            success: errors.length === 0,
            data: products,
            errors,
            skipped
          });
        },
        error: (error) => {
          resolve({
            success: false,
            data: [],
            errors: [`CSV okuma hatası: ${error.message}`],
            skipped: 0
          });
        }
      });
    });
  }

  // Download CSV file
  static downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Generate sample CSV templates
  static generateCustomerTemplate(): string {
    const sampleData = [
      {
        'Ad': 'Örnek Müşteri 1',
        'Şirket': 'ABC Ltd. Şti.',
        'Telefon': '0532 123 45 67',
        'E-posta': 'musteri1@example.com',
        'Adres': 'Örnek Mahallesi, Örnek Sokak No:1',
        'Şehir': 'İstanbul',
        'Notlar': 'VIP müşteri'
      },
      {
        'Ad': 'Örnek Müşteri 2',
        'Şirket': 'XYZ A.Ş.',
        'Telefon': '0533 987 65 43',
        'E-posta': 'musteri2@example.com',
        'Adres': 'Test Mahallesi, Test Caddesi No:5',
        'Şehir': 'Ankara',
        'Notlar': 'Aylık müşteri'
      }
    ];

    return Papa.unparse(sampleData, {
      delimiter: ',',
      header: true,
      encoding: 'utf-8'
    });
  }

  static generateProductTemplate(): string {
    const sampleData = [
      {
        'Ad': 'Kartela A1',
        'Kod': 'KRT-A1-001',
        'Kategori': 'Standart Kartela',
        'Açıklama': 'Standart boyut kartela',
        'Birim': 'Adet',
        'Fiyat': '25.50',
        'Stok Miktarı': '100',
        'Min. Stok': '10'
      },
      {
        'Ad': 'Kartela B2',
        'Kod': 'KRT-B2-002',
        'Kategori': 'Büyük Kartela',
        'Açıklama': 'Büyük boyut kartela',
        'Birim': 'Adet',
        'Fiyat': '45.00',
        'Stok Miktarı': '50',
        'Min. Stok': '5'
      }
    ];

    return Papa.unparse(sampleData, {
      delimiter: ',',
      header: true,
      encoding: 'utf-8'
    });
  }
}