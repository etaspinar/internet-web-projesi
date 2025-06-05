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
