const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const isAdmin = require('../middlewares/isAdmin');
const { csrfProtection } = require('../middlewares/csrfProtection');

// @desc    Tüm galeri resimlerini getir
// @route   GET /api/gallery
// @access  Public
router.get('/', async (req, res) => {
  try {
    const images = await Gallery.find()
      .sort('-createdAt')
      .populate('post', 'title slug');

    res.status(200).json({
      success: true,
      count: images.length,
      data: images
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Tek bir galeri resmi getir
// @route   GET /api/gallery/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id)
      .populate('post', 'title slug');

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Resim bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: image
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Yeni galeri resmi ekle
// @route   POST /api/gallery
// @access  Private (Admin)
router.post('/', isAdmin, csrfProtection, async (req, res) => {
  try {
    const image = await Gallery.create(req.body);

    res.status(201).json({
      success: true,
      data: image
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Galeri resmi güncelle
// @route   PUT /api/gallery/:id
// @access  Private (Admin)
router.put('/:id', isAdmin, csrfProtection, async (req, res) => {
  try {
    let image = await Gallery.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Resim bulunamadı'
      });
    }

    image = await Gallery.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: image
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

// @desc    Galeri resmi sil
// @route   DELETE /api/gallery/:id
// @access  Private (Admin)
router.delete('/:id', isAdmin, csrfProtection, async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Resim bulunamadı'
      });
    }

    await image.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;
