import axios from 'axios';

// API temel URL
const API_URL = 'http://localhost:5001/api'; 

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true 
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API çağrısı yapılıyor: ${config.method.toUpperCase()} ${config.url}`);
    
    // localStorage içeriğini detaylı olarak göster
    const rawUserData = localStorage.getItem('user');
    console.log('localStorage\'da raw user verisi:', rawUserData);
    
    // JWT token'ı localStorage'dan al ve header'a ekle
    try {
      const user = rawUserData ? JSON.parse(rawUserData) : null;
      console.log('Parse edilmiş user verisi:', user);
      
      if (user && user.token) {
        // Token'ı doğrudan kullan
        config.headers['Authorization'] = `Bearer ${user.token}`;
        console.log('JWT token header\'a eklendi:', user.token.substring(0, 15) + '...');
        console.log('Token uzunluğu:', user.token.length);
        console.log('Kullanıcı bilgileri:', { id: user._id || user.id, name: user.name, role: user.role });
      } else if (user && user.user && user.user.token) {
        // Alternatif format: token user alt objesinde olabilir
        config.headers['Authorization'] = `Bearer ${user.user.token}`;
        console.log('JWT token (alternatif format) header\'a eklendi:', user.user.token.substring(0, 15) + '...');
        console.log('Token uzunluğu:', user.user.token.length);
        console.log('Kullanıcı bilgileri:', { id: user.user._id || user.user.id, name: user.user.name, role: user.user.role });
      } else {
        console.warn('localStorage\'da user veya token bulunamadı!');
        console.log('localStorage içeriği:', rawUserData);
      }
    } catch (error) {
      console.error('localStorage verisi parse edilirken hata:', error);
      console.log('Hatalı localStorage içeriği:', rawUserData);
    }
    
    // Sadece kategori ekleme işlemi için CSRF token'ı cookie'den al ve header'a ekle
    if (config.url && config.url.includes('/categories') && config.method === 'post') {
      console.log('Kategori ekleme işlemi tespit edildi, CSRF token kontrol ediliyor...');
      console.log('Tüm çerezler:', document.cookie);
      
      const tokenFromCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('_csrf='))
        ?.split('=')[1];
      
      console.log('Cookie\'den okunan CSRF token:', tokenFromCookie || 'BULUNAMADI');
        
      if (tokenFromCookie) {
        const csrfToken = decodeURIComponent(tokenFromCookie);
        console.log('Kategori ekleme için CSRF token kullanılıyor:', csrfToken);
        config.headers['X-CSRF-Token'] = csrfToken;
        config.headers['CSRF-Token'] = csrfToken;
        console.log('Kategori ekleme işlemi için CSRF token header\'a eklendi');
        console.log('Güncel headers:', JSON.stringify(config.headers));
      } else {
        console.warn('Kategori ekleme işlemi için CSRF token bulunamadı!');
        console.warn('Lütfen önce getCsrfToken() fonksiyonunu çağırın.');
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Yanıt interceptor'ı
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 hatası durumunda login sayfasına yönlendir
    //if (error.response && error.response.status === 401) {
    //  window.location.href = '/giris';
    //}
    
    return Promise.reject(error);
  }
);

// Kullanıcı kimlik doğrulama API fonksiyonları
export const login = (credentials) => {
  return api.post('/auth/login', credentials);
};

export const register = (userData) => {
  return api.post('/auth/register', userData);
};

// Yazı işlemleri için API fonksiyonları
export const getPosts = () => {
  return api.get('/posts');
};

export const getPost = (id) => {
  return api.get(`/posts/${id}`);
};

export const createPost = async (postData) => {
  try {
    console.log('API: Yazı oluşturma isteği gönderiliyor');
    const response = await api.post('/posts', postData, {
      headers: {
        'Content-Type': 'multipart/form-data', // FormData için gerekli
      }
    });
    console.log('API: Yazı başarıyla oluşturuldu', response.data);
    return response;
  } catch (error) {
    console.error('API: Yazı oluşturma hatası:', error.response || error);
    throw error; // Hata yakalama işlemi için hata tekrar fırlatılıyor
  }
};

export const updatePost = (id, postData) => {
  // Eğer postData bir FormData nesnesi ise
  if (postData instanceof FormData) {
    return api.put(`/posts/${id}`, postData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  // Normal JSON verisi ise
  return api.put(`/posts/${id}`, postData);
};

export const deletePost = (postId) => {
  return api.delete(`/posts/${postId}`);
};

// Kategori işlemleri için API fonksiyonları
export const getCategories = async () => {
  try {
    console.log('API: Kategoriler getiriliyor');
    const response = await api.get('/categories');
    
    // Kategori verilerini kontrol et ve düzenle
    if (response.data && response.data.data) {
      console.log(`API: ${response.data.data.length} kategori başarıyla getirildi`);
      return response;
    } else if (response.data) {
      // Kategori verisi doğrudan response.data içinde olabilir
      console.log('API: Kategoriler alternatif formatta getirildi');
      return { 
        data: { 
          success: true, 
          data: Array.isArray(response.data) ? response.data : [] 
        } 
      };
    } else {
      console.warn('API: Kategori verisi boş veya beklenmeyen formatta');
      return { data: { success: true, data: [] } }; // Boş dizi döndür
    }
  } catch (error) {
    console.error('API: Kategorileri getirirken hata:', error.response || error);
    // Hata durumunda boş bir dizi döndür
    return { data: { success: false, data: [], message: error.message } };
  }
};

export const getCategory = (id) => {
  return api.get(`/categories/${id}`);
};

export const createCategory = async (categoryData) => {
  console.log('Kategori oluşturma isteği gönderiliyor:', categoryData);
  
  // CSRF token'ı cookie'den al
  const tokenFromCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('_csrf='))
    ?.split('=')[1];
    
  if (!tokenFromCookie) {
    console.warn('CSRF token bulunamadı! Önce getCsrfToken() fonksiyonunu çağırın.');
    throw new Error('CSRF token bulunamadı. Lütfen sayfayı yenileyin.');
  }
  
  const csrfToken = decodeURIComponent(tokenFromCookie);
  console.log('Kategori ekleme için CSRF token kullanılıyor:', csrfToken);
  
  // Kategori ekleme işlemi için CSRF token'ı header'a ekle
  return api.post('/categories', categoryData, {
    headers: {
      'X-CSRF-Token': csrfToken,
      'CSRF-Token': csrfToken
    }
  });
};

export const updateCategory = (categoryId, data) => {
  return api.put(`/categories/${categoryId}`, data);
};

export const deleteCategory = (id) => {
  return api.delete(`/categories/${id}`);
};

// Medya işlemleri için API fonksiyonları
export const uploadMedia = (formData, token) => {
  console.log('uploadMedia fonksiyonu çağrıldı');
  console.log('Token:', token ? `${token.substring(0, 15)}...` : 'Bulunamadı');
  
  return api.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  });
};

export const getMedia = () => {
  return api.get('/media');
};

export const deleteMedia = (id) => {
  return api.delete(`/media/${id}`);
};

// --- YORUM FONKSİYONLARI ---
export const getComments = (postId) => api.get(`/comments/${postId}`);
export const addComment = (postId, content, token) =>
  api.post(`/comments/${postId}`, { content }, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Kullanıcı işlemleri için API fonksiyonları
export const createUser = (userData) => {
  return api.post('/users', userData);
};

export const updateUser = (id, userData) => {
  return api.put(`/users/${id}`, userData);
};

export const deleteUser = (id) => {
  return api.delete(`/users/${id}`);
};

export const logout = async () => {
  try {
    console.log('Çıkış yapılıyor...');
    
    // Backend'e çıkış bildirimi gönder
    const response = await api.post('/auth/logout');
    console.log('Çıkış yanıtı:', response.data);
    
    // localStorage'dan tüm kullanıcı verilerini temizle
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Eski format için kontrol
    console.log('Kullanıcı çıkış yaptı, localStorage temizlendi');
    console.log('Temizleme sonrası localStorage:', {
      user: localStorage.getItem('user'),
      token: localStorage.getItem('token')
    });
    
    return response;
  } catch (error) {
    console.error('Çıkış yaparken hata:', error);
    
    // Hata olsa bile localStorage'u temizle
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Eski format için kontrol
    console.log('Hata olmasına rağmen localStorage temizlendi');
    
    throw error;
  }
};

export const checkAuth = () => {
  return api.get('/auth/me');
};

// CSRF token almak için fonksiyon
export const getCsrfToken = async () => {
  try {
    console.log('CSRF token alınıyor...');
    console.log('Mevcut çerezler (istek öncesi):', document.cookie);
    
    // CSRF token'i al - bu işlem cookie'yi otomatik olarak ayarlayacak
    console.log(`CSRF token endpoint'ine istek yapılıyor: ${API_URL}/csrf-token`);
    const response = await axios.get(`${API_URL}/csrf-token`, { 
      withCredentials: true,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    console.log('CSRF token yanıtı:', response.data);
    console.log('CSRF token yanıt başlıkları:', response.headers);
    console.log('CSRF token yanıt durumu:', response.status);
    
    // Cookie'den token'i kontrol et
    console.log('Yanıt sonrası çerezler:', document.cookie);
    const cookies = document.cookie.split('; ');
    console.log('Ayrıştırılmış çerezler:', cookies);
    
    const csrfToken = cookies
      .find(row => row.startsWith('_csrf='))
      ?.split('=')[1];
    
    if (csrfToken) {
      const decodedToken = decodeURIComponent(csrfToken);
      console.log('Cookie\'de CSRF token bulundu (_csrf):', decodedToken);
      console.log('CSRF token uzunluğu:', decodedToken.length);
      return true;
    } else {
      console.warn('Cookie\'de CSRF token bulunamadı! Yanıt inceleniyor...');
      console.warn('Tüm yanıt:', response);
      return false;
    }
  } catch (error) {
    console.error('CSRF token alınırken hata:', error);
    throw error;
  }
};

