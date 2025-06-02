import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await login(formData);
      console.log("Gelen kullanıcı:", response.data.user);

      // Token ve user bilgilerini tek bir obje olarak sakla
      const userData = {
        ...response.data.user,
        token: response.data.token
      };
      console.log('localStorage\'a kaydedilecek veri:', userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Auth context'e kullanıcı bilgisini kaydet
      authLogin(userData);
      
      // Başarılı giriş mesajını göster
      setSuccess(response.data.message || 'Giriş başarılı!');
      
      // Kısa bir süre sonra ana sayfaya yönlendir
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Giriş hatası:', err);
      // Kullanıcı adı veya şifre hatalı mesajını göster
      setError('Kullanıcı adı veya şifre hatalı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 shadow-lg">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <i className="fa-solid fa-user-circle fa-4x text-primary mb-3"></i>
                <h2 className="fw-bold">Giriş Yap</h2>
                <p className="text-muted">Hesabınıza giriş yaparak teknoloji dünyasını keşfedin</p>
              </div>

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
                      placeholder="ornek@mail.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
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
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mt-1 text-end">
                    <Link to="/sifremi-unuttum" className="text-decoration-none small">
                      Şifremi unuttum
                    </Link>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Giriş Yapılıyor...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-sign-in-alt me-2"></i> Giriş Yap
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <p className="mb-0">
                  Hesabınız yok mu? <Link to="/kayit" className="text-decoration-none fw-bold">Kayıt Ol</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
