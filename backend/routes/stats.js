const express = require('express');
const router = express.Router();
const { getVisitorStats, recordVisit } = require('../controllers/statsController');
const Visitor = require('../models/Visitor');

// Ziyaretçi takibi için middleware
router.use(async (req, res, next) => {
  try {
    // Tüm istekleri kaydet - WebSocket ve bazı API isteklerini hariç tut
    if (!req.path.includes('socket.io') && !req.path.includes('/stats/visitors')) {
      // Session ID oluştur veya mevcut oturumu kullan
      const sessionId = req.cookies.sessionId || require('crypto').randomBytes(16).toString('hex');
      
      // Ziyaretçi bilgilerini kaydet
      await Visitor.create({
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        path: req.path,
        sessionId,
        date: new Date()
      });
      
      console.log(`Yeni ziyaret kaydedildi: ${req.path} - Session: ${sessionId.substring(0, 6)}...`);
      
      // Session ID'yi cookie olarak kaydet (eğer yoksa)
      if (!req.cookies.sessionId) {
        res.cookie('sessionId', sessionId, {
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 gün
          httpOnly: true,
          sameSite: 'lax' // Farklı sekmelerde çalışması için
        });
        console.log(`Yeni oturum oluşturuldu: ${sessionId.substring(0, 6)}...`);
      }
    }
  } catch (err) {
    console.error('Ziyaretçi kaydı sırasında hata:', err);
  }
  
  next();
});

// @desc    Ziyaretçi istatistiklerini getir (son 1 ay)
// @route   GET /api/stats/visitors
// @access  Public
router.get('/visitors', getVisitorStats);

// @desc    Ziyaret kaydet (manuel)
// @route   POST /api/stats/record-visit
// @access  Public
router.post('/record-visit', recordVisit);

// @desc    Popüler içerik istatistiklerini getir
// @route   GET /api/stats/popular
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const Post = require('../models/Post');
    
    // En çok görüntülenen yazıları getir
    const popularPosts = await Post.find({ isPublished: true })
      .sort('-viewCount')
      .limit(5)
      .select('title slug viewCount')
      .populate('category', 'name slug');
    
    res.status(200).json({
      success: true,
      data: {
        popularPosts
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;