// Yazı (Post) API ek fonksiyonları
export const getPostBySlug = (slug) => {
  return api.get(`/posts/slug/${slug}`);
};

export const getPostsByCategory = (categoryId) => {
  return api.get(`/posts/category/${categoryId}`);
};

export const getRelatedPosts = (postId, categoryId) => {
  return api.get(`/posts/related/${postId}?categoryId=${categoryId}`);
};

// Galeri API fonksiyonları
export const getGalleryImages = () => {
  return api.get('/gallery');
};

// Kullanıcıları çekmek için
export const getUsers = () => {
  return api.get('/users');
};

// İletişim API fonksiyonları
export const sendContactForm = (formData) => {
  return api.post('/contact', formData);
};

// Ziyaretçi istatistikleri API fonksiyonları
export const getVisitorStats = () => {
  // Doğrudan API'ye istek yap
  return new Promise((resolve) => {
    api.get('/stats/visitors')
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        console.error('Ziyaretçi istatistikleri alınırken hata:', error);
        // Hata durumunda varsayılan değerleri döndür
        resolve({
          data: {
            data: {
              monthlyVisitors: 0,
              onlineUsers: 0,
              totalVisitors: 0
            }
          }
        });
      });
  });
};

// Sitemap API fonksiyonu
export const getSitemap = () => {
  // API base URL'i kullanmadan doğrudan sitemap.xml'e eriş
  return axios.get('/sitemap.xml', {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
    headers: {
      'Accept': 'application/xml',
      'Cache-Control': 'no-cache'
    },
    responseType: 'text'
  });
};

// Kullanıcı kendi profilini getirir
export const getMyProfile = async () => {
  return api.get('/users/profile');
};

// Kullanıcı kendi profilini günceller
export const updateMyProfile = async (data) => {
  return api.put('/users/profile', data);
};

// Kullanıcı şifresini değiştirir
export const changeMyPassword = async (oldPassword, newPassword) => {
  return api.post('/users/change-password', { oldPassword, newPassword });
};

export default api;
