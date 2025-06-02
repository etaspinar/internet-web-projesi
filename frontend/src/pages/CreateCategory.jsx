import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCategory, getCategories, deleteCategory } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaTrash, FaEdit, FaSpinner } from 'react-icons/fa';

const CreateCategory = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: ''
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    // Admin yetkisi kontrolü
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
      return;
    }
    
    // Kategorileri yükle
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await getCategories();
        // API yanıtından kategorileri çıkar
        const categoriesData = response.data?.data || response.data || [];
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        console.error('Kategoriler yüklenirken hata oluştu:', err);
        setError('Kategoriler yüklenirken bir hata oluştu.');
      } finally {
        setLoadingCategories(false);
      }
    };
    
    loadCategories();
  }, [currentUser, navigate]);
  
  const handleDeleteCategory = async (id) => {
    if (window.confirm('Bu kategoriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        await deleteCategory(id);
        // Kategoriyi listeden kaldır
        setCategories(categories.filter(cat => cat._id !== id));
        setSuccess('Kategori başarıyla silindi.');
      } catch (err) {
        console.error('Kategori silinirken hata oluştu:', err);
        setError(err.response?.data?.message || 'Kategori silinirken bir hata oluştu.');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Slug alanını otomatik olarak doldur
    if (name === 'name') {
      const slug = value
        .toLowerCase()
//        .replace(/[^a-z0-9\s-]/g, '') // İzin verilen karakterleri tut
        .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
        .replace(/-+/g, '-'); // Birden fazla tireyi tek tire yap
      
      setFormData({
        ...formData,
        [name]: value,
        slug
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Form verilerini kontrol et
    if (!formData.name.trim()) {
      setError('Kategori adı zorunludur.');
      setLoading(false);
      return;
    }

    try {
      // API isteği gönder
      const response = await createCategory(formData);
      
      // Yeni kategoriyi listeye ekle
      setCategories([response.data, ...categories]);
      
      // Başarılı mesajını göster
      setSuccess('Kategori başarıyla oluşturuldu!');
      
      // Form verilerini temizle
      setFormData({
        name: '',
        description: '',
        slug: ''
      });
      
      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Kategori oluşturulurken hata:', err);
      setError(err.response?.data?.message || 'Kategori oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row">
        {/* Mevcut Kategoriler */}
        <div className="col-lg-8 mb-4">
          <div className="card border-0 shadow-lg h-100">
            <div className="card-header bg-primary text-white py-3">
              <h3 className="mb-0">
                <i className="fa-solid fa-folder me-2"></i> Mevcut Kategoriler
              </h3>
            </div>
            <div className="card-body">
              {loadingCategories ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Yükleniyor...</span>
                  </div>
                  <p className="mt-2">Kategoriler yükleniyor...</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="alert alert-info mb-0">Henüz kategori bulunmamaktadır.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Kategori Adı</th>
                        <th>URL</th>
                        <th className="text-end">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category._id}>
                          <td className="align-middle">{category.name}</td>
                          <td className="align-middle">/{category.slug}</td>
                          <td className="text-end">
                            <button 
                              className="btn btn-sm btn-outline-danger me-2"
                              onClick={() => handleDeleteCategory(category._id)}
                              disabled={loading}
                            >
                              {loading ? (
                                <FaSpinner className="fa-spin" />
                              ) : (
                                <FaTrash />
                              )}
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => {}}
                              disabled={loading}
                            >
                              <FaEdit />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Yeni Kategori Ekle */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-lg">
            <div className="card-header bg-success text-white py-3">
              <h3 className="mb-0">
                <i className="fa-solid fa-folder-plus me-2"></i> Yeni Kategori Ekle
              </h3>
            </div>
            <div className="card-body p-4">
              {(error || success) && (
                <div className="mb-4">
                  {error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                      <i className="fa-solid fa-circle-exclamation me-2"></i> {error}
                      <button type="button" className="btn-close" onClick={() => setError('')}></button>
                    </div>
                  )}
                  {success && (
                    <div className="alert alert-success alert-dismissible fade show" role="alert">
                      <i className="fa-solid fa-check-circle me-2"></i> {success}
                      <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="form-label">Kategori Adı <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Kategori adını girin"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="slug" className="form-label">Slug</label>
                  <div className="input-group">
                    <span className="input-group-text">kategori/</span>
                    <input
                      type="text"
                      className="form-control"
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="otomatik-olusturulur"
                      aria-describedby="slugHelp"
                    />
                  </div>
                  <div id="slugHelp" className="form-text">
                    Slug, kategori adından otomatik oluşturulur. İsterseniz düzenleyebilirsiniz.
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="description" className="form-label">Açıklama</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Kategori açıklamasını girin"
                  ></textarea>
                </div>

                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/admin?tab=categories')}
                    disabled={loading}
                  >
                    <i className="fa-solid fa-arrow-left me-2"></i> İptal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-save me-2"></i> Kaydet
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCategory;
