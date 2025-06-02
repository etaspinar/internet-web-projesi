const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Başlık 100 karakterden uzun olamaz']
  },
  description: {
    type: String,
    maxlength: [200, 'Açıklama 200 karakterden uzun olamaz']
  },
  url: {
    type: String,
    required: [true, 'Resim URL\'si zorunludur']
  },
  post: {
    type: mongoose.Schema.ObjectId,
    ref: 'Post'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Gallery', GallerySchema);
