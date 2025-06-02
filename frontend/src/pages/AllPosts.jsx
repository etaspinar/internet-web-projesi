import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../services/api';
import {
  FaNewspaper,
  FaChevronRight,
  FaCalendarAlt,
  FaUser,
  FaEye,
  FaSpinner,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp
} from 'react-icons/fa';
import './Home.css';

const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);

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
    filterPosts(term, sortOrder);
  };

  // Sıralama işlevi
  const handleSort = (order) => {
    setSortOrder(order);
    filterPosts(searchTerm, order);
  };

  // Filtreleme ve sıralama işlevi
  const filterPosts = (term, order) => {
    let results = [...posts];
    
    // Arama filtrelemesi
    if (term.trim()) {
      results = results.filter(post => 
        post.title?.toLowerCase().includes(term.toLowerCase()) || 
        post.content?.toLowerCase().includes(term.toLowerCase()) ||
        post.summary?.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    // Sıralama
    results.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at || a.date || 0);
      const dateB = new Date(b.createdAt || b.created_at || b.date || 0);
      
      if (order === 'newest') {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });
    
    setFilteredPosts(results);
    setCurrentPage(1); // Filtreleme yapıldığında ilk sayfaya dön
  };

  // Sayfalama işlevi
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Veri çekme işlevi
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const postsResponse = await getPosts();
        
        // Yazıları işle
        let postsData = [];
        if (postsResponse?.data) {
          postsData = Array.isArray(postsResponse.data) ? postsResponse.data :
                      (Array.isArray(postsResponse.data.posts) ? postsResponse.data.posts :
                      (Array.isArray(postsResponse.data.data) ? postsResponse.data.data : []));
        } else if (Array.isArray(postsResponse)) {
          postsData = postsResponse;
        }
        
        // Tarihe göre sırala
        const sortedPosts = [...postsData].sort((a, b) => {
            const dateA = new Date(a.createdAt || a.created_at || a.date || 0);
            const dateB = new Date(b.createdAt || b.created_at || b.date || 0);
            return dateB - dateA;
        });

        setPosts(sortedPosts);
        setFilteredPosts(sortedPosts);

      } catch (err) {
        console.error('Veri yüklenirken hata:', err);
        setError('İçerik yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
  
  // Mevcut sayfadaki gönderiler
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  
  return (
    <div className="all-posts-page">
      <div className="container py-5">
        <div className="page-header mb-4">
          <h1 className="page-title">
            <FaNewspaper className="me-2" /> Tüm İçerikler
          </h1>
          <p className="text-muted">
            Sitemizde yayınlanan tüm içerikleri bu sayfada bulabilirsiniz.
          </p>
        </div>
        
        {/* Arama ve Filtreleme */}
        <div className="filters-container mb-4">
          <div className="row">
            <div className="col-md-8">
              <div className="search-bar">
                <div className="input-group">
                  <span className="input-group-text"><FaSearch /></span>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="İçeriklerde ara..." 
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
            <div className="col-md-4">
              <div className="sort-options d-flex justify-content-end">
                <div className="btn-group" role="group">
                  <button 
                    type="button" 
                    className={`btn ${sortOrder === 'newest' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleSort('newest')}
                  >
                    <FaSortAmountDown className="me-1" /> En Yeni
                  </button>
                  <button 
                    type="button" 
                    className={`btn ${sortOrder === 'oldest' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleSort('oldest')}
                  >
                    <FaSortAmountUp className="me-1" /> En Eski
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* İçerik Listesi */}
        <div className="posts-list">
          {currentPosts.length > 0 ? (
            <>
              {currentPosts.map((post) => (
                <div key={post._id || post.id} className="post-card">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="post-card-image">
                        <Link to={`/haber/${post.slug || generateSlug(post.title)}`}>
                          <img 
                            src={post.imageUrl || '/placeholder-image.jpg'} 
                            alt={post.title || 'İçerik'} 
                            className="img-fluid rounded" 
                          />
                        </Link>
                      </div>
                    </div>
                    <div className="col-md-8">
                      <div className="post-card-content">
                        <h3 className="post-card-title">
                          <Link to={`/haber/${post.slug || generateSlug(post.title)}`}>
                            {post.title || 'Başlık Yok'}
                          </Link>
                        </h3>
                        <p className="post-card-summary">
                          {post.summary || post.content?.substring(0, 150) + '...' || 'Özet yok.'}
                        </p>
                        <div className="post-card-meta">
                          <span><FaCalendarAlt /> {formatDate(post.createdAt || post.created_at || post.date)}</span>
                          {post.author && <span><FaUser /> {post.author.name || 'Yazar'}</span>}
                          {typeof post.views === 'number' && <span><FaEye /> {post.views} görüntülenme</span>}
                          {post.category && (
                            <span className="post-category">
                              <Link to={`/kategori/${post.category.slug || generateSlug(post.category.name)}`}>
                                {post.category.name}
                              </Link>
                            </span>
                          )}
                        </div>
                        <Link to={`/haber/${post.slug || generateSlug(post.title)}`} className="btn btn-sm btn-primary mt-2">
                          Devamını Oku <FaChevronRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Sayfalama */}
              {totalPages > 1 && (
                <nav className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Önceki
                      </button>
                    </li>
                    
                    {[...Array(totalPages).keys()].map(number => (
                      <li key={number + 1} className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => paginate(number + 1)}
                        >
                          {number + 1}
                        </button>
                      </li>
                    ))}
                    
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Sonraki
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          ) : (
            <div className="alert alert-info">
              {searchTerm ? `"${searchTerm}" ile ilgili sonuç bulunamadı.` : 'Henüz içerik bulunmuyor.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllPosts;
