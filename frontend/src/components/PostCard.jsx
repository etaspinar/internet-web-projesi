import React from 'react';
import { Link } from 'react-router-dom';

const PostCard = ({ post, compact = false, featured = false }) => {
  if (!post) {
    return (
      <div className="card h-100 post-card skeleton-card">
        <div className="skeleton-image" style={{ height: compact ? '140px' : '200px' }}></div>
        <div className="card-body d-flex flex-column">
          <div className="skeleton-title"></div>
          {!compact && (
            <>
              <div className="skeleton-text"></div>
              <div className="skeleton-text"></div>
            </>
          )}
          <div className="mt-auto d-flex justify-content-between align-items-center">
            <div className="skeleton-date"></div>
            {!compact && <div className="skeleton-button"></div>}
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="card h-100 post-card post-card-compact post-card-hover">
        <div className="position-relative overflow-hidden" style={{ height: '140px' }}>
          <img 
            src={post.image?.startsWith('/') ? `http://localhost:5001${post.image}` : post.image || '/placeholder-image.jpg'} 
            className="card-img-top post-image" 
            alt={post.title} 
            loading="lazy"
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              objectPosition: 'center'
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-image.jpg';
            }}
          />
          {post.category && (
            <Link 
              to={`/kategori/${post.category?.slug || 'kategori'}`} 
              className="post-category-badge-small"
            >
              <i className="fa-solid fa-tag me-1"></i> {post.category?.name || 'Kategori'}
            </Link>
          )}
        </div>
        <div className="card-body d-flex flex-column p-3">
          <div className="post-meta mb-1">
            <small className="text-muted">
              <i className="fa-regular fa-calendar me-1"></i> {new Date(post.createdAt).toLocaleDateString('tr-TR')}
            </small>
          </div>
          <h5 className="card-title h6 mb-0">
            <Link to={`/haber/${post.slug || post._id}`} className="text-decoration-none text-dark post-title-link">
              {post.title.length > 60 ? post.title.substring(0, 60) + '...' : post.title}
            </Link>
          </h5>
        </div>
      </div>
    );
  }
  
  if (featured) {
    return (
      <div className="card h-100 post-card featured-post-card post-card-hover">
        <div className="position-relative overflow-hidden" style={{ height: '250px' }}>
          <img 
            src={post.image?.startsWith('/') ? `http://localhost:5001${post.image}` : post.image || '/placeholder-image.jpg'} 
            className="card-img-top post-image" 
            alt={post.title} 
            loading="lazy"
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              objectPosition: 'center'
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-image.jpg';
            }}
          />
          <div className="post-image-overlay"></div>
          {post.category && (
            <Link 
              to={`/kategori/${post.category?.slug || 'kategori'}`} 
              className="post-category-badge"
            >
              <i className="fa-solid fa-tag me-1"></i> {post.category?.name || 'Kategori'}
            </Link>
          )}
        </div>
        <div className="card-body d-flex flex-column p-4">
          <div className="post-meta mb-2">
            <span className="text-muted d-flex align-items-center">
              <i className="fa-regular fa-calendar me-2"></i>
              {new Date(post.createdAt).toLocaleDateString('tr-TR')}
            </span>
          </div>
          <h3 className="card-title featured-post-title mb-3">
            <Link to={`/haber/${post.slug || post._id}`} className="text-decoration-none text-dark post-title-link">
              {post.title}
            </Link>
          </h3>
          <p className="card-text">{post.summary?.substring(0, 150)}...</p>
          <Link 
            to={`/haber/${post.slug || post._id}`} 
            className="btn btn-primary mt-auto align-self-start"
          >
            <i className="fa-solid fa-arrow-right me-2"></i> Devamını Oku
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-100 post-card post-card-hover">
      <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
        <img 
          src={post.image?.startsWith('/') ? `http://localhost:5001${post.image}` : post.image || '/placeholder-image.jpg'} 
          className="card-img-top post-image" 
          alt={post.title} 
          loading="lazy"
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            objectPosition: 'center'
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder-image.jpg';
          }}
        />
        {post.category && (
          <Link 
            to={`/kategori/${post.category?.slug || 'kategori'}`} 
            className="post-category-badge"
          >
            <i className="fa-solid fa-tag me-1"></i> {post.category?.name || 'Kategori'}
          </Link>
        )}
      </div>
      <div className="card-body d-flex flex-column">
        <div className="post-meta mb-2">
          <small className="text-muted">
            <i className="fa-regular fa-calendar me-1"></i> {new Date(post.createdAt).toLocaleDateString('tr-TR')}
          </small>
        </div>
        <h5 className="card-title mb-2">
          <Link to={`/haber/${post.slug || post._id}`} className="text-decoration-none text-dark post-title-link">
            {post.title}
          </Link>
        </h5>
        <p className="card-text text-muted">{post.summary?.substring(0, 100)}...</p>
        <Link 
          to={`/haber/${post.slug || post._id}`} 
          className="mt-auto text-primary read-more-link"
        >
          Devamını Oku <i className="fa-solid fa-arrow-right ms-1"></i>
        </Link>
      </div>
    </div>
  );
};

export default PostCard;
