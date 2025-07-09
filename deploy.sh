#!/bin/bash

# ORMEN KARTELA V1 - GitHub Deployment Script
echo "🚀 ORMEN KARTELA V1 - GitHub'a yükleniyor..."

# Git repository'yi başlat
git init

# Uzak repository'yi ekle
git remote add origin https://github.com/Elektron666/ormenkartelav1.git

# Tüm dosyaları ekle
git add .

# İlk commit
git commit -m "Initial commit: ORMEN KARTELA V1 - Complete application with Android build system

✨ Features:
- Modern kartela ve müşteri yönetim sistemi
- PWA desteği ve çevrimdışı çalışma
- Android APK otomatik build sistemi
- GitHub Actions CI/CD pipeline
- Responsive tasarım ve Türkçe dil desteği
- Motivasyon köşesi ve kişisel notlar
- Gelişmiş raporlama ve analitik
- Güvenlik ve performans optimizasyonları

🔧 Tech Stack:
- React 18 + TypeScript
- Tailwind CSS
- Vite build system
- IndexedDB storage
- Service Workers
- Cordova for Android

📱 Android APK:
- Otomatik build sistemi
- GitHub Actions integration
- Release management

🏢 ORMEN TEKSTİL V1 - 2025"

# Ana branch'e push et
git branch -M main
git push -u origin main

echo "✅ Proje başarıyla GitHub'a yüklendi!"
echo "🌐 Repository: https://github.com/Elektron666/ormenkartelav1"
echo "📱 Android APK build'leri otomatik olarak çalışacak"