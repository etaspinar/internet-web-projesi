import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostBySlug, getRelatedPosts } from '../services/api';

const PostDetail = () => {
  const params = useParams();
  const slug = params?.slug || '';
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Slug kontrolü
        if (!slug || slug.trim() === '') {
          throw new Error('Geçersiz haber URL\'si');
        }
        
        console.log('Haber slug:', slug);
        const response = await getPostBySlug(slug);
        console.log('Haber API yanıtı:', response);
        
        // API yanıtını işle
        let postData = null;
        
        if (response && response.data) {
          // Başarılı API yanıtı ise, esas veri response.data.data içindedir
          if (response.data.success && response.data.data) {
            postData = response.data.data;
          } else if (typeof response.data === 'object' && !Array.isArray(response.data)) {
            postData = response.data;
          } else if (Array.isArray(response.data) && response.data.length > 0) {
            postData = response.data[0];
          }
        }
        
        // Konsola tüm veriyi yazdır
        console.log('Ham post verisi:', postData);
        
        // İçerik alanını kontrol et ve düzenle
        if (postData) {
          console.log('Post verisi:', JSON.stringify(postData, null, 2));
          
          // Eğer content yoksa boş string olarak başlat
          if (!postData.content) {
            console.warn('İçerik boş veya tanımsız');
            postData.content = '';
          } else if (typeof postData.content !== 'string') {
            console.warn('İçerik string değil, stringe çevriliyor:', postData.content);
            postData.content = String(postData.content);
          }
          
          console.log('İçerik tipi:', typeof postData.content);
          console.log('Ham içerik:', postData.content.substring(0, 200) + '...');
          
          // HTML etiketlerini düzelt
          if (postData.content.trim().startsWith('<p>') && !postData.content.trim().endsWith('</p>')) {
            console.log('Eksik kapanış etiketi düzeltiliyor');
            postData.content = postData.content.trim() + '</p>';
          }
          
          // Eğer hiç HTML etiketi yoksa, paragraf etiketleri ekle
          if (!/<[a-z][\s\S]*>/i.test(postData.content)) {
            console.log('HTML etiketi yok, paragraf ekleniyor');
            postData.content = postData.content
              .split('\n')
              .filter(para => para.trim() !== '')
              .map(para => `<p>${para.trim()}</p>`)
              .join('');
          }
        }
        
        if (!postData) {
          throw new Error('Haber bulunamadı');
        }
        
        console.log('İşlenen haber verisi:', postData);
        setPost(postData);
        
        // İlgili yazıları getir
        try {
          if (postData._id && postData.category && postData.category._id) {
            const relatedResponse = await getRelatedPosts(postData._id, postData.category._id);
            console.log('İlgili haberler yanıtı:', relatedResponse);
            
            // İlgili haberleri işle
            let relatedData = [];
            if (relatedResponse && relatedResponse.data) {
              if (Array.isArray(relatedResponse.data)) {
                relatedData = relatedResponse.data;
              } else if (relatedResponse.data.posts && Array.isArray(relatedResponse.data.posts)) {
                relatedData = relatedResponse.data.posts;
              }
            }
            
            setRelatedPosts(relatedData);
          }
        } catch (relatedErr) {
          console.error('İlgili haberler yüklenirken hata:', relatedErr);
          // İlgili haberler yüklenemese bile ana haberi göstermeye devam et
          setRelatedPosts([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Haber yüklenirken hata:', err);
        setError(err.message || 'Haber yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    } else {
      setError('Geçersiz haber URL\'si');
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
          <p className="mt-3">Haber yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger p-4 shadow-sm">
          <div className="d-flex align-items-center">
            <i className="fa-solid fa-circle-exclamation fs-3 me-3"></i>
            <div>
              <h5 className="alert-heading">Bir Hata Oluştu!</h5>
              <p className="mb-0">{error}</p>
            </div>
          </div>
          <div className="mt-3 text-end">
            <button 
              className="btn btn-outline-danger" 
              onClick={() => window.location.reload()}
            >
              <i className="fa-solid fa-rotate me-2"></i> Sayfayı Yenile
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning p-4 shadow-sm">
          <div className="d-flex align-items-center">
            <i className="fa-solid fa-triangle-exclamation fs-3 me-3"></i>
            <div>
              <h5 className="alert-heading">Haber Bulunamadı!</h5>
              <p className="mb-0">Aradığınız haber bulunamadı veya kaldırılmış olabilir.</p>
            </div>
          </div>
          <div className="mt-3 text-end">
            <Link to="/" className="btn btn-outline-warning">
              <i className="fa-solid fa-home me-2"></i> Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // İçerik işleme fonksiyonu
  const processContent = (content) => {
    if (!content) return '';
    
    // Eğer içerik string değilse stringe çevir
    let processedContent = typeof content === 'string' ? content : String(content);
    
    // Eğer içerik boşsa veya sadece boşluklardan oluşuyorsa
    if (!processedContent.trim()) return '';
    
    // Eğer hiç HTML etiketi yoksa, paragraflara böl
    if (!/<[a-z][\s\S]*>/i.test(processedContent)) {
      processedContent = processedContent
        .split('\n')
        .filter(para => para.trim() !== '')
        .map(para => `<p>${para.trim()}</p>`)
        .join('');
    }
    
    return processedContent;
  };

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8">
          <div className="post-detail card border-0 shadow-sm mb-4">
            {post?.image ? (
              <img 
                src={post.image.startsWith('/') 
                  ? `http://localhost:5001${post.image}` 
                  : post.image} 
                className="card-img-top" 
                alt={post.title || 'Haber Resmi'} 
                style={{ 
                  width: '100%', 
                  height: '400px', 
                  objectFit: 'cover',
                  objectPosition: 'center top'
                }}
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            ) : (
              <div className="bg-light d-flex align-items-center justify-content-center" style={{height: '400px'}}>
                <i className="fas fa-image fa-4x text-muted"></i>
              </div>
            )}
            
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted d-flex align-items-center">
                  <i className="fa-regular fa-calendar me-2"></i>
                  {post.createdAt ? new Date(post.createdAt).toLocaleDateString('tr-TR') : 'Tarih yok'}
                </span>
                
                <Link 
                  to={`/kategori/${post.category?.slug || 'genel'}`} 
                  className="badge bg-primary text-decoration-none"
                >
                  <i className="fa-solid fa-tag me-1"></i> 
                  {post.category?.name || 'Genel'}
                </Link>
              </div>
              
              <h1 className="card-title mb-3">{post.title || 'Başlıksız Haber'}</h1>
              
              {post.summary && (
                <div className="lead mb-4 p-3 bg-light rounded">
                  {post.summary}
                </div>
              )}
              
              <div className="post-content mt-4">
                {(() => {
                  const content = processContent(post.content);
                  
                  if (!content) {
                    return (
                      <div className="alert alert-warning">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        Bu haberin içeriği henüz eklenmemiş veya yüklenirken bir hata oluştu.
                      </div>
                    );
                  }
                  
                  return (
                    <div 
                      className="formatted-content"
                      style={{ 
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.8',
                        fontSize: '1.05rem'
                      }}
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
