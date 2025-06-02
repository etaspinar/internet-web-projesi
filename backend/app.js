const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { csrfProtection, csrfErrorHandler } = require('./middlewares/csrfProtection');
const path = require('path');
require('dotenv').config();

// Express uygulaması oluştur
const app = express();

// Middleware'ler
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS ayarları
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Session ayarları
app.use(session({
  secret: process.env.SESSION_SECRET || 'teknoloji-blogu-gizli-anahtar',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 1 gün
  }
}));

// Statik dosyalar için public klasörü
app.use(express.static(path.join(__dirname, 'public')));

// Uploads klasörü için statik dosya sunucusu
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CSRF token endpoint'i
app.get('/api/csrf-token', (req, res) => {
  // Daha güvenli bir token oluştur (crypto kütüphanesi ile)
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  console.log('CSRF token oluşturuldu:', token);
  
  // Token'i cookie olarak ayarla - _csrf adıyla
  res.cookie('_csrf', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  
  res.json({ 
    success: true,
    message: 'CSRF token oluşturuldu'
  });
});

// CSRF hata işleyicisi kaldırıldı

// Route'lar
const categoriesRouter = require('./routes/categories');
const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');

app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/categories', categoriesRouter);
app.use('/api/users', usersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/media', require('./routes/media'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/stats', require('./routes/stats'));

// Sitemap.xml
app.get('/sitemap.xml', require('./controllers/sitemapController').generateSitemap);

// 404 - Sayfa Bulunamadı
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Sayfa bulunamadı'
  });
});

// Hata işleyici
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(500).json({
    success: false,
    message: 'Sunucu hatası',
    error: err.message
  });
});

module.exports = app;
