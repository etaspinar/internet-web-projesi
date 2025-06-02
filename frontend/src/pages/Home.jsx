import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getPosts, getCategories, getGalleryImages } from '../services/api';
import {
  FaNewspaper,
  FaTags,
  FaChevronRight,
  FaCalendarAlt,
  FaUser,
  FaEye,
  FaBookOpen,
  FaSpinner,
  FaExclamationTriangle,
  FaImage,
  FaSearch,
  FaArrowUp
} from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);

  // Referanslar
  const heroSectionRef = useRef(null);
  const contentSectionRef = useRef(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'Tarih Bilinmiyor';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('tr-TR', options);
    } catch (e) {
      console.error("Geçersiz tarih formatı:", dateString, e);
      return 'Geçersiz Tarih';
    }
  };

  const generateSlug = (title) => {
    if (!title) return 'varsayilan-slug';
    return title
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]+/g, '');
  };

  // Arama işlevi
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredPosts([]);
      return;
    }

    const results = [...(featuredPost ? [featuredPost] : []), ...posts].filter(post =>
      post.title?.toLowerCase().includes(term.toLowerCase()) ||
      post.content?.toLowerCase().includes(term.toLowerCase()) ||
      post.summary?.toLowerCase().includes(term.toLowerCase())
    );

    setFilteredPosts(results);
  };

  // Sayfa kaydırma işlevleri
  useEffect(() => {
    const handleScroll = () => {
      // Yukarı kaydırma butonunu göster/gizle
      setShowScrollTop(window.scrollY > 300);

      // Hero bölümü animasyonu için
      if (heroSectionRef.current) {
        const scrollPosition = window.scrollY;
        const opacity = Math.max(0, 1 - scrollPosition / 500);
        heroSectionRef.current.style.opacity = opacity;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Yukarı kaydırma işlevi
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // İçerik bölümüne kaydırma işlevi
  const scrollToContent = () => {
    if (contentSectionRef.current) {
      contentSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Veri çekme işlevi
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Tüm verileri paralel olarak çek
        const [postsResponse, categoriesResponse, galleryResponse] = await Promise.all([
          getPosts(),
          getCategories(),
          getGalleryImages()
        ]);

        // Yazıları işle
        let postsData = [];
        if (postsResponse?.data) {
          postsData = Array.isArray(postsResponse.data) ? postsResponse.data :
            (Array.isArray(postsResponse.data.posts) ? postsResponse.data.posts :
              (Array.isArray(postsResponse.data.data) ? postsResponse.data.data : []));
        } else if (Array.isArray(postsResponse)) {
          postsData = postsResponse;
        }

        // Resimleri kontrol et ve ekle
        postsData = postsData.map(post => {
          // Eğer post'un resmi yoksa ve galeri resimleri varsa, rastgele bir resim ata
          if (!post.imageUrl && galleryResponse?.data?.length > 0) {
            const randomIndex = Math.floor(Math.random() * galleryResponse.data.length);
            const randomImage = galleryResponse.data[randomIndex];
            return {
              ...post,
              imageUrl: randomImage.url || randomImage.path || `/uploads/${randomImage.filename}`
            };
          }
          return post;
        });

        // Tarihe göre sırala
        const sortedPosts = [...postsData].sort((a, b) => {
          const dateA = new Date(a.createdAt || a.created_at || a.date || 0);
          const dateB = new Date(b.createdAt || b.created_at || b.date || 0);
          return dateB - dateA;
        });

        if (sortedPosts.length > 0) {
          setFeaturedPost(sortedPosts[0]);
          setPosts(sortedPosts.slice(1));
        } else {
          setPosts([]);
          setFeaturedPost(null);
        }

        // Kategorileri işle
        let categoriesData = [];
        if (categoriesResponse?.data) {
          categoriesData = Array.isArray(categoriesResponse.data) ? categoriesResponse.data :
            (Array.isArray(categoriesResponse.data.categories) ? categoriesResponse.data.categories :
              (Array.isArray(categoriesResponse.data.data) ? categoriesResponse.data.data : []));
        } else if (Array.isArray(categoriesResponse)) {
          categoriesData = categoriesResponse;
        }

        if (categoriesData.length === 0) {
          categoriesData = [
            { _id: 'default-1', name: 'Teknoloji', slug: 'teknoloji' },
            { _id: 'default-2', name: 'Yazılım', slug: 'yazilim' },
            { _id: 'default-3', name: 'Oyun', slug: 'oyun' },
            { _id: 'default-4', name: 'Bilim', slug: 'bilim' },
          ];
        }
        setCategories(categoriesData);

        // Galeri resimlerini işle
        let galleryData = [];
        if (galleryResponse?.data) {
          galleryData = Array.isArray(galleryResponse.data) ? galleryResponse.data :
            (Array.isArray(galleryResponse.data.images) ? galleryResponse.data.images :
              (Array.isArray(galleryResponse.data.data) ? galleryResponse.data.data : []));
        } else if (Array.isArray(galleryResponse)) {
          galleryData = galleryResponse;
        }

        setGalleryImages(galleryData);

        // Sayfa yüklendiğinde animasyon efekti
        if (heroSectionRef.current) {
          heroSectionRef.current.classList.add('fade-in');
        }

      } catch (err) {
        console.error('Veri yüklenirken hata:', err);
        setError('İçerik yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Sayfa yüklendiğinde kullanıcıyı karşılama animasyonu
    const timer = setTimeout(() => {
      if (document.querySelector('.home-page')) {
        document.querySelector('.home-page').classList.add('loaded');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner-icon" />
        <p>İçerik yükleniyor, lütfen bekleyin...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="error-container text-center">
          <FaExclamationTriangle className="error-icon mb-3" />
          <h4>Bir Hata Oluştu</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Sayfayı Yenile
          </button>
        </div>
      </div>
    );
  }

  // Arama sonuçlarını gösterme durumu
  const displayPosts = searchTerm ? filteredPosts : posts;

  return (
    <div className="home-page">
      {/* Öne Çıkan Yazı */}
      {featuredPost && (
        <section
          ref={heroSectionRef}
          className="featured-post-section"
          style={{ backgroundImage: `url(${
            // Görsel yolunu kontrol et ve doğru şekilde işle
            featuredPost.image ? (
              featuredPost.image.startsWith('/') 
                ? `http://localhost:5001${featuredPost.image}` 
                : featuredPost.image
            ) : (
              featuredPost.imageUrl ? (
                featuredPost.imageUrl.startsWith('/') 
                  ? `http://localhost:5001${featuredPost.imageUrl}` 
                  : featuredPost.imageUrl
              ) : '/placeholder-hero.jpg'
            )
          })` }}
        >
          <div className="featured-post-overlay"></div>
          <div className="container">
            <div className="featured-post-content">
              <Link
                to={`/kategori/${featuredPost.category?.slug || generateSlug(featuredPost.category?.name || 'genel')}`}
                className="featured-post-category-badge"
              >
                {featuredPost.category?.name || 'Genel'}
              </Link>
              <h1 className="featured-post-title">
                <Link to={`/haber/${featuredPost.slug || generateSlug(featuredPost.title)}`}>
                  {featuredPost.title || 'Başlık Mevcut Değil'}
                </Link>
              </h1>
              <p className="featured-post-summary">
                {featuredPost.summary || featuredPost.content?.substring(0, 180) + '...' || 'Özet bulunmuyor.'}
              </p>
              <div className="featured-post-meta">
                <span><FaCalendarAlt /> {formatDate(featuredPost.createdAt || featuredPost.created_at || featuredPost.date)}</span>
                {featuredPost.author && <span><FaUser /> {featuredPost.author.name || 'Yazar'}</span>}
              </div>
              <div className="featured-post-actions">
                <Link to={`/haber/${featuredPost.slug || generateSlug(featuredPost.title)}`} className="btn btn-light btn-lg featured-post-button">
                  Haberi Oku <FaChevronRight className="ms-1" />
                </Link>
                <button onClick={scrollToContent} className="btn btn-outline-light ms-3 scroll-down-btn">
                  Diğer Haberler
                </button>
              </div>
            </div>
          </div>
          <div className="scroll-indicator" onClick={scrollToContent}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </section>
      )}

      {/* Arama Çubuğu */}
      <div className="search-container">
        <div className="container">
          <div className="search-bar">
            <div className="input-group">
              <span className="input-group-text"><FaSearch /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Haberlerde ara..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => handleSearch('')}
                >
                  Temizle
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ana İçerik Alanı */}
      <div ref={contentSectionRef} className="container main-content py-5">
        {/* Arama Sonuçları */}
        {searchTerm && (
          <div className="search-results mb-4">
            <h2 className="section-title">
              <FaSearch className="me-2" /> "{searchTerm}" için Arama Sonuçları
            </h2>
            {filteredPosts.length > 0 ? (
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {filteredPosts.map((post) => (
                  <div key={post._id || post.id} className="col">
                    <div className="card h-100 search-result-card">
                      {post.imageUrl && (
                        <img src={post.imageUrl} className="card-img-top" alt={post.title || 'Haber'} />
                      )}
                      <div className="card-body">
                        <h5 className="card-title">
                          <Link to={`/haber/${post.slug || generateSlug(post.title)}`}>
                            {post.title || 'Başlık Yok'}
                          </Link>
                        </h5>
                        <p className="card-text">
                          {post.summary || post.content?.substring(0, 100) + '...' || 'Özet yok.'}
                        </p>
                      </div>
                      <div className="card-footer">
                        <small className="text-muted">
                          <FaCalendarAlt className="me-1" /> {formatDate(post.createdAt || post.created_at || post.date)}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-info">
                "{searchTerm}" ile ilgili sonuç bulunamadı.
              </div>
            )}
          </div>
        )}

        <div className="row">
          {/* Son Haberler */}
          <div className="col-lg-8">
            <section className="latest-news">
              <h2 className="section-title">
                <FaNewspaper className="me-2" /> Son Eklenen İçerikler
              </h2>
              {displayPosts.length > 0 ? (
                displayPosts.map((post) => (
                  <div key={post._id || post.id} className="post-card-minimal">
                    <div className="post-card-minimal-image">
                      <Link to={`/haber/${post.slug || generateSlug(post.title)}`}>
                        <img 
                          src={
                            // Görsel yolunu kontrol et ve doğru şekilde işle
                            post.image ? (
                              post.image.startsWith('/') 
                                ? `http://localhost:5001${post.image}` 
                                : post.image
                            ) : (
                              post.imageUrl ? (
                                post.imageUrl.startsWith('/') 
                                  ? `http://localhost:5001${post.imageUrl}` 
                                  : post.imageUrl
                              ) : '/placeholder-image.jpg'
                            )
                          }
                          className="card-img-top"
                          alt={post.title || 'Haber Resmi'}
                          style={{
                            width: '100%',
                            height: '300px',
                            objectFit: 'contain',
                            objectPosition: 'center top'
                          }}
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-image.jpg';
                          }} />
                      </Link>
                    </div>
                    <div className="post-card-minimal-content">
                      <h3 className="post-card-minimal-title">
                        <Link to={`/haber/${post.slug || generateSlug(post.title)}`}>
                          {post.title || 'Başlık Yok'}
                        </Link>
                      </h3>
                      <p className="post-card-minimal-summary">
                        {post.summary || post.content?.substring(0, 120) + '...' || 'Özet yok.'}
                      </p>
                      <div className="post-card-minimal-meta">
                        <span><FaCalendarAlt /> {formatDate(post.createdAt || post.created_at || post.date)}</span>
                        {post.author && <span><FaUser /> {post.author.name || 'Yazar'}</span>}
                        {typeof post.views === 'number' && <span><FaEye /> {post.views}</span>}
                      </div>
                      <Link to={`/haber/${post.slug || generateSlug(post.title)}`} className="post-card-minimal-readmore">
                        Devamını Oku <FaChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">Şu anda gösterilecek yeni içerik bulunmuyor.</p>
              )}

              <div className="text-center mt-4">
                <Link to="/tum-icerikler" className="btn btn-primary">
                  Tüm İçerikleri Göster <FaChevronRight className="ms-1" />
                </Link>
              </div>
            </section>

            {/* Galeri Bölümü */}
            {galleryImages.length > 0 && (
              <section className="gallery-section mt-5">
                <h2 className="section-title">
                  <FaImage className="me-2" /> Galeri
                </h2>
                <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3 gallery-grid">
                  {galleryImages.slice(0, 8).map((image, index) => (
                    <div key={image._id || `gallery-${index}`} className="col">
                      <div className="gallery-item">
                        <img
                          src={image.url && image.url.startsWith('/') ? `http://localhost:5001${image.url}` : image.url}
                          alt={image.alt || image.title || `Galeri Resmi ${index + 1}`}
                          className="img-fluid"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-4">
                  <Link to="/galeri" className="btn btn-outline-primary">
                    Tüm Galeriyi Gör <FaChevronRight className="ms-1" />
                  </Link>
                </div>
              </section>
            )}
          </div>

          {/* Kenar Çubuğu */}
          <div className="col-lg-4">
            {/* Kategoriler */}
            <aside className="sidebar mb-4">
              <h2 className="section-title">
                <FaTags className="me-2" /> Kategoriler
              </h2>
              {categories.length > 0 ? (
                <ul className="category-list">
                  {categories.map((category) => (
                    <li key={category._id || category.id}>
                      <Link to={`/kategori/${category.slug || generateSlug(category.name)}`}>
                        <span>{category.name || 'Kategori Adı Yok'}</span>
                        <FaChevronRight size={14} />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">Kategori bulunamadı.</p>
              )}
            </aside>

            {/* Öne Çıkan İçerik */}
            {featuredPost && (
              <aside className="sidebar featured-sidebar">
                <h2 className="section-title">
                  <FaBookOpen className="me-2" /> Öne Çıkan
                </h2>
                <div className="featured-sidebar-content">
                  {featuredPost.imageUrl && (
                    <img
                      src={featuredPost.imageUrl}
                      alt={featuredPost.title || 'Öne Çıkan'}
                      className="img-fluid featured-sidebar-img mb-3"
                    />
                  )}
                  <h3 className="featured-sidebar-title">
                    <Link to={`/haber/${featuredPost.slug || generateSlug(featuredPost.title)}`}>
                      {featuredPost.title}
                    </Link>
                  </h3>
                  <p className="featured-sidebar-summary">
                    {featuredPost.summary || featuredPost.content?.substring(0, 100) + '...'}
                  </p>
                  <Link to={`/haber/${featuredPost.slug || generateSlug(featuredPost.title)}`} className="btn btn-sm btn-primary">
                    Devamını Oku
                  </Link>
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>

      {/* Yukarı Kaydırma Butonu */}
      {showScrollTop && (
        <button className="scroll-top-btn" onClick={scrollToTop}>
          <FaArrowUp />
        </button>
      )}
    </div>
  );
};

export default Home;