# Dolce Vita Bodrum

## Siteyi çalıştırma

```bash
npm install
npm start
```

Site: http://localhost:3000
Yönetim paneli: http://localhost:3000/admin.html

Varsayılan giriş bilgileri: kullanıcı adı `admin`, şifre `dolcevita2026`.
Değiştirmek için sunucuyu başlatmadan önce `ADMIN_USER` ve `ADMIN_PASSWORD`
ortam değişkenlerini ayarlayın:

```bash
ADMIN_USER=myuser ADMIN_PASSWORD=mypassword npm start
```

## Yönetim panelinden neler değiştirilebilir?

- **İçerik** sekmesi: menü etiketleri, tüm bölüm başlık/metinleri, bungalov
  kartları ve misafir yorumları (İngilizce ve Türkçe ayrı ayrı).
- **Görseller** sekmesi: canlı site önizlemesi üzerinden fotoğraf alanlarına
  tıklayıp yeni görsel sürükleyip bırakabilirsiniz (bungalov fotoğrafları,
  havuz, kahvaltı, galeri) ve arkaplan panorama görselini yükleyebilirsiniz.

Tüm değişiklikler sunucu tarafında dosyalara kaydedilir (`content.json`,
`.image-slots.state.json`, `assets/pano-wide.png`) ve siteye anında yansır.
