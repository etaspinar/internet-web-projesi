const Post = require('../models/Post');
const Category = require('../models/Category');
const Gallery = require('../models/Gallery');

// @desc    Tüm yazıları getir
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    let query;
    
    // Kopya oluştur
    const reqQuery = { ...req.query };
    
    // Hariç tutulacak alanlar
    const removeFields = ['select', 'sort', 'page', 'limit'];
    
    // Hariç tutulan alanları kaldır
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Query string oluştur
    let queryStr = JSON.stringify(reqQuery);
    
    // Operatörleri ekle ($gt, $gte, vb.)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Sadece yayınlanmış yazıları getir (admin değilse)
    if (!req.user || req.user.role !== 'admin') {
      queryStr = JSON.parse(queryStr);
      queryStr.isPublished = true;
      queryStr = JSON.stringify(queryStr);
    }
    
    // Query oluştur
    query = Post.find(JSON.parse(queryStr));
    
    // Select alanları
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    
    // Sıralama
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Sayfalama
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Post.countDocuments(JSON.parse(queryStr));
    
    query = query.skip(startIndex).limit(limit);
    
    // Populate
    query = query.populate([
      { path: 'category', select: 'name slug' },
      { path: 'author', select: 'name' }
    ]);
    
    // Query çalıştır
    const posts = await query;
    
    // Sayfalama sonuçları
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: posts.length,
      pagination,
      data: posts
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Tek bir yazı getir
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate([
        { path: 'category', select: 'name slug' },
        { path: 'author', select: 'name' }
      ]);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Yazı bulunamadı'
      });
    }
    
    // Sadece yayınlanmış yazıları göster (admin değilse)
    if (!post.isPublished && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({
        success: false,
        message: 'Yazı bulunamadı'
      });
    }
    
    // Görüntülenme sayısını artır
    await post.incrementViewCount();
    
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Slug ile yazı getir
// @route   GET /api/posts/slug/:slug
// @access  Public
exports.getPostBySlug = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .populate([
        { path: 'category', select: 'name slug' },
        { path: 'author', select: 'name' }
      ]);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Yazı bulunamadı'
      });
    }
    
    // Sadece yayınlanmış yazıları göster (admin değilse)
    if (!post.isPublished && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({
        success: false,
        message: 'Yazı bulunamadı'
      });
    }
    
    // Görüntülenme sayısını artır
    await post.incrementViewCount();
    
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Kategoriye göre yazıları getir
// @route   GET /api/posts/category/:categoryId
// @access  Public
exports.getPostsByCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }
    
    const posts = await Post.find({ 
      category: req.params.categoryId,
      isPublished: true 
    })
      .sort('-createdAt')
      .populate([
        { path: 'category', select: 'name slug' },
        { path: 'author', select: 'name' }
      ]);
    
    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    İlgili yazıları getir
