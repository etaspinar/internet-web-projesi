import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, getPosts } from '../services/api';

const Sitemap = () => {
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesResponse, postsResponse] = await Promise.all([
          getCategories(),
          getPosts()
        ]);

        setCategories(categoriesResponse.data.data || []);
        setPosts(postsResponse.data.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Site haritası verileri yüklenirken hata oluştu:', err);
        setError('Site haritası verileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="container py-5 text-center">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="container py-5 text-danger">{error}</div>;
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4">
        <i className="fa-solid fa-sitemap me-2 text-primary"></i> Site Haritası
      </h1>
      <ul className="list-unstyled">
        <li>
          <i className="fa-solid fa-house text-primary me-2"></i>
          <Link to="/">Ana Sayfa</Link>
        </li>
        <li>
          <li>
          <i className="fa-solid fa-tag text-primary me-2"></i>
          <Link to="/kategoriler">Kategoriler</Link>
        </li>
          <ul className="ms-4 list-unstyled">
            {categories.map((category) => (
              <li key={category._id}>
                <Link to={`/kategori/${category.slug || category._id}`}>
                  <i className="fa-solid fa-folder-open text-secondary me-2"></i>
                  {category.name}
                </Link>
                <ul className="ms-4 list-unstyled">
                  {posts.filter(post => String(post.category) === String(category._id)).map(post => (
                    <li key={post._id}>
                      <Link to={`/haber/${post.slug || post._id}`}>
                        <i className="fa-solid fa-file-lines text-muted me-2"></i>
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </li>
        <li>
          <i className="fa-solid fa-image text-primary me-2"></i>
          <Link to="/galeri">Galeri</Link>
        </li>
        <li>
          <i className="fa-solid fa-circle-info text-primary me-2"></i>
          <Link to="/hakkimizda">Hakkımızda</Link>
        </li>
        <li>
          <i className="fa-solid fa-envelope text-primary me-2"></i>
          <Link to="/iletisim">İletişim</Link>
        </li>
        <li>
          <i className="fa-solid fa-user text-primary me-2"></i> Kullanıcı İşlemleri
          <ul className="ms-4 list-unstyled">
            <li>
              <Link to="/giris">
                <i className="fa-solid fa-right-to-bracket text-secondary me-2"></i>
                Giriş
              </Link>
            </li>
            <li>
              <Link to="/kayit">
                <i className="fa-solid fa-user-plus text-secondary me-2"></i>
                Kayıt Ol
              </Link>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default Sitemap;
