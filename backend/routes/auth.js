const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  logout, 
  getMe,
  createAdmin
} = require('../controllers/authController');
const isAdmin = require('../middlewares/isAdmin');

// Route'lar
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', isAdmin, getMe);
router.post('/create-admin', createAdmin);

module.exports = router;
