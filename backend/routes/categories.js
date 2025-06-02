const express = require('express');
const router = express.Router();
const { 
  getCategories, 
  getCategory, 
  getCategoryBySlug, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} = require('../controllers/categoryController');
const isAdmin = require('../middlewares/isAdmin');
const { csrfProtection } = require('../middlewares/csrfProtection');

// Public route'lar
router.get('/', getCategories);
router.get('/:id', getCategory);
router.get('/slug/:slug', getCategoryBySlug);

// Admin route'ları
router.post('/', isAdmin, csrfProtection, createCategory); // önce isAdmin, sonra CSRF koruması
router.put('/:id', isAdmin, updateCategory);
router.delete('/:id', isAdmin, deleteCategory);

module.exports = router;
