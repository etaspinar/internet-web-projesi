const express = require('express');
const router = express.Router();
const { 
  getPosts, 
  getPost, 
  getPostBySlug, 
  getPostsByCategory, 
  getRelatedPosts, 
  createPost, 
  updatePost, 
  deletePost 
} = require('../controllers/postController');
const isAdmin = require('../middlewares/isAdmin');
const { csrfProtection } = require('../middlewares/csrfProtection');
const slugifyTitle = require('../middlewares/slugifyTitle');
const upload = require('../middlewares/uploadMiddleware');

// Public route'lar
router.get('/', getPosts);
router.get('/:id', getPost);
router.get('/slug/:slug', getPostBySlug);
router.get('/category/:categoryId', getPostsByCategory);
router.get('/related/:id', getRelatedPosts);

// Admin route'ları
router.post('/', isAdmin, upload.single('image'), slugifyTitle, createPost);
router.put('/:id', isAdmin, upload.single('image'), slugifyTitle, updatePost);
router.delete('/:id', isAdmin, deletePost);

// En son eklenen postu getir
router.get('/latest', async (req, res) => {
  try {
    const post = await require('../models/Post').findOne({ isPublished: true })
      .sort({ createdAt: -1 })
      .populate('author', 'name')
      .populate('category', 'name');
    if (!post) return res.status(404).json({ message: 'Haber bulunamadı' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Son haber getirilemedi', error: err.message });
  }
});

module.exports = router;
