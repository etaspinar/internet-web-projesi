import React, { useState, useEffect } from 'react';
import { sendContactForm } from '../services/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [csrfToken, setCsrfToken] = useState('');
  const [status, setStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // CSRF token'ı backend'den al
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/api/csrf-token', {
          credentials: 'include'
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (err) {
        console.error('CSRF token alınamadı:', err);
      }
    };

    fetchCsrfToken();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'İsim alanı zorunludur';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta alanı zorunludur';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Konu alanı zorunludur';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Mesaj alanı zorunludur';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setStatus({
        submitted: true,
        success: false,
        message: 'Mesajınız gönderiliyor...'
      });
      
      const response = await sendContactForm({
        ...formData,
        _csrf: csrfToken
      });
      
      setStatus({
        submitted: true,
        success: true,
        message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.'
      });
      
      // Formu sıfırla
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      setStatus({
        submitted: true,
        success: false,
        message: err.response?.data?.message || 'Mesajınız gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
      });
    }
  };

  return (
    <div>
      <h1 className="mb-4">İletişim</h1>
      
      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">İletişim Bilgileri</h5>
              <p className="card-text">
                <strong>Adres:</strong> Teknoloji Caddesi, No: 123, Dijital Plaza, Kat: 5, İstanbul
              </p>
              <p className="card-text">
                <strong>Telefon:</strong> +90 212 345 67 89
              </p>
              <p className="card-text">
                <strong>E-posta:</strong> info@teknolojiblogu.com
              </p>
              <p className="card-text">
                <strong>Çalışma Saatleri:</strong> Pazartesi - Cuma, 09:00 - 18:00
              </p>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Sosyal Medya</h5>
              <div className="d-flex gap-3 mt-3">
                <a href="#" className="text-decoration-none">
                  <i className="bi bi-facebook fs-4"></i>
                </a>
                <a href="#" className="text-decoration-none">
                  <i className="bi bi-twitter fs-4"></i>
                </a>
                <a href="#" className="text-decoration-none">
                  <i className="bi bi-instagram fs-4"></i>
                </a>
                <a href="#" className="text-decoration-none">
                  <i className="bi bi-linkedin fs-4"></i>
                </a>
                <a href="#" className="text-decoration-none">
                  <i className="bi bi-youtube fs-4"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Bize Ulaşın</h5>
              
              {status.submitted && (
                <div className={`alert ${status.success ? 'alert-success' : 'alert-danger'} mb-4`}>
                  {status.message}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <input type="hidden" name="_csrf" value={csrfToken} />
                
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Adınız Soyadınız</label>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">E-posta Adresiniz</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="subject" className="form-label">Konu</label>
                  <input
                    type="text"
                    className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                  />
                  {errors.subject && <div className="invalid-feedback">{errors.subject}</div>}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="message" className="form-label">Mesajınız</label>
                  <textarea
                    className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                  {errors.message && <div className="invalid-feedback">{errors.message}</div>}
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={status.submitted && !status.success}
                >
                  {status.submitted && !status.success ? 'Gönderiliyor...' : 'Gönder'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
