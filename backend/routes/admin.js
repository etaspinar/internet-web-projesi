const express = require('express');
const router = express.Router();
const isAdmin = require('../middlewares/isAdmin');
const { csrfProtection } = require('../middlewares/csrfProtection');
const multer = require('multer');
const path = require('path');

// Dosya yükleme için storage ayarları
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Dosya türü kontrolü
const fileFilter = (req, file, cb) => {
  // Sadece resim dosyalarını kabul et
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
  }
};

// Multer ayarları
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB
  },
  fileFilter: fileFilter
});

// Tüm admin route'ları için admin yetkisi kontrolü
router.use(isAdmin);

// Resim yükleme endpoint'i
router.post('/upload', csrfProtection, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen bir resim dosyası yükleyin'
      });
    }

    // Resim URL'sini döndür
    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      data: {
        url: imageUrl
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// Dashboard istatistikleri
router.get('/dashboard', csrfProtection, async (req, res) => {
  try {
    const Post = require('../models/Post');
    const Category = require('../models/Category');
    const User = require('../models/User');
    
    // İstatistikleri getir
    const stats = {
      totalPosts: await Post.countDocuments(),
      publishedPosts: await Post.countDocuments({ isPublished: true }),
      draftPosts: await Post.countDocuments({ isPublished: false }),
      totalCategories: await Category.countDocuments(),
      totalUsers: await User.countDocuments(),
      totalAdmins: await User.countDocuments({ role: 'admin' })
    };
    
    // Popüler yazıları getir
    const popularPosts = await Post.getPopularPosts(5);
    
    res.status(200).json({
      success: true,
      data: {
        stats,
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
