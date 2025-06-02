const csurf = require('csurf');

// CSRF koruma middleware'i
// Basit bir CSRF koruma middleware'i oluştur
const simpleCSRFProtection = (req, res, next) => {
  console.log('Basit CSRF koruma çalışıyor...');
  console.log('Request headers:', req.headers);
  console.log('Request cookies:', req.cookies);
  
  // CSRF token'ı header'dan al
  const headerToken = 
    req.headers['x-csrf-token'] || 
    req.headers['csrf-token'];
  
  // CSRF token'ı cookie'den al
  const cookieToken = req.cookies['_csrf'];
  
  console.log('Header token:', headerToken);
  console.log('Cookie token:', cookieToken);
  
  // Sadece kategori ekleme işlemi için CSRF koruması uygula
  if (req.path === '/api/categories' && req.method === 'POST') {
    // Cookie'deki token ile header'daki token'ı karşılaştır
    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
      return res.status(403).json({
        success: false,
        message: 'CSRF token geçersiz veya eksik',
        error: 'EBADCSRFTOKEN'
      });
    }
  }
  
  // Diğer tüm istekler için token doğrulamasını atla
  next();
};

// Orijinal csurf middleware'i (şu an kullanılmıyor)
const csrfProtection = csurf({
  cookie: {
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
    path: '/',
    key: '_csrf'
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
});

// CSRF hata işleyici
const csrfErrorHandler = (err, req, res, next) => {
  console.error('CSRF hata işleyici çağrıldı:', err);
  
  if (err.code === 'EBADCSRFTOKEN') {
    console.error('CSRF token geçersiz!');
    console.error('Request headers:', req.headers);
    console.error('Request cookies:', req.cookies);
    console.error('Request body:', req.body);
    
    return res.status(403).json({
      success: false,
      message: 'CSRF token geçersiz',
      error: err.message,
      headers: req.headers['x-csrf-token'] || req.headers['x-xsrf-token']
    });
  }
  
  next(err);
};

module.exports = {
  csrfProtection: simpleCSRFProtection, // Basit CSRF koruma kullan
  csrfErrorHandler
};
