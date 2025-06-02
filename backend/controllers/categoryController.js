const Category = require('../models/Category');
const Post = require('../models/Post');

// @desc    Tüm kategorileri getir
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    console.log('Kategoriler getiriliyor...');
    const categories = await Category.find().sort('name');
    console.log(`${categories.length} kategori bulundu`);
    
    // Kategori listesini logla
    if (categories.length > 0) {
      console.log('Kategoriler:', categories.map(cat => ({
        id: cat._id,
        name: cat.name,
        slug: cat.slug
      })));
    } else {
      console.log('Kategori bulunamadı!');
    }

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    console.error('Kategorileri getirirken hata:', err);
    res.status(500).json({
      success: false,
      message: 'Kategoriler yüklenirken bir hata oluştu: ' + err.message
    });
  }
};

// @desc    Tek bir kategori getir
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Slug ile kategori getir
// @route   GET /api/categories/slug/:slug
// @access  Public
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Yeni kategori oluştur
// @route   POST /api/categories
// @access  Private (Admin)
exports.createCategory = async (req, res) => {
  try {
    console.log('Kategori oluşturma isteği alındı');
    console.log('Request headers:', req.headers);
    console.log('Request cookies:', req.cookies);
    console.log('Request body:', req.body);
    
    // CSRF token bilgisini req.body'den çıkar
    const { _csrf, ...categoryData } = req.body;
    
    const category = await Category.create(categoryData);

    console.log('Kategori başarıyla oluşturuldu:', category);
    
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (err) {
    console.error('Kategori oluşturma hatası:', err);
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Kategori güncelle
// @route   PUT /api/categories/:id
// @access  Private (Admin)
exports.updateCategory = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Kategori sil
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }

    // Kategoriye ait yazıları kontrol et
    const posts = await Post.countDocuments({ category: req.params.id });

    if (posts > 0) {
      return res.status(400).json({
        success: false,
        message: `Bu kategoriye ait ${posts} yazı bulunmaktadır. Önce yazıları silmelisiniz.`
      });
    }
    await Category.deleteOne({ _id: req.params.id });

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
};
