import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadMedia } from '../services/api';
import { useAuth } from '../context/AuthContext';

const UploadMedia = () => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Admin yetkisi kontrolü
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [currentUser, navigate]);

  // Dosya seçildiğinde önizleme oluştur
  const handleFileChange = (e) => {
    console.log('Dosya seçildi:', e.target.files);
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    // Önizleme URL'lerini oluştur
    const newPreviews = selectedFiles.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file)
    }));

    console.log('Önizlemeler oluşturuldu:', newPreviews);
    setPreviews(newPreviews);
  };

  // Dosya boyutunu formatla
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Dosya türüne göre ikon belirle
  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return 'fa-solid fa-image';
    if (type.startsWith('video/')) return 'fa-solid fa-video';
    if (type.startsWith('audio/')) return 'fa-solid fa-music';
    if (type.includes('pdf')) return 'fa-solid fa-file-pdf';
    if (type.includes('word') || type.includes('document')) return 'fa-solid fa-file-word';
    if (type.includes('excel') || type.includes('sheet')) return 'fa-solid fa-file-excel';
    return 'fa-solid fa-file';
  };

  // Dosya yükleme işlemi
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setError('Lütfen en az bir dosya seçin.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Yükleme başlatılıyor...');
      const formData = new FormData();
      
      // Backend 'files' adında bir alan bekliyor
      files.forEach((file, index) => {
        console.log(`Dosya ${index} ekleniyor:`, file.name);
        formData.append('files', file);
      });
      
      // FormData içeriğini kontrol et
      for (let pair of formData.entries()) {
        console.log('FormData içeriği:', pair[0], pair[1]);
      }
      
      // JWT token'ı localStorage'dan al
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      console.log('Token:', token ? `${token.substring(0, 15)}...` : 'Bulunamadı');

      const response = await uploadMedia(formData, token);
      console.log('Yükleme başarılı:', response.data);
      
      setSuccess('Medya başarıyla yüklendi!');
      setError('');
      setFiles([]);
      setPreviews([]);
      previews.forEach(preview => URL.revokeObjectURL(preview.url));
      e.target.reset();
      setTimeout(() => {
        navigate('/admin?tab=media');
      }, 2000);
    } catch (err) {
      console.error('Dosya yüklenirken hata:', err);
      setError(err.response?.data?.message || 'Dosya yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  // Dosyayı listeden kaldır
  const removeFile = (index) => {
    const newFiles = [...files];
    const newPreviews = [...previews];
    
    // Önizleme URL'sini temizle
    URL.revokeObjectURL(newPreviews[index].url);
    
    // Dosya ve önizlemeyi listeden kaldır
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card border-0 shadow-lg">
            <div className="card-header bg-info text-white py-3">
              <h3 className="mb-0">
                <i className="fa-solid fa-cloud-upload-alt me-2"></i> Medya Yükle
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
                  <div className="upload-area p-5 border-2 border-dashed rounded text-center">
                    <i className="fa-solid fa-cloud-upload-alt fa-3x mb-3 text-info"></i>
                    <h4>Dosyaları Sürükle & Bırak</h4>
                    <p className="text-muted">veya</p>
                    <input
                      type="file"
                      id="fileInput"
                      className="d-none"
                      multiple
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                    <button 
                      type="button"
                      className="btn btn-info text-white btn-lg"
                      onClick={() => {
                        console.log('Medya Yükle butonuna tıklandı');
                        fileInputRef.current.click();
                      }}
                    >
                      <i className="fa-solid fa-folder-open me-2"></i> Medya Yükle
                    </button>
                    <p className="text-muted mt-3 small">
                      Desteklenen formatlar: JPG, PNG, GIF, SVG, MP4, PDF, DOCX (Maks. 10MB)
                    </p>
                  </div>
                </div>

                {previews.length > 0 && (
                  <div className="mb-4">
                    <h5 className="mb-3">Seçilen Dosyalar ({previews.length})</h5>
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th>Önizleme</th>
                            <th>Dosya Adı</th>
                            <th>Boyut</th>
                            <th>Tür</th>
                            <th style={{ width: '80px' }}>İşlem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previews.map((preview, index) => (
                            <tr key={index}>
                              <td className="text-center">{index + 1}</td>
                              <td style={{ width: '80px' }}>
                                {preview.type.startsWith('image/') ? (
                                  <img 
                                    src={preview.url} 
                                    alt={preview.name} 
                                    className="img-thumbnail" 
                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <div className="d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                    <i className={`${getFileIcon(preview.type)} fa-2x text-secondary`}></i>
                                  </div>
                                )}
                              </td>
                              <td className="align-middle">{preview.name}</td>
                              <td className="align-middle">{formatFileSize(preview.size)}</td>
                              <td className="align-middle">{preview.type.split('/')[1].toUpperCase()}</td>
                              <td className="text-center align-middle">
                                <button 
                                  type="button" 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => removeFile(index)}
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
                )}

                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/admin?tab=media')}
                    disabled={loading}
                  >
                    <i className="fa-solid fa-arrow-left me-2"></i> İptal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-info text-white"
                    disabled={loading || files.length === 0}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Yükleniyor...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-cloud-upload-alt me-2"></i> Yükle
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

export default UploadMedia;
