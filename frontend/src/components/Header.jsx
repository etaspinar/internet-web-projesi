import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getCategories, logout as apiLogout } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  
  // Auth Context'ten kullanıcı bilgisini al
  const { currentUser, logout } = useAuth();
  
  // Scroll durumunu kontrol et
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Çıkış işlemi
  const handleLogout = () => {
    try {
      // Önce API isteği gönder
      apiLogout()
        .then(() => {
          console.log('Başarılı çıkış yapıldı');
        })
        .catch((error) => {
          console.error('Çıkış API isteği başarısız:', error);
        })
        .finally(() => {
          // Context üzerinden logout fonksiyonunu çağır
          logout();
          
          // Ana sayfaya yönlendir
          window.location.href = '/';
        });
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
      // Hata durumunda da context üzerinden logout çağır
      logout();
      window.location.href = '/';
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Önce yükleniyor durumunu ayarla
        setCategories([]);
        
        // API isteği gönder
        const response = await getCategories();
        console.log('Kategori API yanıtı:', response);
        
        // API yanıtını kontrol et ve uygun şekilde işle
        let categoriesData = [];
        
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            categoriesData = response.data;
          } else if (typeof response.data === 'object') {
            if (Array.isArray(response.data.categories)) {
              categoriesData = response.data.categories;
            } else if (Array.isArray(response.data.data)) {
              categoriesData = response.data.data;
            }
          }
        } else if (Array.isArray(response)) {
          categoriesData = response;
        }
        
        console.log('Header - İşlenen kategoriler:', categoriesData);
        
        // Eğer veri hala boşsa, doğrudan API yanıtını kullan
        if (categoriesData.length === 0 && response) {
          console.log('Alternatif veri yapısı deneniyor...');
          categoriesData = response;
        }
        
        // Verileri state'e kaydet
        setCategories(categoriesData);
      } catch (err) {
        console.error('Kategoriler yüklenirken hata oluştu:', err);
        // Hata durumunda boş dizi ayarla
        setCategories([]);
      }
    };

    // Sayfa yüklenirken kategorileri çek
    fetchCategories();

    // Scroll olayını dinle
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/arama?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <i className="fa-solid fa-microchip me-2"></i>
            Teknoloji Blogu
          </Link>
          
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <i className="fa-solid fa-bars"></i>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 d-flex flex-row">
              <li className="nav-item me-3">
                <NavLink className="nav-link px-3" to="/" end>
                  <i className="fa-solid fa-home me-1"></i> Anasayfa
                </NavLink>
              </li>
              
              <li className="nav-item dropdown me-3">
                <a
                  className="nav-link dropdown-toggle px-3"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="fa-solid fa-tags me-1"></i> Kategoriler
                </a>
                <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                  {!categories || categories.length === 0 ? (
                    <li><span className="dropdown-item"><i className="fa-solid fa-spinner fa-spin me-2"></i> Yükleniyor...</span></li>
                  ) : (
                    // Sadece son 5 kategoriyi göster
                    (Array.isArray(categories) ? categories.slice(0, 5) : []).map(category => (
                      <li key={category._id || `category-${category.name}`}>
                        <NavLink className="dropdown-item" to={`/kategori/${category.slug || category.name?.toLowerCase().replace(/\s+/g, '-')}`}>
                          <i className="fa-solid fa-angle-right me-2"></i> {category.name}
                        </NavLink>
                      </li>
                    ))
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <NavLink className="dropdown-item" to="/kategoriler">
                      <i className="fa-solid fa-list me-2"></i> Tüm Kategoriler
                    </NavLink>
                  </li>
                </ul>
              </li>
              
              <li className="nav-item me-3">
                <NavLink className="nav-link px-3" to="/galeri">
                  <i className="fa-solid fa-images me-1"></i> Galeri
                </NavLink>
              </li>
            </ul>
            
            <div className="d-flex align-items-center">
              <form className="search-form d-flex me-3" onSubmit={handleSearch}>
                <div className="input-group">
                  <input
                    className="form-control"
                    type="search"
                    placeholder="İçerik ara..."
                    aria-label="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn btn-primary" type="submit">
                    <i className="fa-solid fa-search"></i>
                  </button>
                </div>
              </form>
              
              {currentUser ? (
                <div className="dropdown">
                  <button
                    className="btn btn-primary dropdown-toggle d-flex align-items-center"
                    type="button"
                    id="profileDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fa-solid fa-user-circle me-2"></i>
                    <span className="d-none d-md-inline">{currentUser.name}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                    <li>
                      <Link className="dropdown-item" to="/profil">
                        <i className="fa-solid fa-user me-2"></i> Profilim
                      </Link>
                    </li>
                    {currentUser.role === 'admin' && (
                      <li>
                        <Link className="dropdown-item" to="/admin">
                          <i className="fa-solid fa-cogs me-2"></i> Admin Paneli
                        </Link>
                      </li>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        <i className="fa-solid fa-sign-out-alt me-2"></i> Çıkış Yap
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="auth-buttons d-flex">
                  <Link to="/giris" className="btn btn-outline-primary me-2">
                    <i className="fa-solid fa-sign-in-alt me-1"></i> Giriş
                  </Link>
                  <Link to="/kayit" className="btn btn-primary">
                    <i className="fa-solid fa-user-plus me-1"></i> Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
