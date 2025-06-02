import React, { useState, useEffect } from 'react';
import { getGalleryImages } from '../services/api';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await getGalleryImages();
        // Eğer API yanıtı {success: true, data: [...]} şeklindeyse
        setImages(response.data?.data || []);
        setLoading(false);
      } catch (err) {
        setError('Resimler yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const openImageModal = (image) => {
    setSelectedImage(image);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  if (loading) {
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
      <h1 className="mb-4">Galeri</h1>
      
      {images.length > 0 ? (
        <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
          {images.map(image => (
            <div className="col" key={image._id}>
              <div className="card h-100">
                <img 
                  src={image.url && image.url.startsWith('/') ? `http://localhost:5001${image.url}` : image.url} 
                  className="card-img-top gallery-image" 
                  alt={image.title || 'Galeri resmi'}
                  onClick={() => openImageModal(image)}
                />
                <div className="card-body">
                  <h5 className="card-title">{image.title || 'İsimsiz'}</h5>
                  {image.post && (
                    <p className="card-text">
                      <small className="text-muted">
                        İlgili haber: {image.post.title}
                      </small>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info">
          Henüz resim bulunmamaktadır.
        </div>
      )}

      {/* Modal */}
      {selectedImage && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex={-1}
          onClick={closeImageModal}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={e => e.stopPropagation()} // modal içi tıklamaları arka plana iletme
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedImage.title || 'İsimsiz'}</h5>
                <button type="button" className="btn-close" onClick={closeImageModal}></button>
              </div>
              <div className="modal-body text-center">
                <img
                  src={selectedImage.url && selectedImage.url.startsWith('/') ? `http://localhost:5001${selectedImage.url}` : selectedImage.url}
                  className="img-fluid"
                  alt={selectedImage.title || 'Galeri resmi'}
                />
                {selectedImage.description && (
                  <p className="mt-3">{selectedImage.description}</p>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeImageModal}>Kapat</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
