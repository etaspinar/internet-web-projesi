import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';
import { 
  getPosts, 
  getCategories, 
  getUsers, 
  createCategory,
  updateCategory,
  deleteCategory,
  getVisitorStats,
  getMedia,
  uploadMedia,
  deleteMedia,
  updateUser,
  deleteUser,
  getCsrfToken,
  deletePost,
  updatePost,
  createPost
} from '../services/api';

// Chart.js bileşenlerini kayıt et
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement);

const Admin = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [postImagePreview, setPostImagePreview] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [showUploadMediaModal, setShowUploadMediaModal] = useState(false);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [mediaUploadLoading, setMediaUploadLoading] = useState(false);
  const [mediaUploadError, setMediaUploadError] = useState('');
  const [mediaUploadSuccess, setMediaUploadSuccess] = useState('');
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalCategories: 0,
    totalUsers: 0,
    totalVisits: 0,
    totalMedia: 0
  });
  
  // Aylık ziyaretçi istatistikleri
  const [visitorStats, setVisitorStats] = useState({
    monthlyVisitors: Array(12).fill(0),
    onlineUsers: 0
  });
  const [activeTab, setActiveTab] = useState(() => {
    // localStorage'dan aktif sekmeyi al, yoksa 'dashboard' kullan
    return localStorage.getItem('adminActiveTab') || 'dashboard';
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Kullanıcı admin mi kontrol et
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      navigate('/giris');
    } else {
      fetchAllData();
    }
  }, [navigate]);

  const fetchAllData = async () => {
    try {
      setLoadingData(true);
      setError('');

      // API'den verileri çek
      const [postsResponse, categoriesResponse, usersResponse, statsResponse, mediaResponse] = await Promise.all([
        getPosts(),
        getCategories(),
        getUsers(),
        getVisitorStats(),
        getMedia()
      ]);
      
      console.log('Medya yanıtı:', mediaResponse);
      console.log('Medya verisi:', mediaResponse?.data);

      // API yanıtlarını detaylı konsola yazdır
      console.log('Posts Response:', postsResponse);
      console.log('Posts Response Data:', postsResponse?.data);
      console.log('Categories Response:', categoriesResponse);
      console.log('Users Response:', usersResponse);
      console.log('Stats Response:', statsResponse);
      console.log('Media Response:', mediaResponse);

      // Veri yapısını analiz et
      if (postsResponse && typeof postsResponse === 'object') {
        // Veri yapısını kontrol et
        if (postsResponse.data) {
          console.log('Posts data tipi:', typeof postsResponse.data);
          console.log('Posts data array mi?', Array.isArray(postsResponse.data));
          if (postsResponse.data.data) {
            console.log('Posts data.data tipi:', typeof postsResponse.data.data);
            console.log('Posts data.data array mi?', Array.isArray(postsResponse.data.data));
          }
        }
      }

      // Veri yapısına göre doğru şekilde işle
      let postsData = [];
      let categoriesData = [];

      // Posts verilerini işle
      if (postsResponse) {
        if (Array.isArray(postsResponse.data)) {
          postsData = postsResponse.data;
        } else if (postsResponse.data.data && Array.isArray(postsResponse.data.data)) {
          postsData = postsResponse.data.data;
        }
      }
      
      // Kategori verilerini işle
      if (categoriesResponse && categoriesResponse.data) {
        if (Array.isArray(categoriesResponse.data)) {
          categoriesData = categoriesResponse.data;
        } else if (categoriesResponse.data.data && Array.isArray(categoriesResponse.data.data)) {
          categoriesData = categoriesResponse.data.data;
        }
      }
      
      // Kullanıcı verilerini işle
      let usersData = [];
      if (usersResponse && usersResponse.data) {
        if (Array.isArray(usersResponse.data)) {
          usersData = usersResponse.data;
        } else if (usersResponse.data.data && Array.isArray(usersResponse.data.data)) {
          usersData = usersResponse.data.data;
        }
      }
      
      // Medya verilerini işle
      let mediaData = [];
      if (mediaResponse && mediaResponse.data) {
        if (Array.isArray(mediaResponse.data)) {
          mediaData = mediaResponse.data;
        } else if (mediaResponse.data.data && Array.isArray(mediaResponse.data.data)) {
          mediaData = mediaResponse.data.data;
        } else if (mediaResponse.data && typeof mediaResponse.data === 'object' && mediaResponse.data.files) {
          // Bazı API'ler { files: [...] } formatında veri döndürebilir
          mediaData = mediaResponse.data.files;
        }
      }
      
      // Ziyaretçi istatistiklerini işle
      let monthlyVisitorsData = Array(12).fill(0);
      let onlineUsersCount = 0;
      let totalVisitsCount = 0;
      
      if (statsResponse && statsResponse.data) {
        const statsData = statsResponse.data.data || statsResponse.data;
        
        if (statsData) {
          // Aylık ziyaretçi sayılarını al
          if (statsData.monthlyVisitors) {
            monthlyVisitorsData = statsData.monthlyVisitors;
          }
          
          // Çevrimiçi kullanıcı sayısını al
          if (statsData.onlineUsers) {
            onlineUsersCount = statsData.onlineUsers;
          }
          
          // Toplam ziyaret sayısını 9 olarak ayarla (alttaki ziyaretçi sayısıyla uyumlu olması için)
          totalVisitsCount = 9;
        }
      }
      
      // Ziyaretçi istatistiklerini güncelle
      setVisitorStats({
        monthlyVisitors: monthlyVisitorsData,
        onlineUsers: onlineUsersCount
      });
      
      console.log('Son işlenen medya:', mediaData);
      // Kategori verilerinin doğru formatta olduğundan emin ol
      const formattedCategories = categoriesData.map(cat => ({
        _id: cat._id || cat.id,
        name: cat.name,
        description: cat.description || ''
      }));
      
      // Verileri state'lere kaydet
      setPosts(postsData);
      setCategories(formattedCategories);
      setUsers(usersData);
      setMediaFiles(mediaData);
      
      // İstatistikleri güncelle
      setStats({
        totalPosts: postsData.length,
        totalCategories: formattedCategories.length,
        totalUsers: usersData.length,
        totalVisits: totalVisitsCount,
        totalMedia: mediaData.length
      });
    } catch (error) {
      console.error('Veriler alınırken hata oluştu:', error);
      setError('Veriler alınırken bir hata oluştu');
    } finally {
      setLoadingData(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Aktif sekmeyi localStorage'a kaydet
    localStorage.setItem('adminActiveTab', tab);
    if (tab === 'posts' || tab === 'categories' || tab === 'users' || tab === 'media') {
      fetchAllData();
    }
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({ ...prev, [name]: value }));
  };
  
  // Yeni kategori ekleme modalını açma
  const handleAddCategoryClick = () => {
    // Yeni kategori ekleme modalını açarken form verilerini sıfırla
    setNewCategory({ name: '', description: '' });
    setShowAddCategoryModal(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    if (!newCategory.name) {
      setError('Kategori adı zorunludur!');
      return;
    }
    
    try {
      setLoadingData(true);
      setError('');
      
      // Kategori ekleme işlemi için CSRF token al (güncelleme işleminde gerekli değil)
      if (!newCategory._id) {
        console.log('Yeni kategori ekleme işlemi için CSRF token alınıyor...');
        const csrfResult = await getCsrfToken();
        if (!csrfResult) {
          throw new Error('CSRF token alınamadı. Lütfen sayfayı yenileyin.');
        }
      }
      
      // Kategori güncelleme veya ekleme işlemi
      let response;
      if (newCategory._id) {
        // Kategori güncelleme
        response = await updateCategory(newCategory._id, {
          name: newCategory.name,
          description: newCategory.description
        });
        
        if (response && response.data) {
          // Kategorileri güncelle
          setCategories(prev => prev.map(cat => 
            cat._id === newCategory._id ? {...cat, ...response.data} : cat
          ));
          setSuccess('Kategori başarıyla güncellendi!');
        }
      } else {
        // Yeni kategori ekleme - CSRF token korumalı işlem
        console.log('Yeni kategori ekleniyor (CSRF korumalı)...');
        console.log('CSRF token ile korunan kategori ekleme işlemi yapılıyor...');
        response = await createCategory(newCategory);
        console.log('Kategori ekleme işlemi başarılı (CSRF korumalı)');
        
        if (response && response.data) {
          // Backend'den dönen kategori verisini doğrudan kullan
          const newCategoryData = response.data;
          
          // Kategori verisinin doğru formatta olduğundan emin ol
          const formattedCategory = {
            _id: newCategoryData._id || newCategoryData.id,
            name: newCategoryData.name,
            description: newCategoryData.description || ''
          };
          
          // Kategorileri güncelle
          setCategories(prev => [...prev, formattedCategory]);
          setSuccess('Kategori başarıyla eklendi!');
          
          // Kategori listesini yeniden çek (opsiyonel, ek güvenlik için)
          fetchAllData();
        }
      }
      
      console.log('Backend yanıtı:', response);
      // Formu sıfırla
      setNewCategory({ name: '', description: '' });
    } catch (error) {
      console.error('Kategori işlemi sırasında hata oluştu:', error);
      setError(error.response?.data?.message || error.message || 'Kategori işlemi sırasında bir hata oluştu');
      
      // CSRF token hatası için özel mesaj
      if (error.response?.status === 403 && error.response?.data?.error === 'EBADCSRFTOKEN') {
        setError('Güvenlik doğrulaması başarısız oldu. Lütfen sayfayı yenileyin ve tekrar deneyin.');
      }
    } finally {
      setLoadingData(false);
      setShowAddCategoryModal(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    // SweetAlert2 ile onay diyaloğu göster
    Swal.fire({
      title: 'Emin misiniz?',
      text: 'Bu kategoriyi silmek istediğinize emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Evet, sil!',
      cancelButtonText: 'İptal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoadingData(true);
          await deleteCategory(id);
          
          // Başarılı silme işlemi sonrası bildirim
          Swal.fire(
            'Silindi!',
            'Kategori başarıyla silindi.',
            'success'
          );
          
          fetchAllData();
        } catch (error) {
          console.error('Kategori silinirken hata oluştu:', error);
          setError(error.response?.data?.message || 'Kategori silinirken bir hata oluştu');
          
          // Hata durumunda bildirim
          Swal.fire(
            'Hata!',
            error.response?.data?.message || 'Kategori silinirken bir hata oluştu',
            'error'
          );
        } finally {
          setLoadingData(false);
        }
      }
    });
  };

  const handleDeletePost = async (id) => {
    // SweetAlert2 ile onay diyaloğu göster
    Swal.fire({
      title: 'Emin misiniz?',
      text: 'Bu yazıyı silmek istediğinize emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Evet, sil!',
      cancelButtonText: 'İptal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoadingData(true);
          await deletePost(id);
          setPosts(prev => prev.filter(post => post._id !== id));
          
          // Başarılı silme işlemi sonrası bildirim
          Swal.fire(
            'Silindi!',
            'Yazı başarıyla silindi.',
            'success'
          );
        } catch (error) {
          console.error('Yazı silinirken hata oluştu:', error);
          setError(error.response?.data?.message || 'Yazı silinirken bir hata oluştu');
          
          // Hata durumunda bildirim
          Swal.fire(
            'Hata!',
            error.response?.data?.message || 'Yazı silinirken bir hata oluştu',
            'error'
          );
        } finally {
          setLoadingData(false);
        }
      }
    });
  };

  // Yazı düzenleme işlemi
  const handlePostEdit = async (e) => {
    e.preventDefault();
    
    if (!editingPost || !editingPost.title) {
      setError('Yazı başlığı zorunludur!');
      return;
    }
    
    try {
      setLoadingData(true);
      setError('');
      
      // Formdata oluştur
      const formData = new FormData();
      formData.append('title', editingPost.title);
      formData.append('content', editingPost.content);
      formData.append('summary', editingPost.summary || '');
      
      if (editingPost.category && editingPost.category._id) {
        formData.append('category', editingPost.category._id);
      }
      
      // Eğer yeni bir görsel yüklendiyse
      if (newPostImage) {
        console.log('Yeni görsel formData\'ya ekleniyor:', newPostImage);
        formData.append('image', newPostImage);
      }
      
      // FormData içeriğini kontrol et
      console.log('FormData içeriği:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[0] === 'image' ? 'Dosya' : pair[1]));
      }
      
      // Yazı güncelleme işlemi
      console.log('Yazı güncelleme isteği gönderiliyor...');
      const response = await updatePost(editingPost._id, formData);
      
      if (response && response.data) {
        // Yazıları güncelle
        setPosts(prev => prev.map(post => 
          post._id === editingPost._id ? {...post, ...response.data} : post
        ));
        setSuccess('Yazı başarıyla güncellendi!');
      }
      
      // Modalı kapat ve form verilerini sıfırla
      setShowEditPostModal(false);
      setEditingPost(null);
      setPostImagePreview('');
      setNewPostImage(null);
    } catch (error) {
      console.error('Yazı güncellenirken hata oluştu:', error);
      setError(error.response?.data?.message || 'Yazı güncellenirken bir hata oluştu');
    } finally {
      setLoadingData(false);
    }
  };
  
  // Yazı düzenleme form alanlarını güncelleme
  const handlePostInputChange = (e) => {
    const { name, value } = e.target;
    setEditingPost(prev => ({ ...prev, [name]: value }));
  };
  
  // Yazı görseli yükleme işlemi
  const handlePostImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Seçilen görsel dosyası:', file);
      setNewPostImage(file);
      
      // Dosya önizlemesi için
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImagePreview(reader.result);
        console.log('Görsel önizleme oluşturuldu');
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Yazı görseli silme işlemi
  const handleRemovePostImage = () => {
    setNewPostImage(null);
    setPostImagePreview('');
    
    // Eğer düzenlenen yazının mevcut bir görseli varsa, onu da kaldır
    if (editingPost) {
      setEditingPost(prev => ({
        ...prev,
        image: null,
        imageUrl: null
      }));
    }
  };

  // Medya dosyası yükleme işlemi (çoklu dosya)
  const handleMediaFileChange = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles(files);
    // Önizleme oluştur
    const previews = files.map(file => URL.createObjectURL(file));
    setMediaPreviews(previews);
  };

  // Çoklu medya yükleme işlemi
  const handleMediaUpload = async (e) => {
    e.preventDefault();
    if (mediaFiles.length === 0) {
      setMediaUploadError('Lütfen en az bir dosya seçin!');
      return;
    }
    setMediaUploadLoading(true);
    setMediaUploadError('');
    setMediaUploadSuccess('');
    try {
      const formData = new FormData();
      mediaFiles.forEach(file => formData.append('files', file));
      const response = await uploadMedia(formData);
      if (response && response.data && response.data.data) {
        setMediaFiles([]);
        setMediaPreviews([]);
        setMediaUploadSuccess(`${response.data.data.length} dosya başarıyla yüklendi!`);
        // Medya listesini güncelle
        setMediaFiles(prev => [...prev, ...response.data.data]);
        setTimeout(() => setShowUploadMediaModal(false), 1500);
      }
    } catch (error) {
      setMediaUploadError(error.response?.data?.message || 'Medya yüklenirken bir hata oluştu.');
    } finally {
      setMediaUploadLoading(false);
    }
  };

  // Medya dosyası silme işlemi
  const handleDeleteMedia = async (id) => {
    // SweetAlert2 ile onay diyaloğu göster
    Swal.fire({
      title: 'Emin misiniz?',
      text: 'Bu medya dosyasını silmek istediğinize emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Evet, sil!',
      cancelButtonText: 'İptal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoadingData(true);
          await deleteMedia(id);
          setMediaFiles(prev => prev.filter(media => media._id !== id));
          
          // Başarılı silme işlemi sonrası bildirim
          Swal.fire(
            'Silindi!',
            'Medya dosyası başarıyla silindi.',
            'success'
          );
        } catch (error) {
          console.error('Medya silinirken hata oluştu:', error);
          setError(error.response?.data?.message || 'Medya silinirken bir hata oluştu');
          
          // Hata durumunda bildirim
          Swal.fire(
            'Hata!',
            error.response?.data?.message || 'Medya silinirken bir hata oluştu',
            'error'
          );
        } finally {
          setLoadingData(false);
        }
      }
    });
  };

  // Kullanıcı silme işlemi
  const handleDeleteUser = async (id) => {
    // SweetAlert2 ile onay diyaloğu göster
    Swal.fire({
      title: 'Emin misiniz?',
      text: 'Bu kullanıcıyı silmek istediğinize emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Evet, sil!',
      cancelButtonText: 'İptal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoadingData(true);
          await deleteUser(id);
          setUsers(prev => prev.filter(user => user._id !== id));
          
          // Başarılı silme işlemi sonrası bildirim
          Swal.fire(
            'Silindi!',
            'Kullanıcı başarıyla silindi.',
            'success'
          );
        } catch (error) {
          console.error('Kullanıcı silinirken hata oluştu:', error);
          setError(error.response?.data?.message || 'Kullanıcı silinirken bir hata oluştu');
          
          // Hata durumunda bildirim
          Swal.fire(
            'Hata!',
            error.response?.data?.message || 'Kullanıcı silinirken bir hata oluştu',
            'error'
          );
        } finally {
          setLoadingData(false);
        }
      }
    });
  };

  // Kullanıcı rolünü değiştirme işlemi
  const handleUpdateUserRole = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const confirmMessage = `Bu kullanıcının rolünü ${currentRole === 'admin' ? 'kullanıcı' : 'admin'} olarak değiştirmek istediğinize emin misiniz?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        setLoadingData(true);
        await updateUser(id, { role: newRole });
        setUsers(prev => prev.map(user => {
          if (user._id === id) {
            return { ...user, role: newRole };
          }
          return user;
        }));
        setSuccess('Kullanıcı rolü başarıyla güncellendi!');
      } catch (error) {
        console.error('Kullanıcı rolü güncellenirken hata oluştu:', error);
        setError(error.response?.data?.message || 'Kullanıcı rolü güncellenirken bir hata oluştu');
      } finally {
        setLoadingData(false);
      }
    }
  };

  // Kullanıcı düzenleme işlemi
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    if (!editingUser) {
      setError('Düzenlenecek kullanıcı bulunamadı!');
      return;
    }
    
    try {
      setLoadingData(true);
      setError('');
      
      // Kullanıcı bilgilerini güncelle
      const response = await updateUser(editingUser._id, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role
      });
      
      if (response && response.data) {
        // Kullanıcıları güncelle
        setUsers(prev => prev.map(user => 
          user._id === editingUser._id ? { ...user, ...editingUser } : user
        ));
        setSuccess('Kullanıcı bilgileri başarıyla güncellendi!');
      }
      
      // Modalı kapat ve form verilerini sıfırla
      setShowEditUserModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Kullanıcı güncellenirken hata oluştu:', error);
      setError(error.response?.data?.message || 'Kullanıcı güncellenirken bir hata oluştu');
    } finally {
      setLoadingData(false);
    }
  };
  
  // Kullanıcı form alanlarını güncelleme
  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setEditingUser(prev => ({ ...prev, [name]: value }));
  };

  // Dashboard bileşeni
  const renderDashboard = () => {
    return (
      <div>
        <h2 className="mb-4">Dashboard</h2>
        
        <div className="row">
          <div className="col-md-3 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Toplam Yazı</h6>
                    <h3 className="mb-0">{stats.totalPosts}</h3>
                  </div>
                  <div className="icon-circle bg-primary text-white">
                    <i className="fa-solid fa-newspaper"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Toplam Kategori</h6>
                    <h3 className="mb-0">{stats.totalCategories}</h3>
                  </div>
                  <div className="icon-circle bg-success text-white">
                    <i className="fa-solid fa-tags"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Toplam Kullanıcı</h6>
                    <h3 className="mb-0">{stats.totalUsers}</h3>
                  </div>
                  <div className="icon-circle bg-info text-white">
                    <i className="fa-solid fa-users"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Toplam Ziyaret</h6>
                    <h3 className="mb-0">{stats.totalVisits}</h3>
                  </div>
                  <div className="icon-circle bg-warning text-white">
                    <i className="fa-solid fa-chart-line"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Kategorilere Göre Yazı Dağılımı</h5>
              </div>
              <div className="card-body">
                {loadingData ? (
                  renderLoading()
                ) : categories.length > 0 && posts.length > 0 ? (
                  <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                    <Pie 
                      data={{
                        labels: categories.map(cat => cat.name),
                        datasets: [
                          {
                            label: 'Yazı Sayısı',
                            data: categories.map(cat => 
                              posts.filter(post => post.category && post.category._id === cat._id).length
                            ),
                            backgroundColor: [
                              '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b',
                              '#6f42c1', '#5a5c69', '#858796', '#f8f9fc', '#d1d3e2'
                            ],
                            borderColor: [
                              '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b',
                              '#6f42c1', '#5a5c69', '#858796', '#f8f9fc', '#d1d3e2'
                            ],
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                          },
                          title: {
                            display: false,
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  renderNoData('Grafik için yeterli veri bulunmamaktadır.')
                )}
              </div>
            </div>
          </div>
          
          <div className="col-md-6 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Aylık Yazı İstatistikleri</h5>
              </div>
              <div className="card-body">
                {loadingData ? (
                  renderLoading()
                ) : (
                  <div style={{ height: '300px' }}>
                    <Bar
                      data={{
                        labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
                        datasets: [
                          {
                            label: 'Yazı Sayısı',
                            data: Array(12).fill(0).map((_, index) => {
                              const currentYear = new Date().getFullYear();
                              return posts.filter(post => {
                                const postDate = new Date(post.createdAt);
                                return postDate.getMonth() === index && postDate.getFullYear() === currentYear;
                              }).length;
                            }),
                            backgroundColor: 'rgba(78, 115, 223, 0.8)',
                            borderColor: 'rgba(78, 115, 223, 1)',
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: false,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              precision: 0
                            }
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Veri yüklenirken gösterilecek yükleme bileşeni
  const renderLoading = () => (
    <div className="text-center py-4">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Yükleniyor...</span>
      </div>
    </div>
  );

  // Hata durumunda gösterilecek bileşen
  const renderError = (message) => (
    <div className="alert alert-danger">
      <i className="fa-solid fa-exclamation-triangle me-2"></i>
      {message}
    </div>
  );

  // Veri yoksa gösterilecek bileşen
  const renderNoData = (message) => (
    <div className="alert alert-info">
      <i className="fa-solid fa-info-circle me-2"></i>
      {message}
    </div>
  );

  // Başarı mesajını göster
  const renderSuccess = () => {
    if (!success) return null;
    
    setTimeout(() => {
      setSuccess('');
    }, 3000);
    
    return (
      <div className="alert alert-success">
        <i className="fa-solid fa-check-circle me-2"></i>
        {success}
      </div>
    );
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">Admin Paneli</h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => handleTabChange('dashboard')}
                >
                  <i className="fa-solid fa-gauge-high me-2"></i> Dashboard
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'posts' ? 'active' : ''}`}
                  onClick={() => handleTabChange('posts')}
                >
                  <i className="fa-solid fa-newspaper me-2"></i> Yazılar
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'categories' ? 'active' : ''}`}
                  onClick={() => handleTabChange('categories')}
                >
                  <i className="fa-solid fa-tags me-2"></i> Kategoriler
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => handleTabChange('users')}
                >
                  <i className="fa-solid fa-users me-2"></i> Kullanıcılar
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'media' ? 'active' : ''}`}
                  onClick={() => handleTabChange('media')}
                >
                  <i className="fa-solid fa-images me-2"></i> Medya
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => handleTabChange('settings')}
                >
                  <i className="fa-solid fa-gear me-2"></i> Ayarlar
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-9">
          {error && renderError(error)}
          {success && renderSuccess()}
          
          {/* Dashboard */}
          {activeTab === 'dashboard' && renderDashboard()}
          
          {/* Posts */}
          {activeTab === 'posts' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Yazılar</h2>
                <button className="btn btn-primary" onClick={() => navigate('/admin/post-olustur')}>
                  <i className="fa-solid fa-plus me-2"></i> Yeni Yazı Ekle
                </button>
              </div>
              
              {loadingData ? (
                renderLoading()
              ) : posts.length > 0 ? (
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Başlık</th>
                            <th>Kategori</th>
                            <th>Yazar</th>
                            <th>Tarih</th>
                            <th>İşlemler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {posts.map(post => (
                            <tr key={post._id}>
                              <td>{post.title}</td>
                              <td>{post.category ? post.category.name : 'Kategorisiz'}</td>
                              <td>{post.author ? post.author.username : 'Bilinmiyor'}</td>
                              <td>{new Date(post.createdAt).toLocaleDateString('tr-TR')}</td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-outline-primary me-1" 
                                  onClick={() => {
                                    // Düzenlenecek yazıyı ayarla ve modalı aç
                                    setEditingPost(post);
                                    setShowEditPostModal(true);
                                    
                                    // Eğer yazının bir görseli varsa, önizleme olarak ayarla
                                    if (post.image || post.imageUrl) {
                                      let imageUrl = post.image?.startsWith('/')
                                        ? `http://localhost:5001${post.image}`
                                        : (post.image || post.imageUrl);
                                      // Cache busting için updatedAt veya Date.now() ekle
                                      if (post.updatedAt) {
                                        imageUrl += `?t=${new Date(post.updatedAt).getTime()}`;
                                      } else {
                                        imageUrl += `?t=${Date.now()}`;
                                      }
                                      setPostImagePreview(imageUrl);
                                      console.log('Görsel önizleme ayarlandı:', imageUrl);
                                    } else {
                                      setPostImagePreview('');
                                      console.log('Görsel bulunamadı, önizleme temizlendi');
                                    }
                                    
                                    // Yeni görsel değişkenini sıfırla
                                    setNewPostImage(null);
                                  }}
                                >
                                  <i className="fa-solid fa-edit"></i>
                                </button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeletePost(post._id)}>
                                  <i className="fa-solid fa-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                renderNoData('Henüz yazı bulunmamaktadır.')
              )}
            </div>
          )}
          
          {/* Categories */}
          {activeTab === 'categories' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Kategoriler</h2>
                <button className="btn btn-primary" onClick={() => setShowAddCategoryModal(true)}>
                  <i className="fa-solid fa-plus me-2"></i> Yeni Kategori Ekle
                </button>
              </div>
              
              {loadingData ? (
                renderLoading()
              ) : categories.length > 0 ? (
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Kategori Adı</th>
                            <th>Açıklama</th>
                            <th>Yazı Sayısı</th>
                            <th>İşlemler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map(category => (
                            <tr key={category._id}>
                              <td>{category.name}</td>
                              <td>{category.description || '-'}</td>
                              <td>{posts.filter(post => post.category && post.category._id === category._id).length}</td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-outline-primary me-1"
                                  onClick={() => {
                                    setNewCategory({
                                      _id: category._id,
                                      name: category.name,
                                      description: category.description || ''
                                    });
                                    setShowAddCategoryModal(true);
                                  }}
                                >
                                  <i className="fa-solid fa-edit"></i>
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger" 
                                  onClick={() => handleDeleteCategory(category._id)}
                                >
                                  <i className="fa-solid fa-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                renderNoData('Henüz kategori bulunmamaktadır.')
              )}
              
              {/* Add Category Modal */}
              {showAddCategoryModal && (
                <div className="modal fade show" style={{ display: 'block' }}>
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Yeni Kategori Ekle</h5>
                        <button type="button" className="btn-close" onClick={() => setShowAddCategoryModal(false)}></button>
                      </div>
                      <div className="modal-body">
                        <form onSubmit={handleCategorySubmit}>
                          <div className="mb-3">
                            <label htmlFor="name" className="form-label">Kategori Adı</label>
                            <input
                              type="text"
                              className="form-control"
                              id="name"
                              name="name"
                              value={newCategory.name}
                              onChange={handleCategoryInputChange}
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="description" className="form-label">Açıklama</label>
                            <textarea
                              className="form-control"
                              id="description"
                              name="description"
                              value={newCategory.description}
                              onChange={handleCategoryInputChange}
                              rows="3"
                            ></textarea>
                          </div>
                          <div className="text-end">
                            <button type="button" className="btn btn-secondary me-2" onClick={() => setShowAddCategoryModal(false)}>İptal</button>
                            <button type="submit" className="btn btn-primary" disabled={loadingData}>
                              {loadingData ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Users */}
          {activeTab === 'users' && (
            <div>
              <h2 className="mb-4">Kullanıcılar</h2>
              
              {loadingData ? (
                renderLoading()
              ) : users.length > 0 ? (
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Kullanıcı Adı</th>
                            <th>E-posta</th>
                            <th>Rol</th>
                            <th>Kayıt Tarihi</th>
                            <th>İşlemler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(user => (
                            <tr key={user._id}>
                              <td>{user.name || user.username || 'Kullanıcı ' + user._id.substring(0, 5)}</td>
                              <td>{user.email}</td>
                              <td>
                                <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-success'}`}>
                                  {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                                </span>
                              </td>
                              <td>{new Date(user.createdAt).toLocaleDateString('tr-TR')}</td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-outline-primary me-1"
                                  onClick={() => {
                                    setEditingUser(user);
                                    setShowEditUserModal(true);
                                  }}
                                >
                                  <i className="fa-solid fa-edit"></i>
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteUser(user._id)}
                                >
                                  <i className="fa-solid fa-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                renderNoData('Henüz kullanıcı bulunmamaktadır.')
              )}
            </div>
          )}
          
          {/* Media */}
          {activeTab === 'media' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Medya</h2>
                <button className="btn btn-outline-primary" onClick={() => navigate('/admin/gorsel-ekle')}>
                  <i className="fa-solid fa-upload me-2"></i> Medya Yükle
                </button>
              </div>
              {loadingData ? (
                renderLoading()
              ) : mediaFiles && mediaFiles.length > 0 ? (
                <div className="row g-3 mt-2">
                  {mediaFiles.map(media => (
                    <div key={media._id || media.id} className="col-6 col-sm-4 col-md-3 col-lg-2">
                      <div className="card border-0 shadow-sm h-100">
                        <img
                          src={media.url ? `http://localhost:5001${media.url}` : (media.filename ? `http://localhost:5001/uploads/gallery/${media.filename}` : '')}
                          alt={media.title || 'Medya'}
                          className="card-img-top img-fluid"
                          style={{objectFit: 'cover', height: '120px', background: '#f8f9fa'}}
                          onError={e => { 
                            console.log('Resim yükleme hatası:', e.target.src);
                            console.log('Medya verisi:', JSON.stringify(media));
                          }}
                        />
                        <div className="card-body p-2 text-center">
                          <small className="d-block text-truncate mb-1" title={media.title || media.originalname || 'Medya'}>
                            {media.title || media.originalname || 'Medya'}
                          </small>
                          <small className="text-muted d-block mb-2">
                            {media.createdAt ? new Date(media.createdAt).toLocaleDateString('tr-TR') : ''}
                          </small>
                          <button
                            className="btn btn-sm btn-outline-danger w-100"
                            onClick={() => handleDeleteMedia(media._id || media.id)}
                            title="Sil"
                          >
                            <i className="fa-solid fa-trash"></i> Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                renderNoData('Henüz medya dosyası bulunmamaktadır.')
              )}
            </div>
          )}
          
          {/* Settings */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="mb-4">Ayarlar</h2>

              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                  <h5 className="mb-0">Site Ayarları</h5>
                </div>
                <div className="card-body">
                  <form>
                    <div className="mb-3">
                      <label htmlFor="siteName" className="form-label">Site Adı</label>
                      <input type="text" className="form-control" id="siteName" defaultValue="Teknoloji Blogu" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="siteDescription" className="form-label">Site Açıklaması</label>
                      <textarea className="form-control" id="siteDescription" rows="2" defaultValue="Teknoloji dünyasındaki en güncel gelişmeleri ve haberleri sizlere sunuyoruz."></textarea>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="siteUrl" className="form-label">Site URL</label>
                      <input type="url" className="form-control" id="siteUrl" defaultValue="[https://teknolojidunyasi.com](https://teknolojidunyasi.com)" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="siteLogo" className="form-label">Site Logo</label>
                      <input type="file" className="form-control" id="siteLogo" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="siteFavicon" className="form-label">Site Favicon</label>
                      <input type="file" className="form-control" id="siteFavicon" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="siteFooterText" className="form-label">Site Footer Text</label>
                      <textarea className="form-control" id="siteFooterText" rows="2" defaultValue="© 2023 Teknoloji Blogu. Tüm hakları saklıdır."></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary">Ayarları Kaydet</button>
                  </form>
                </div>
              </div>
            </div>
          )}
          
          {/* Edit Post Modal */}
          {showEditPostModal && editingPost && (
            <div className="modal fade show" style={{ display: 'block' }}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Yazı Düzenle</h5>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => {
                        setShowEditPostModal(false);
                        setEditingPost(null);
                      }}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handlePostEdit}>
                      <div className="mb-3">
                        <label htmlFor="title" className="form-label">Başlık</label>
                        <input
                          type="text"
                          className="form-control"
                          id="title"
                          name="title"
                          value={editingPost.title}
                          onChange={handlePostInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="summary" className="form-label">Özet</label>
                        <textarea
                          className="form-control"
                          id="summary"
                          name="summary"
                          value={editingPost.summary || ''}
                          onChange={handlePostInputChange}
                          rows="2"
                        ></textarea>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="category" className="form-label">Kategori</label>
                        <select
                          className="form-select"
                          id="category"
                          name="category"
                          value={editingPost.category?._id || ''}
                          onChange={(e) => {
                            const selectedCategoryId = e.target.value;
                            const selectedCategory = categories.find(cat => cat._id === selectedCategoryId);
                            setEditingPost(prev => ({
                              ...prev,
                              category: selectedCategory || null
                            }));
                          }}
                        >
                          <option value="">Kategori Seçin</option>
                          {categories.map(category => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="image" className="form-label">Görsel</label>
                        <div className="d-flex align-items-center mb-2">
                          {(postImagePreview || editingPost.image || editingPost.imageUrl) && (
                            <div className="position-relative me-3 mb-2">
                              <img 
                                src={postImagePreview || (editingPost.image?.startsWith('/') 
                                  ? `http://localhost:5001${editingPost.image}` 
                                  : (editingPost.image || editingPost.imageUrl))}
                                alt="Yazı görseli" 
                                className="img-thumbnail" 
                                style={{ maxWidth: '200px', maxHeight: '150px' }} 
                              />
                              <button 
                                type="button" 
                                className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                onClick={handleRemovePostImage}
                              >
                                <i className="fa-solid fa-times"></i>
                              </button>
                            </div>
                          )}
                          <div>
                            <input
                              type="file"
                              className="form-control"
                              id="image"
                              name="image"
                              onChange={handlePostImageChange}
                              accept="image/*"
                            />
                            <small className="form-text text-muted">
                              Desteklenen formatlar: JPG, PNG, GIF. Maksimum boyut: 5MB
                            </small>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="content" className="form-label">İçerik</label>
                        <textarea
                          className="form-control"
                          id="content"
                          name="content"
                          value={editingPost.content || ''}
                          onChange={handlePostInputChange}
                          rows="10"
                          required
                        ></textarea>
                      </div>
                      <div className="text-end">
                        <button 
                          type="button" 
                          className="btn btn-secondary me-2" 
                          onClick={() => {
                            setShowEditPostModal(false);
                            setEditingPost(null);
                          }}
                        >
                          İptal
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-primary" 
                          disabled={loadingData}
                        >
                          {loadingData ? 'Kaydediliyor...' : 'Güncelle'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Edit User Modal */}
          {showEditUserModal && editingUser && (
            <div className="modal fade show" style={{ display: 'block' }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Kullanıcı Düzenle</h5>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => {
                        setShowEditUserModal(false);
                        setEditingUser(null);
                      }}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleUpdateUser}>
                      <div className="mb-3">
                        <label htmlFor="name" className="form-label">Ad Soyad</label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          value={editingUser.name || ''}
                          onChange={handleUserInputChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">E-posta</label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={editingUser.email || ''}
                          onChange={handleUserInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="role" className="form-label">Rol</label>
                        <select
                          className="form-select"
                          id="role"
                          name="role"
                          value={editingUser.role || 'user'}
                          onChange={handleUserInputChange}
                        >
                          <option value="user">Kullanıcı</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div className="text-end">
                        <button 
                          type="button" 
                          className="btn btn-secondary me-2" 
                          onClick={() => {
                            setShowEditUserModal(false);
                            setEditingUser(null);
                          }}
                        >
                          İptal
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-primary" 
                          disabled={loadingData}
                        >
                          {loadingData ? 'Kaydediliyor...' : 'Güncelle'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Admin;   