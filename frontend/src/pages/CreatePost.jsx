import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost, getCategories } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    categoryId: '',
    category: '',
    image: null,
    isPublished: true
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
      return;
    }

    // Kategorileri yükle
    const fetchCategories = async () => {
      try {
        console.log('Kategoriler yükleniyor...');
        const response = await getCategories();
        console.log('Kategori API yanıtı:', response);
        
        // API yanıtının yapısını kontrol et ve her zaman bir dizi döndür
        let categoryData = [];
        
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            categoryData = response.data;
          } else if (typeof response.data === 'object') {
            if (Array.isArray(response.data.data)) {
              categoryData = response.data.data;
            } else if (Array.isArray(response.data.categories)) {
              categoryData = response.data.categories;
            }
          }
        } else if (Array.isArray(response)) {
          categoryData = response;
        }
        
        // Eğer veri hala boşsa, doğrudan API yanıtını kullan
        if (categoryData.length === 0 && response) {
          console.log('Alternatif veri yapısı deneniyor...');
          categoryData = response;
        }
        
        console.log('İşlenen kategoriler:', categoryData);
        
        if (Array.isArray(categoryData) && categoryData.length > 0) {
          setCategories(categoryData);
          console.log('Kategoriler başarıyla yüklendi:', categoryData);
        } else {
          console.error('Kategori verisi bulunamadı veya boş');
          setCategories([]);
          setError('Kategori verisi bulunamadı. Lütfen önce kategori ekleyin.');
        }
      } catch (err) {
        console.error('Kategoriler yüklenirken hata oluştu:', err);
        setError('Kategoriler yüklenirken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
        setCategories([]);
      }
    };

    fetchCategories();
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      if (files[0]) {
        setFormData({
          ...formData,
          [name]: files[0]
        });
        
        // Görsel önizleme
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(files[0]);
      }
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleEditorChange = (content) => {
    setFormData({
      ...formData,
      content
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    console.log('Form gönderiliyor, mevcut veriler:', formData);

    // Form verilerini kontrol et
    if (!formData.title.trim()) {
      setError('Başlık alanı zorunludur.');
      setLoading(false);
      return;
    }

    if (!formData.summary.trim()) {
      setError('Özet alanı zorunludur.');
      setLoading(false);
      return;
    }

    if (!formData.content.trim()) {
      setError('İçerik alanı zorunludur.');
      setLoading(false);
      return;
    }

    if (!formData.categoryId) {
      setError('Kategori seçimi zorunludur.');
      setLoading(false);
      return;
    }

    try {
      // FormData oluştur
      const postFormData = new FormData();
      postFormData.append('title', formData.title);
      postFormData.append('summary', formData.summary);
      postFormData.append('content', formData.content);
      
      // Kategori bilgisini doğru formatta gönder - sadece category alanını kullan
      postFormData.append('category', formData.categoryId);
      
      // isPublished boolean değerini string'e çevirerek gönder
      postFormData.append('isPublished', formData.isPublished ? 'true' : 'false');
      
      if (formData.image) {
        postFormData.append('image', formData.image);
      }

      console.log('Gönderilecek veriler:', {
        title: formData.title,
        summary: formData.summary.substring(0, 30) + '...',
        content: formData.content.substring(0, 30) + '...',
        category: formData.categoryId,
        isPublished: formData.isPublished,
        hasImage: !!formData.image
      });

      // API isteği gönder
      const response = await createPost(postFormData);
      console.log('API yanıtı:', response);
      
      // Başarılı mesajı göster
      setSuccess('Yazı başarıyla oluşturuldu!');
      
      // Form verilerini temizle
      setFormData({
        title: '',
        summary: '',
        content: '',
        categoryId: '',
        category: '',
        image: null,
        isPublished: true
      });
      setPreview(null);
      
      // Kısa bir süre sonra yazılar sayfasına yönlendir
      setTimeout(() => {
        navigate('/admin?tab=posts');
      }, 2000);
    } catch (err) {
      console.error('Yazı oluşturulurken hata:', err);
      console.error('Hata detayları:', err.response || err);
      
      // Hata mesajını göster
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Yazı oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ReactQuill için modüller
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card border-0 shadow-lg">
            <div className="card-header bg-primary text-white py-3">
              <h3 className="mb-0">
                <i className="fa-solid fa-plus-circle me-2"></i> Yeni Yazı Oluştur
              </h3>
            </div>
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="fa-solid fa-circle-exclamation me-2"></i> {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success" role="alert">
                  <i className="fa-solid fa-check-circle me-2"></i> {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="title" className="form-label">Başlık <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control mb-3"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                  
                  <label htmlFor="summary" className="form-label">Özet <span className="text-danger">*</span></label>
                  <textarea
                    className="form-control mb-3"
                    id="summary"
                    name="summary"
                    rows="3"
                    value={formData.summary}
                    onChange={handleChange}
                    required
                  ></textarea>
                  

                </div>

                <div className="mb-3">
                  <label htmlFor="categoryId" className="form-label">Kategori</label>
                  <select
                    className="form-select"
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Kategori seçin</option>
                    {Array.isArray(categories) && categories.length > 0 ? (
                      categories.map(category => (
                        <option 
                          key={category._id || `category-${category.name}`} 
                          value={category._id}
                        >
                          {category.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>Yükleniyor veya kategori bulunamadı</option>
                    )}
                  </select>
                  {categories.length === 0 && (
                    <div className="form-text text-danger">
                      <i className="fa-solid fa-circle-exclamation me-1"></i>
                      Kategori bulunamadı. Lütfen önce Admin Paneli &gt; Kategoriler bölümünden kategori ekleyin.
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="image" className="form-label">Kapak Görseli</label>
                  <input
                    type="file"
                    className="form-control"
                    id="image"
                    name="image"
                    onChange={handleChange}
                    accept="image/*"
                  />
                  {preview && (
                    <div className="mt-3">
                      <img 
                        src={preview} 
                        alt="Önizleme" 
                        className="img-thumbnail" 
                        style={{ maxHeight: '200px' }} 
                      />
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="content" className="form-label">İçerik <span className="text-danger">*</span></label>
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={handleEditorChange}
                    modules={modules}
                    placeholder="Yazı içeriğini girin..."
                    style={{ height: '300px', marginBottom: '50px' }}
                  />
                </div>

                <div className="mb-4 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="isPublished"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="isPublished">
                    Yazıyı Yayınla
                  </label>
                </div>

                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/admin?tab=posts')}
                    disabled={loading}
                  >
                    <i className="fa-solid fa-arrow-left me-2"></i> İptal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
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

export default CreatePost;
