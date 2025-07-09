# GitHub Bağlantısını Kesme Rehberi

## 🔴 GitHub Sync Sorunu Çözümü

"Syncing to GitHub" kırmızı yanıyorsa ve çıkış yapmak istiyorsanız:

### Yöntem 1: Bolt.new Arayüzünden
1. **Sağ üst köşede** GitHub simgesine tıklayın
2. **"Disconnect from GitHub"** veya **"Sign out"** butonunu arayın
3. Onaylayın

### Yöntem 2: Browser Ayarlarından
1. **F12** tuşuna basın (Developer Tools)
2. **Application** sekmesine gidin
3. **Local Storage** > **bolt.new** altında GitHub token'ları silin
4. **Session Storage**'ı da temizleyin
5. Sayfayı yenileyin (**F5**)

### Yöntem 3: Tarayıcı Çerezlerini Temizle
1. **Ctrl+Shift+Delete** (Chrome/Edge)
2. **bolt.new** için çerezleri temizleyin
3. Sayfayı yenileyin

### Yöntem 4: Yeni Sekme/Gizli Mod
1. **Ctrl+Shift+N** (Gizli mod)
2. bolt.new'i yeniden açın
3. Projeyi yeniden yükleyin

## ⚠️ Önemli Notlar

- Bağlantıyı kesmeden önce **dosyalarınızı yedekleyin**
- Proje dosyaları kaybolmaz, sadece GitHub sync durur
- İstediğiniz zaman tekrar bağlanabilirsiniz

## 🔄 Tekrar Bağlanma

GitHub'a tekrar bağlanmak için:
1. **Connect to GitHub** butonuna tıklayın
2. **ormenkartelav1** organizasyonunu seçin
3. Repository izinlerini onaylayın

## 📱 Alternatif Çözümler

Eğer sync sorunu devam ederse:
- Projeyi **Download** edin
- GitHub Desktop kullanın
- Manuel olarak GitHub'a yükleyin

---

**Not**: Bu işlemler sadece GitHub bağlantısını keser, proje dosyalarınız güvende kalır.