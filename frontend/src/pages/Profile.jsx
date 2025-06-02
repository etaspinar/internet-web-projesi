import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Kullanıcı oturum durumunu kontrol et
    const checkUserLogin = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (!storedUser || !token) {
        navigate('/giris');
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setLoading(false);
      } catch (error) {
        console.error('Kullanıcı bilgileri çözümlenemedi:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/giris');
      }
    };

    checkUserLogin();
  }, [navigate]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
        <p className="mt-3">Profil bilgileri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center p-4">
              <div className="mb-4">
                <div className="avatar-circle mx-auto mb-3">
                  <i className="fa-solid fa-user-circle fa-5x text-primary"></i>
                </div>
                <h3 className="h4 mb-1">{user.name}</h3>
                <p className="text-muted mb-3">{user.email}</p>
                <div className="badge bg-primary">
                  {user.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                </div>
              </div>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary">
                  <i className="fa-solid fa-key me-2"></i> Şifre Değiştir
                </button>
                {user.role === 'admin' && (
                  <a href="/admin" className="btn btn-primary">
                    <i className="fa-solid fa-cogs me-2"></i> Admin Paneline Git
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <h4 className="mb-0">Profil Bilgileri</h4>
            </div>
            <div className="card-body p-4">
              <form>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Ad Soyad</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={user.name}
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">E-posta Adresi</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={user.email}
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="role" className="form-label">Kullanıcı Rolü</label>
                  <input
                    type="text"
                    className="form-control"
                    id="role"
                    value={user.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="createdAt" className="form-label">Kayıt Tarihi</label>
                  <input
                    type="text"
                    className="form-control"
                    id="createdAt"
                    value={
                      user?.createdAt && !isNaN(new Date(user.createdAt).getTime())
                        ? new Date(user.createdAt).toLocaleDateString('tr-TR')
                        : 'Belirtilmemiş'
                    }
                    readOnly
                  />

                </div>
              </form>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <h4 className="mb-0">Aktiviteler</h4>
            </div>
            <div className="card-body p-4">
              <div className="alert alert-info">
                <i className="fa-solid fa-info-circle me-2"></i> Henüz aktivite bulunmamaktadır.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
