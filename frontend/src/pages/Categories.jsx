import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { getCategories, getPostsByCategory } from '../services/api';

const Categories = () => {
  const { categorySlug } = useParams();
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await getCategories();
        console.log('Kategoriler API yanıtı:', response);
        
        // API yanıtının yapısını kontrol et
        let categoriesData = [];
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            categoriesData = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            categoriesData = response.data.data;
          } else if (response.data.success && Array.isArray(response.data.data)) {
            categoriesData = response.data.data;
          }
        }
        
        console.log('Kategoriler:', categoriesData);
        setCategories(categoriesData);
        
        // URL'den kategori slug'ı varsa, o kategoriyi aktif olarak ayarla
        if (categorySlug && categoriesData.length > 0) {
          const category = categoriesData.find(cat => cat.slug === categorySlug);
          if (category) {
            setActiveCategory(category);
          } else {
            // Eğer slug ile kategori bulunamazsa, ilk kategoriyi seç
            setActiveCategory(categoriesData[0]);
          }
        } else if (categoriesData.length > 0) {
          // Eğer URL'de kategori yoksa, ilk kategoriyi seç
          setActiveCategory(categoriesData[0]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Kategori yükleme hatası:', err);
        setError('Kategoriler yüklenirken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
        setLoading(false);
      }
    };

    fetchCategories();
  }, [categorySlug]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (activeCategory) {
        try {
          setLoading(true);
          console.log('Kategori ID ile yazıları getirme:', activeCategory._id);
          const response = await getPostsByCategory(activeCategory._id);
          console.log('Yazılar API yanıtı:', response);
          
          // API yanıtının yapısını kontrol et
          let postsData = [];
          if (response && response.data) {
            if (Array.isArray(response.data)) {
              postsData = response.data;
            } else if (response.data.data && Array.isArray(response.data.data)) {
              postsData = response.data.data;
            } else if (response.data.success && Array.isArray(response.data.data)) {
              postsData = response.data.data;
            }
          }
          
          console.log('Kategorideki yazılar:', postsData);
          setPosts(postsData);
          
          // Yükleme durumunu kısa tutmak için setTimeout kullanma
          setTimeout(() => {
            setLoading(false);
          }, 300); // Sadece 300ms göster
        } catch (err) {
          console.error('Yazı yükleme hatası:', err);
          setError('Haberler yüklenirken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
          setLoading(false);
        }
      } else {
        setPosts([]);
        setLoading(false);
      }
    };

    fetchPosts();
  }, [activeCategory]);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
  };

  if (loading && !categories.length) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <h1 className="mb-4">Kategoriler</h1>
      
      <div className="row">
        <div className="col-md-3">
          <div className="list-group mb-4">
            {categories.map(category => (
              <button
                key={category._id}
                className={`list-group-item list-group-item-action ${activeCategory && activeCategory._id === category._id ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="col-md-9">
          {activeCategory ? (
            <>
              <h2>{activeCategory.name}</h2>
              <p>{activeCategory.description}</p>
              
              {loading ? (
                <div className="text-center my-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Yükleniyor...</span>
                  </div>
                </div>
              ) : posts.length > 0 ? (
                <div className="row row-cols-1 row-cols-md-2 g-4 mt-3">
                  {posts.map(post => (
                    <div className="col" key={post._id}>
                      <PostCard post={post} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-warning mt-3 p-4 shadow-sm">
                  <div className="d-flex align-items-center">
                    <i className="fa-solid fa-exclamation-circle me-3 fs-3 text-warning"></i>
                    <div>
                      <h5 className="mb-1">Bu kategoride henüz içerik yok!</h5>
                      <p className="mb-0">Bu kategoriye ait haberler yakında eklenecektir.</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="alert alert-info">
              Lütfen bir kategori seçin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;

