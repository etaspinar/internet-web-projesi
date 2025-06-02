import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateAdmin = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Şifre kontrolü
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor!');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5001/api/auth/create-admin', 
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          adminCode: formData.adminCode
        }
      );
      
      setSuccess(response.data.message || 'Admin kullanıcısı başarıyla oluşturuldu!');
      
      // Form alanlarını temizle
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        adminCode: ''
      });
      
      // 3 saniye sonra giriş sayfasına yönlendir
      setTimeout(() => {
        navigate('/giris');
      }, 3000);
    } catch (err) {
      console.error('Admin oluşturma hatası:', err);
      setError(err.response?.data?.message || 'Admin kullanıcısı oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-0 shadow-lg">
            <div className="card-header bg-primary text-white text-center py-3">
              <h2 className="h4 mb-0">Admin Kullanıcısı Oluştur</h2>
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
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Ad Soyad</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fa-solid fa-user"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ad Soyad"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">E-posta Adresi</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fa-solid fa-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="ornek@mail.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Şifre</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fa-solid fa-lock"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Şifre (en az 6 karakter)"
                      minLength="6"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Şifre Tekrar</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fa-solid fa-lock"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Şifrenizi tekrar girin"
                      minLength="6"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="adminCode" className="form-label">Admin Kodu</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fa-solid fa-key"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      id="adminCode"
                      name="adminCode"
                      value={formData.adminCode}
                      onChange={handleChange}
                      placeholder="Admin kodu"
                      required
                    />
                  </div>
                  <div className="form-text">
                    <i className="fa-solid fa-info-circle me-1"></i><strong> Size verilen admin kodunu giriniz.</strong>
                  </div>
                </div>
                
                <div className="d-grid">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        İşleniyor...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-user-shield me-2"></i> Admin Oluştur
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

export default CreateAdmin;
