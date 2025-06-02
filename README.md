# Teknoloji Blogu / Haber Sitesi

Bu proje, modern web teknolojileri kullanılarak geliştirilmiş bir teknoloji blogu / haber sitesidir. Frontend React.js, backend Node.js + Express.js ile geliştirilmiştir ve veritabanı olarak MongoDB kullanılmaktadır.

## Özellikler

- Kullanıcı dostu arayüz
- Kategorilere göre içerik filtreleme
- Detaylı haber sayfaları
- Galeri sayfası
- Admin paneli ile içerik yönetimi
- Ziyaretçi ve çevrimiçi kullanıcı sayısı takibi
- CSRF koruması
- JWT ile kullanıcı yetkilendirmesi
- Otomatik sitemap.xml oluşturma
- Responsive tasarım

## Teknolojiler

### Frontend
- React.js
- React Router
- Axios
- Bootstrap 5
- Socket.IO Client

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Socket.IO
- CSRF Protection
- Multer (dosya yükleme)
- Slugify

## Kurulum

### Gereksinimler
- Node.js (v14 veya üzeri)
- MongoDB

### Backend Kurulumu

```bash
# Backend klasörüne git
cd backend

# Bağımlılıkları yükle
npm install

# .env dosyasını düzenle (gerekirse)
# .env dosyasında MongoDB bağlantı bilgilerini ayarla

# Sunucuyu başlat
npm run dev
```

### Frontend Kurulumu

```bash
# Frontend klasörüne git
cd frontend

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm start
```

## Kullanım

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Admin paneli: http://localhost:3000/admin (giriş gerektirir)

## Klasör Yapısı

### Frontend

```
frontend/
│
├── public/
│   └── index.html, favicon, vs.
├── src/
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Categories.jsx
│   │   ├── PostDetail.jsx
│   │   ├── Gallery.jsx
│   │   └── About.jsx
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── PostCard.jsx
│   ├── services/
│   │   └── api.js (axios istekleri burada yapılır)
│   └── App.jsx, index.js, styles/
```

### Backend

```
backend/
│
├── models/
│   ├── User.js
│   ├── Post.js
│   └── Category.js
├── routes/
│   ├── auth.js
│   ├── posts.js
│   ├── categories.js
│   └── admin.js
├── controllers/
│   ├── authController.js
│   ├── postController.js
│   └── categoryController.js
├── middlewares/
│   ├── isAdmin.js
│   ├── csrfProtection.js
│   └── slugifyTitle.js
├── public/ (upload edilen resimler burada tutulur)
├── config/
│   └── db.js
├── app.js
└── server.js
```

## API Endpointleri

### Auth
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/logout` - Kullanıcı çıkışı
- `GET /api/auth/me` - Mevcut kullanıcı bilgilerini getir

### Posts
- `GET /api/posts` - Tüm yazıları getir
- `GET /api/posts/:id` - Tek bir yazı getir
- `GET /api/posts/slug/:slug` - Slug ile yazı getir
- `GET /api/posts/category/:categoryId` - Kategoriye göre yazıları getir
- `GET /api/posts/related/:id` - İlgili yazıları getir
- `POST /api/posts` - Yeni yazı oluştur (Admin)
- `PUT /api/posts/:id` - Yazı güncelle (Admin)
- `DELETE /api/posts/:id` - Yazı sil (Admin)

### Categories
- `GET /api/categories` - Tüm kategorileri getir
- `GET /api/categories/:id` - Tek bir kategori getir
- `GET /api/categories/slug/:slug` - Slug ile kategori getir
- `POST /api/categories` - Yeni kategori oluştur (Admin)
- `PUT /api/categories/:id` - Kategori güncelle (Admin)
- `DELETE /api/categories/:id` - Kategori sil (Admin)

### Gallery
- `GET /api/gallery` - Tüm galeri resimlerini getir
- `GET /api/gallery/:id` - Tek bir galeri resmi getir
- `POST /api/gallery` - Yeni galeri resmi ekle (Admin)
- `PUT /api/gallery/:id` - Galeri resmi güncelle (Admin)
- `DELETE /api/gallery/:id` - Galeri resmi sil (Admin)

### Admin
- `POST /api/admin/upload` - Resim yükle (Admin)
- `GET /api/admin/dashboard` - Dashboard istatistiklerini getir (Admin)

### Contact
- `POST /api/contact` - İletişim formu gönder

### Stats
- `GET /api/stats/visitors` - Ziyaretçi istatistiklerini getir
- `GET /api/stats/popular` - Popüler içerik istatistiklerini getir

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