// @route   GET /api/posts/related/:id
// @access  Public
exports.getRelatedPosts = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Yazı bulunamadı'
      });
    }
    
    // Aynı kategorideki diğer yazıları getir
    const relatedPosts = await Post.find({
      _id: { $ne: req.params.id },
      category: req.query.categoryId || post.category,
      isPublished: true
    })
      .sort('-createdAt')
      .limit(5)
      .populate([
        { path: 'category', select: 'name slug' },
        { path: 'author', select: 'name' }
      ]);
    
    res.status(200).json({
      success: true,
      count: relatedPosts.length,
      data: relatedPosts
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Yeni yazı oluştur
// @route   POST /api/posts
// @access  Private (Admin)
exports.createPost = async (req, res) => {
  try {
    console.log('Yazı oluşturma isteği alındı:', req.body);
    
    // Kullanıcı kontrolü
    if (!req.user) {
      console.error('Kullanıcı bilgisi bulunamadı');
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme hatası: Lütfen tekrar giriş yapın'
      });
    }
    
    // Yazıyı oluşturan kullanıcıyı ekle
    req.body.author = req.user.id || req.user._id;
    
    // Kategori kontrolü
    if (!req.body.category) {
      console.error('Kategori belirtilmedi');
      return res.status(400).json({
        success: false,
        message: 'Kategori seçimi zorunludur'
      });
    }
    
    // Dosya yükleme işlemi
    let imageUrl = 'no-image.jpg';
    
    if (req.file) {
      // Dosya yüklendiysek, dosya yolunu ayarla
      imageUrl = `/uploads/posts/${req.file.filename}`;
      req.body.image = imageUrl;
      console.log('Resim yüklendi:', imageUrl);
    } else {
      console.log('Resim yüklenmedi, varsayılan resim kullanılacak');
    }
    
    // Kategorinin var olup olmadığını kontrol et
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      console.error('Validasyon hatası: Kategori bulunamadı:', req.body.category);
      return res.status(400).json({
        success: false,
        message: 'Seçilen kategori bulunamadı. Lütfen geçerli bir kategori seçin.'
      });
    }
    console.log('Kategori doğrulandı:', categoryExists.name);
    console.log('Yazı oluşturuluyor, yazar:', req.user.username || req.user.email);
    
    const post = await Post.create(req.body);
    console.log('Yazı başarıyla oluşturuldu, ID:', post._id);
    
    // Eğer resim varsa, galeri koleksiyonuna ekle
    if (imageUrl !== 'no-image.jpg') {
      try {
        const galleryItem = await Gallery.create({
          title: post.title,
          url: imageUrl,
          post: post._id
        });
        console.log('Galeri öğesi oluşturuldu:', galleryItem._id);
      } catch (galleryErr) {
        console.error('Galeri öğesi oluşturulurken hata:', galleryErr);
        // Galeri oluşturma hatası yazı oluşturmayı etkilemeyecek
      }
    }
    
    res.status(201).json({
      success: true,
      data: post
    });
  } catch (err) {
    console.error('Yazı oluşturma hatası:', err);
    
    // Mongoose validation hatası
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      console.error('Validasyon hataları:', messages);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    // Duplicate key hatası
    if (err.code === 11000) {
      console.error('Duplicate key hatası:', err.keyValue);
      return res.status(400).json({
        success: false,
        message: 'Bu başlıkla bir yazı zaten mevcut. Lütfen farklı bir başlık kullanın.'
      });
    }
    
    // Kategori referans hatası
    if (err.name === 'CastError' && err.path === 'category') {
      console.error('Kategori referans hatası:', err);
      return res.status(400).json({
        success: false,
        message: 'Geçersiz kategori referansı. Lütfen geçerli bir kategori seçin.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası: ' + err.message
    });
  }
};

// @desc    Yazı güncelle
// @route   PUT /api/posts/:id
// @access  Private (Admin)
exports.updatePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Yazı bulunamadı' });
    }

    // Güncellenecek alanları topla
    let updateData = { ...req.body, updatedAt: Date.now() };

    // Eğer yeni dosya yüklendiyse, image alanını güncelle
    if (req.file) {
      updateData.image = `/uploads/posts/${req.file.filename}`;
    }

    // Eğer kullanıcı görseli silmek istediyse (ör: frontend'den image: "" veya null gelirse)
    if (req.body.image === null || req.body.image === "" || req.body.image === "null") {
      updateData.image = "";
    }

    // Sadece gerekli alanları güncelle
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: updatedPost });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
// @desc    Yazı sil
// @route   DELETE /api/posts/:id
// @access  Private (Admin)
exports.deletePost = async (req, res) => {
  try {
    console.log('Silme isteği alındı, ID:', req.params.id);
    
    // Alternatif silme yöntemi: deleteOne kullan
    const result = await Post.deleteOne({ _id: req.params.id });
    
    console.log('Silme sonucu:', result);
    
    if (result.deletedCount === 0) {
      console.log('Yazı bulunamadı, ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Yazı bulunamadı'
      });
    }
    
    console.log('Yazı başarıyla silindi, ID:', req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Yazı başarıyla silindi',
      data: {}
    });
  } catch (err) {
    console.error('HATA YAKALANDI - Yazı silme hatası:');
    console.error('Hata Mesajı:', err.message);
    console.error('Hata Stack:', err.stack);
    console.error('Hata Detayları:', JSON.stringify(err, null, 2));
    console.error('Silme İsteği ID:', req.params.id);
    
    res.status(500).json({
      success: false,
      message: err.message || 'Sunucu hatası',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};
