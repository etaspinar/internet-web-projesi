const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const isAuth = require('../middlewares/isAuth');

// Posta yorum ekle
router.post('/:postId', isAuth, async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.create({
      post: req.params.postId,
      user: req.user._id,
      content
    });
    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Posta ait yorumları getir
router.get('/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
