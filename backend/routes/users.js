const express = require('express');
const router = express.Router();
const User = require('../models/User');
const isAdmin = require('../middlewares/isAdmin');
const isAuth = require('../middlewares/isAuth');
const { csrfProtection } = require('../middlewares/csrfProtection');
const bcrypt = require('bcryptjs');

// Tüm kullanıcıları getir (sadece admin için)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Şifreyi gönderme
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Kullanıcılar alınamadı', error: err.message });
  }
});

// Kullanıcı güncelleme (sadece admin için)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      { name, email, role },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Kullanıcı güncellenemedi', error: err.message });
  }
});

// Kullanıcı silme (sadece admin için)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    console.log('Kullanıcı silme isteği alındı, ID:', req.params.id);
    
    // Önce kullanıcıyı bul
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Kullanıcıyı sil (Mongoose 7 ile uyumlu deleteOne() kullan)
    await User.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Kullanıcı başarıyla silindi' });
  } catch (err) {
    console.error('Kullanıcı silme hatası:', err);
    res.status(500).json({ message: 'Kullanıcı silinemedi', error: err.message });
  }
});

// Kendi profilini getir
router.get('/profile', isAuth, csrfProtection, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Profil alınamadı', error: err.message });
  }
});

// Kendi aktiviteleri: admin ise postlar, user ise yorumlar
router.get('/activities', isAuth, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      // Admin: kendi yazdığı postlar
      const posts = await require('../models/Post').find({ author: req.user._id })
        .select('title slug createdAt')
        .sort({ createdAt: -1 });
      return res.json({ type: 'posts', posts });
    } else {
      // User: kendi yazdığı yorumlar ve ilgili post başlığı
      const comments = await require('../models/Comment').find({ user: req.user._id })
        .populate({ path: 'post', select: 'title slug' })
        .select('content createdAt post');
      return res.json({ type: 'comments', comments });
    }
  } catch (err) {
    console.error('Aktivite çekme hatası:', err);
    res.status(500).json({ message: 'Aktiviteler alınamadı', error: err.message });
  }
});

// Yorum güncelle (sadece sahibi)
router.put('/comments/:id', isAuth, async (req, res) => {
  try {
    const comment = await require('../models/Comment').findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Yorum bulunamadı' });
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu yorumu sadece sahibi düzenleyebilir.' });
    }
    comment.content = req.body.content;
    await comment.save();
    res.json({ message: 'Yorum güncellendi.', comment });
  } catch (err) {
    console.error('Yorum güncelleme hatası:', err);
    res.status(500).json({ message: 'Yorum güncellenemedi', error: err.message });
  }
});

// Şifre güncelle
router.post('/change-password', isAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Eski ve yeni şifre gereklidir.' });
    }
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) return res.status(400).json({ message: 'Eski şifre yanlış.' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Şifre başarıyla güncellendi.' });
  } catch (err) {
    res.status(500).json({ message: 'Şifre güncellenemedi', error: err.message });
  }
});

module.exports = router;
