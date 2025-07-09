# ORMEN TEKSTİL V1 - Kartela Yönetim Sistemi

Modern, kullanıcı dostu kartela ve müşteri yönetim sistemi. Tablet için optimize edilmiş, hızlı ve güvenilir.

## 🚀 GitHub Repository

Bu proje GitHub'da geliştirilmektedir: **https://github.com/ormenkartelav1/ormen-kartela-v1**

### GitHub Actions ile Otomatik Build

Her push işleminde otomatik olarak:
- Web uygulaması build edilir
- Android APK oluşturulur
- Release olarak yayınlanır

### 📱 APK İndirme
En son Android APK'yı [Releases sayfasından](https://github.com/ormenkartelav1/ormen-kartela-v1/releases) indirebilirsiniz.

### 🌐 Canlı Demo
- **Web App**: https://ormenkartelav1.github.io/ormen-kartela-v1
- **GitHub**: https://github.com/ormenkartelav1/ormen-kartela-v1
- **Issues**: https://github.com/ormenkartelav1/ormen-kartela-v1/issues
- **Releases**: https://github.com/ormenkartelav1/ormen-kartela-v1/releases

## 🚀 Özellikler

### 📱 Temel Özellikler
- **Müşteri Yönetimi**: Kapsamlı müşteri kayıt ve takip sistemi
- **Kartela Yönetimi**: Ürün katalog yönetimi ve stok takibi
- **Hareket Takibi**: Detaylı işlem geçmişi ve raporlama
- **Stok Yönetimi**: Gerçek zamanlı stok takibi ve uyarılar
- **Raporlama**: Gelişmiş analiz ve raporlama araçları

### 🎯 Gelişmiş Özellikler
- **PWA Desteği**: Çevrimdışı çalışma ve uygulama benzeri deneyim
- **Çevrimdışı Senkronizasyon**: İnternet bağlantısı olmadan çalışma
- **Güvenlik**: Gelişmiş güvenlik önlemleri ve oturum yönetimi
- **Performans İzleme**: Uygulama performansı takibi
- **Analitik**: Kullanım istatistikleri ve davranış analizi
- **Hata Yönetimi**: Kapsamlı hata yakalama ve raporlama

### 🎨 Kullanıcı Deneyimi
- **Motivasyon Köşesi**: İlham verici antik felsefe sözleri
- **Kişisel Notlar**: Kategorize edilmiş not alma sistemi
- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm
- **Koyu/Açık Tema**: Kullanıcı tercihi tema desteği

## 🛠️ Teknoloji Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool
- **Lucide React** - Beautiful icons

### Backend & Database
- **IndexedDB** - Client-side database
- **LocalStorage** - Settings and cache
- **Service Workers** - PWA functionality

### Build & Deployment
- **GitHub Actions** - CI/CD pipeline
- **Cordova** - Mobile app packaging
- **PWA** - Progressive Web App

## 📱 Android APK Build

### Otomatik Build (GitHub Actions)
1. Kodu GitHub'a push edin
2. Actions otomatik olarak çalışır
3. APK dosyası Releases bölümünde yayınlanır

### Manuel Build
```bash
# Dependencies yükle
npm install

# Web uygulamasını build et
npm run build

# Cordova projesi oluştur
cordova create ormen-app com.ormen.tekstil "ORMEN TEKSTİL V1"
cd ormen-app

# Web build'i kopyala
cp -r ../dist/* www/

# Android platform ekle
cordova platform add android

# APK build et
cordova build android --release
```

## 🔐 Güvenlik

### Giriş Bilgileri
- **Kullanıcı Adı**: `ORMEN`
- **Şifre**: `ORMEN666-F1`

### Güvenlik Özellikleri
- Oturum yönetimi (30 dakika timeout)
- Rate limiting (5 deneme/5 dakika)
- Input sanitization
- Data encryption
- Secure session storage

## 📊 Performans

### Optimizasyonlar
- Code splitting
- Lazy loading
- Bundle optimization
- Image optimization
- Caching strategies

### Monitoring
- Performance metrics
- Memory usage tracking
- Network monitoring
- Error tracking
- User analytics

## 🔧 Geliştirme

### Kurulum
```bash
# Repository'yi klonla
git clone <repository-url>
cd ormen-tekstil-v1

# Dependencies yükle
npm install

# Development server başlat
npm run dev
```

### Build
```bash
# Production build
npm run build

# Preview build
npm run preview
```

### Linting & Formatting
```bash
# ESLint çalıştır
npm run lint

# Prettier ile format
npm run format
```

## 📁 Proje Yapısı

```
src/
├── components/          # Reusable components
│   ├── ui/             # UI components
│   ├── Layout.tsx      # Main layout
│   ├── Login.tsx       # Login component
│   └── ErrorBoundary.tsx
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── Customers.tsx
│   ├── Products.tsx
│   ├── Stock.tsx
│   ├── Transactions.tsx
│   ├── Reports.tsx
│   ├── Quotes.tsx
│   ├── Notes.tsx
│   └── Settings.tsx
├── context/            # React context
├── hooks/              # Custom hooks
├── types/              # TypeScript types
├── utils/              # Utility functions
│   ├── database.ts     # IndexedDB operations
│   ├── security.ts     # Security utilities
│   ├── analytics.ts    # Analytics tracking
│   ├── performance.ts  # Performance monitoring
│   └── storage.ts      # Storage utilities
└── styles/             # CSS files
```

## 🚀 Deployment

### PWA Deployment
1. `npm run build` ile build alın
2. `dist/` klasörünü web sunucusuna yükleyin
3. HTTPS üzerinden servis edin

### Android APK
1. GitHub Actions otomatik build
2. Manuel Cordova build
3. Play Store yayını (opsiyonel)

## 📈 Roadmap

### v1.1 (Planlanan)
- [ ] Multi-language support
- [ ] Advanced reporting
- [ ] Data export/import
- [ ] User management
- [ ] API integration

### v1.2 (Gelecek)
- [ ] Real-time sync
- [ ] Cloud backup
- [ ] Mobile notifications
- [ ] Barcode scanning
- [ ] Print support

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje ORMEN TEKSTİL tarafından geliştirilmiştir. Tüm hakları saklıdır.

## 📞 İletişim

- **Şirket**: ORMEN TEKSTİL
- **Versiyon**: V1.0.0
- **Build**: GitHub Actions

---

**ORMEN TEKSTİL V1** - Modern kartela yönetiminin geleceği 🚀

---
*Son güncelleme: 2025-01-27*