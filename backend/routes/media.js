const express = require('express');
const router = express.Router();
const isAdmin = require('../middlewares/isAdmin');
const upload = require('../middlewares/uploadMiddleware');
const path = require('path');
const fs = require('fs');
const Gallery = require('../models/Gallery');

// Media klasörünü oluştur
const mediaDir = path.join(__dirname, '../uploads/gallery');
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

// Medya dosyalarını getir (Gallery koleksiyonundan)
router.get('/', async (req, res) => {
  try {
    const galleryFiles = await Gallery.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: galleryFiles.length,
      data: galleryFiles
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// Medya dosyası yükle ve Gallery koleksiyonuna kaydet
router.post('/upload', isAdmin, upload.array('files', 10), async function(req, res) {
  console.log('Medya yükleme isteği alındı');
  console.log('Dosya yolu:', req.originalUrl);
  console.log('Yüklenen dosyalar:', req.files?.map(f => f.path));
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen en az bir dosya seçin.'
      });
    }

    // Her dosya için Gallery koleksiyonuna kayıt oluştur
    const uploadedFiles = await Promise.all(req.files.map(async file => {
      const galleryDoc = new Gallery({
        url: `/uploads/gallery/${file.filename}`,
        title: file.originalname,
        description: '',
      });
      await galleryDoc.save();
      return galleryDoc;
    }));

    res.status(201).json({
      success: true,
      count: uploadedFiles.length,
      data: uploadedFiles
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// Medya dosyası sil (hem dosya sisteminden hem Gallery koleksiyonundan)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    // Önce Gallery'den bul
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Galeri kaydı bulunamadı.'
      });
    }
    // Dosya yolu
    const filePath = path.join(mediaDir, gallery.url.replace('/uploads/gallery/', ''));
    // Dosya sisteminden sil
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    // Gallery'den sil
    await gallery.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Medya başarıyla silindi.'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;
