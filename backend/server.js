const app = require('./app');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const { getLiveStats } = require('./controllers/statsController');
require('dotenv').config();

// Veritabanı bağlantısı
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27018/tech-blog');
    console.log('MongoDB bağlantısı başarılı');
  } catch (err) {
    console.error('MongoDB bağlantı hatası:', err.message);
    process.exit(1);
  }
};

connectDB();

// HTTP sunucusu oluştur
const server = http.createServer(app);

// Socket.IO kurulumu
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Aktif kullanıcıları izle
let onlineUsers = 0;
let monthlyVisitors = 0;

// Bağlı soketi olan kullanıcıları izlemek için
const connectedClients = new Map(); // Socket ID ve son aktivite zamanını tutacak

// Düzenli olarak ziyaretçi istatistiklerini güncelle
const updateStats = async () => {
  try {
    // Veritabanından istatistikleri al
    const stats = await getLiveStats();
    
    // Veritabanı değerlerini kullan
    monthlyVisitors = stats.monthlyVisitors || 0;
    
    // 15 dakikadan eski bağlantıları temizle
    const fifteenMinutesAgo = Date.now() - (15 * 60 * 1000);
    for (const [socketId, lastActive] of connectedClients.entries()) {
      if (lastActive < fifteenMinutesAgo) {
        connectedClients.delete(socketId);
      }
    }
    
    // Aktif kullanıcı sayısını güncelle
    onlineUsers = Math.max(1, connectedClients.size);
    
    // Tüm bağlı istemcilere güncel istatistikleri gönder
    io.emit('stats', {
      monthlyVisitors,
      onlineUsers
    });
  } catch (err) {
    console.error('İstatistikler güncellenirken hata oluştu:', err);
    // Hata durumunda varsayılan değerleri gönder
    io.emit('stats', { 
      onlineUsers: Math.max(1, connectedClients.size),
      monthlyVisitors: 0
    });
  }
};

// Her 30 saniyede bir istatistikleri güncelle
setInterval(updateStats, 30000);

io.on('connection', async (socket) => {
  console.log('Yeni bir kullanıcı bağlandı:', socket.id);
  
  // Yeni bağlantıyı kaydet ve son aktivite zamanını güncelle
  connectedClients.set(socket.id, Date.now());
  
  // İlk bağlantıda mevcut istatistikleri gönder
  const stats = await getLiveStats();
  socket.emit('stats', {
    onlineUsers: Math.max(1, connectedClients.size),
    monthlyVisitors: stats.monthlyVisitors || 0
  });
  
  // Her 10 saniyede bir aktivite güncellemesi al
  const activityInterval = setInterval(() => {
    connectedClients.set(socket.id, Date.now());
  }, 10000);
  
  // Bağlantı kesildiğinde
  socket.on('disconnect', () => {
    console.log('Kullanıcı ayrıldı:', socket.id);
    connectedClients.delete(socket.id);
    clearInterval(activityInterval);
    
    // İstatistikleri güncelle ve tüm istemcilere gönder
    updateStats();
  });
  
  // Hata durumunda temizlik yap
  socket.on('error', (error) => {
    console.error('Socket hatası:', error);
    connectedClients.delete(socket.id);
    clearInterval(activityInterval);
    updateStats();
  });
  
  // getStats isteği geldiğinde güncel istatistikleri gönder
  socket.on('getStats', async () => {
    try {
      const stats = await getLiveStats();
      socket.emit('stats', {
        onlineUsers: Math.max(1, connectedClients.size),
        monthlyVisitors: stats.monthlyVisitors || 0
      });
    } catch (err) {
      console.error('İstatistikler gönderilirken hata:', err);
      socket.emit('stats', {
        onlineUsers: 1,
        monthlyVisitors: 0
      });
    }
  });
  
  // Kullanıcı bağlantısı kesildiğinde
  socket.on('disconnect', () => {
    console.log('Kullanıcı ayrıldı:', socket.id);
    // Kullanıcıyı bağlantı listesinden çıkar
    connectedClients.delete(socket.id);
    
    // İstatistikleri güncelle ve tüm istemcilere gönder
    updateStats();
  });
});

// Port numarası
const PORT = process.env.PORT || 5000;

// Sunucuyu başlat
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
