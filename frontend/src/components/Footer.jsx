import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getVisitorStats } from '../services/api';
import io from 'socket.io-client';

const Footer = () => {
  const [stats, setStats] = useState({
    monthlyVisitors: 0,
    onlineUsers: 0,
    totalVisitors: 0,
    loading: true
  });

  useEffect(() => {
    // Toplam ziyaretçi sayısını al
    const fetchTotalVisitors = async () => {
      try {
        const response = await getVisitorStats();
        if (response?.data?.data) {
          const { monthlyVisitors, totalVisitors = 0 } = response.data.data;
          setStats(prev => ({
            ...prev,
            monthlyVisitors: monthlyVisitors || 0,
            totalVisitors,
            loading: false
          }));
        }
      } catch (err) {
        console.error('Ziyaretçi istatistikleri yüklenirken hata:', err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchTotalVisitors();
    
    // WebSocket bağlantısı kur - try/catch bloğu içinde değil
    let socket = null;
    let connectionAttempted = false;
    
    // Socket.io bağlantısını oluşturmayı dene
    const connectSocket = () => {
      if (connectionAttempted) return; // Sadece bir kez dene
      connectionAttempted = true;
      
      try {
        socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5001', {
          withCredentials: true,
          transports: ['websocket', 'polling'],
          reconnectionAttempts: 3,
          reconnectionDelay: 1000,
          timeout: 5000,
          forceNew: true,
          autoConnect: true
        });
      } catch (error) {
        console.error('WebSocket bağlantısı oluşturulamadı:', error);
        return;
      }
      
      // Bağlantı durumunu izle
      socket.on('connect', () => {
        console.log('WebSocket bağlantısı kuruldu');
        
        // Bağlantı kurulduğunda sunucudan güncel istatistikleri iste
        socket.emit('getStats');
        socket.emit('getTotalVisitors');
      });

      socket.on('connect_error', (error) => {
        console.error('WebSocket bağlantı hatası:', error);
        // Bağlantı hatası durumunda varsayılan değer göster
        setStats(prev => ({
          ...prev,
          onlineUsers: 0,
          loading: false
        }));
      });
      
      socket.on('disconnect', () => {
        console.log('WebSocket bağlantısı kesildi');
      });

      // Canlı istatistikleri dinle
      socket.on('stats', (data) => {
        if (data) {
          setStats(prev => ({
            ...prev,
            onlineUsers: Math.max(0, data.onlineUsers || 0),
            monthlyVisitors: Math.max(0, data.monthlyVisitors || 0),
            totalVisitors: Math.max(prev.totalVisitors, data.totalVisitors || 0),
            loading: false
          }));
        }
      });
    };
    
    // Socket bağlantısını başlat
    connectSocket();

    // Komponent unmount olduğunda WebSocket bağlantısını kapat
    return () => {
      if (socket) {
        console.log('WebSocket bağlantısı kapatılıyor');
        socket.disconnect();
      }
    };
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 col-md-6 mb-4 mb-md-0">
            <h5>Teknoloji Blogu</h5>
            <p className="mb-4">
              Teknoloji dünyasındaki en güncel gelişmeleri ve haberleri sizlere sunuyoruz. Her gün yenilenen içeriklerimizle teknoloji dünyasından haberdar olun.
            </p>
            <div className="social-icons d-flex mb-4">
              
              <a href="https://www.instagram.com/enestaspinar922/" aria-label="Instagram">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="https://www.linkedin.com/in/enestaspinar/" aria-label="LinkedIn">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
          </div>
          
          <div className="col-md-6 col-lg-3 mb-4">
            <h5 className="text-uppercase mb-4">Hızlı Linkler</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/" className="text-white text-decoration-none">Ana Sayfa</Link></li>
              <li className="mb-2"><Link to="/kategoriler" className="text-white text-decoration-none">Kategoriler</Link></li>
              <li className="mb-2"><Link to="/galeri" className="text-white text-decoration-none">Galeri</Link></li>
              <li><Link to="/site-haritasi" className="text-white text-decoration-none">Site Haritası</Link></li>
            </ul>
          </div>
          
          <div className="col-md-6 col-lg-3 mb-4">
            <h5 className="text-uppercase mb-4">Kategoriler</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="/kategori/siber-guvenlik" className="text-white text-decoration-none">Siber Güvenlik</a></li>
              <li className="mb-2"><a href="/kategori/donanim" className="text-white text-decoration-none">Donanım</a></li>
              <li className="mb-2"><a href="/kategori/mobil" className="text-white text-decoration-none">Mobil</a></li>
              <li className="mb-2"><a href="/kategori/yapay-zeka" className="text-white text-decoration-none">Yapay Zeka</a></li>
              <li className="mb-2"><a href="/kategoriler" className="text-white text-decoration-none">Tüm Kategoriler</a></li>
            </ul>
          </div>
          
          <div className="col-md-6 col-lg-3 mb-4">
            <h5 className="text-uppercase mb-4">Ziyaretçi İstatistikleri</h5>
            <div className="visitor-counter">
              <div className="counter-item">
                <span className="counter-icon">👥</span>
                <div className="counter-details">
                  <span className="counter-number">
                    {stats.loading ? '...' : stats.onlineUsers.toLocaleString()}
                    <span className="ms-1">
                      <span className="badge bg-danger rounded-circle p-1 animate-pulse"></span>
                    </span>
                  </span>
                  <span className="counter-label">Çevrimiçi Ziyaretçi</span>
                </div>
              </div>
              
              <div className="counter-separator"></div>
              
              <div className="counter-item">
                <span className="counter-icon">📅</span>
                <div className="counter-details">
                  <span className="counter-number">
                    {stats.loading ? '...' : stats.monthlyVisitors.toLocaleString()}
                  </span>
                  <span className="counter-label">Bu Ayki Ziyaretçi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center pt-3 mt-4 border-top border-secondary">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} Tüm Hakları Saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
