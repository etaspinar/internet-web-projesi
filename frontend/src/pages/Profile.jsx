import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, updateMyProfile, changeMyPassword } from '../services/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState({ name: '', email: '' });
  const [editSuccess, setEditSuccess] = useState('');
  const [editError, setEditError] = useState('');
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');
  const [activities, setActivities] = useState([]);
  const [activityType, setActivityType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyProfile();
        setUser(res.data);
        setEditData({ name: res.data.name, email: res.data.email });
        // Aktiviteleri de çek
        const actRes = await fetch('/api/users/activities', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || (JSON.parse(localStorage.getItem('user'))?.token)}`,
          },
          credentials: 'include',
        });
        const actData = await actRes.json();
        setActivities(actData.posts || actData.comments || []);
        setActivityType(actData.type);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        navigate('/giris');
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setEditSuccess('');
    setEditError('');
    try {
      const res = await updateMyProfile(editData);
      setUser(res.data);
      setEditSuccess('Profil başarıyla güncellendi.');
    } catch (err) {
      setEditError(err.response?.data?.message || 'Profil güncellenemedi.');
    }
  };

  const handlePwChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');
    try {
      await changeMyPassword(passwords.oldPassword, passwords.newPassword);
      setPwSuccess('Şifre başarıyla güncellendi.');
      setPasswords({ oldPassword: '', newPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Şifre güncellenemedi.');
    }
  };

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
              {/* Profil bilgileri sadece okunabilir olarak gösteriliyor */}
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

              {/* Şifre güncelleme formu */}
              <hr />
              <form onSubmit={handlePasswordUpdate}>
                <div className="mb-3">
                  <label htmlFor="oldPassword" className="form-label">Mevcut Şifre</label>
                  <input
                    type="password"
                    className="form-control"
                    id="oldPassword"
                    name="oldPassword"
                    value={passwords.oldPassword}
                    onChange={handlePwChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">Yeni Şifre</label>
                  <input
                    type="password"
                    className="form-control"
                    id="newPassword"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePwChange}
                    required
                  />
                </div>
                {pwSuccess && <div className="alert alert-success">{pwSuccess}</div>}
                {pwError && <div className="alert alert-danger">{pwError}</div>}
                <button type="submit" className="btn btn-outline-primary">Şifreyi Güncelle</button>
              </form>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <h4 className="mb-0">Aktiviteler</h4>
            </div>
            <div className="card-body p-4">
              {activities.length === 0 ? (
                <div className="alert alert-info">
                  <i className="fa-solid fa-info-circle me-2"></i> Henüz aktivite bulunmamaktadır.
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {activityType === 'posts' && activities.map((post) => (
                    <li className="list-group-item" key={post._id}>
                      <a href={`/haber/${post.slug}`} target="_blank" rel="noopener noreferrer">
                        <b>{post.title}</b>
                      </a>
                      <span className="text-muted ms-2">({new Date(post.createdAt).toLocaleDateString('tr-TR')})</span>
                    </li>
                  ))}
                  {activityType === 'comments' && activities.map((comment) => (
                    <li className="list-group-item" key={comment._id}>
                      <div>
                        <span className="fw-semibold">Yorum:</span> {comment._editing ? (
                          <>
                            <input
                              type="text"
                              className="form-control d-inline w-auto mx-2"
                              value={comment._editValue}
                              onChange={e => setActivities(acts => acts.map(c => c._id === comment._id ? { ...c, _editValue: e.target.value } : c))}
                              style={{ maxWidth: 300, display: 'inline-block' }}
                            />
                            <button className="btn btn-sm btn-success me-1" onClick={async () => {
                              try {
                                await (await import('../services/api')).updateComment(comment._id, comment._editValue);
                                setActivities(acts => acts.map(c => c._id === comment._id ? { ...c, content: c._editValue, _editing: false } : c));
                              } catch (err) {
                                alert('Yorum güncellenemedi: ' + (err.response?.data?.message || 'Hata'));
                              }
                            }}>
                              Kaydet
                            </button>
                            <button className="btn btn-sm btn-secondary" onClick={() => setActivities(acts => acts.map(c => c._id === comment._id ? { ...c, _editing: false } : c))}>İptal</button>
                          </>
                        ) : (
                          <>
                            {comment.content} <button className="btn btn-link btn-sm p-0 ms-2" title="Düzenle" onClick={() => setActivities(acts => acts.map(c => c._id === comment._id ? { ...c, _editing: true, _editValue: c.content } : c))}><i className="fa fa-pen"></i></button>
                          </>
                        )}
                      </div>
                      <div>
                        <span className="fw-semibold">Yazı:</span> {comment.post ? (
                          <a href={`/haber/${comment.post.slug}`} target="_blank" rel="noopener noreferrer">{comment.post.title}</a>
                        ) : 'Silinmiş yazı'}
                        <span className="text-muted ms-2">({new Date(comment.createdAt).toLocaleDateString('tr-TR')})</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
