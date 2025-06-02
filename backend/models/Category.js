const mongoose = require('mongoose');
const slugify = require('slugify');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Kategori adı zorunludur'],
    unique: true,
    trim: true,
    maxlength: [50, 'Kategori adı 50 karakterden uzun olamaz']
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    maxlength: [500, 'Açıklama 500 karakterden uzun olamaz']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Slug oluşturma
CategorySchema.pre('save', function(next) {
  this.slug = slugify(this.name, {
    lower: true,
    strict: true,
    locale: 'tr'
  });
  next();
});

// Kategori ile ilişkili yazıları getir (virtual)
CategorySchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'category',
  justOne: false
});

module.exports = mongoose.model('Category', CategorySchema);
