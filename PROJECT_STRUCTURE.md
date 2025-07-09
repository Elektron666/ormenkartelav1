# ORMEN KARTELA V1 - Proje Yapısı

## 📁 Dosya Organizasyonu

```
ormenkartelav1/
├── 📁 .github/
│   └── workflows/
│       └── android-build.yml          # Android APK build sistemi
├── 📁 src/
│   ├── 📁 components/
│   │   ├── ui/
│   │   │   ├── Button.tsx             # Buton komponenti
│   │   │   ├── Input.tsx              # Input komponenti
│   │   │   └── Modal.tsx              # Modal komponenti
│   │   ├── DateTimeDisplay.tsx        # Tarih/saat gösterimi
│   │   ├── ErrorBoundary.tsx          # Hata yakalama
│   │   ├── GitHubSync.tsx             # GitHub senkronizasyon
│   │   ├── Layout.tsx                 # Ana layout
│   │   └── Login.tsx                  # Giriş ekranı
│   ├── 📁 context/
│   │   └── AppContext.tsx             # Global state yönetimi
│   ├── 📁 hooks/
│   │   ├── useLocalStorage.ts         # LocalStorage hook
│   │   └── useOfflineSync.ts          # Çevrimdışı senkronizasyon
│   ├── 📁 pages/
│   │   ├── Dashboard.tsx              # Ana sayfa
│   │   ├── Customers.tsx              # Müşteri yönetimi
│   │   ├── Products.tsx               # Kartela yönetimi
│   │   ├── Stock.tsx                  # Stok yönetimi
│   │   ├── Transactions.tsx           # Hareket kayıtları
│   │   ├── Reports.tsx                # Raporlar
│   │   ├── Quotes.tsx                 # Motivasyon köşesi
│   │   ├── Notes.tsx                  # Kişisel notlar
│   │   └── Settings.tsx               # Ayarlar
│   ├── 📁 types/
│   │   └── index.ts                   # TypeScript tipleri
│   ├── 📁 utils/
│   │   ├── analytics.ts               # Analitik takip
│   │   ├── csv.ts                     # CSV import/export
│   │   ├── database.ts                # IndexedDB işlemleri
│   │   ├── helpers.ts                 # Yardımcı fonksiyonlar
│   │   ├── performance.ts             # Performans izleme
│   │   ├── security.ts                # Güvenlik utilities
│   │   └── storage.ts                 # Veri depolama
│   ├── App.tsx                        # Ana uygulama
│   ├── main.tsx                       # Giriş noktası
│   └── index.css                      # Global stiller
├── 📁 public/
├── 📄 Konfigürasyon Dosyaları
│   ├── package.json                   # NPM bağımlılıkları
│   ├── vite.config.ts                 # Vite konfigürasyonu
│   ├── tailwind.config.js             # Tailwind CSS
│   ├── eslint.config.js               # ESLint kuralları
│   ├── postcss.config.js              # PostCSS
│   └── .prettierrc                    # Prettier formatı
├── 📄 Dokümantasyon
│   ├── README.md                      # Ana dokümantasyon
│   ├── CHANGELOG.md                   # Değişiklik geçmişi
│   ├── CONTRIBUTING.md                # Katkı rehberi
│   ├── DEPLOYMENT.md                  # Deployment rehberi
│   ├── GITHUB_SETUP.md                # GitHub kurulum
│   └── GITHUB_DISCONNECT.md           # GitHub bağlantı kesme
└── index.html                         # HTML template

```

## 🔧 Teknoloji Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS
- **Vite** - Fast build tool
- **Lucide React** - Icon library

### State Management
- **React Context** - Global state
- **Custom Hooks** - Reusable logic
- **IndexedDB** - Client-side database
- **LocalStorage** - Settings storage

### Build & Deploy
- **GitHub Actions** - CI/CD pipeline
- **Cordova** - Android APK packaging
- **PWA** - Progressive Web App
- **Service Workers** - Offline support

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Vite PWA Plugin** - PWA generation

## 📱 Özellikler

### Core Features
- ✅ Müşteri yönetimi
- ✅ Kartela (ürün) yönetimi
- ✅ Stok takibi
- ✅ Hareket kayıtları
- ✅ Raporlama sistemi
- ✅ CSV import/export
- ✅ Yedekleme/geri yükleme

### Advanced Features
- ✅ PWA desteği
- ✅ Çevrimdışı çalışma
- ✅ Android APK build
- ✅ Motivasyon köşesi
- ✅ Kişisel notlar
- ✅ Performans izleme
- ✅ Güvenlik önlemleri
- ✅ Analitik takip

### UI/UX
- ✅ Responsive tasarım
- ✅ Modern arayüz
- ✅ Türkçe dil desteği
- ✅ Koyu/açık tema
- ✅ Animasyonlar
- ✅ Accessibility

---
**ORMEN TEKSTİL V1** - Modern kartela yönetimi