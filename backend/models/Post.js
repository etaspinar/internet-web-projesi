const mongoose = require('mongoose');
const slugify = require('slugify');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Başlık zorunludur'],
    trim: true,
    maxlength: [100, 'Başlık 100 karakterden uzun olamaz']
  },
  slug: {
    type: String,
    unique: true
  },
  summary: {
    type: String,
    required: [true, 'Özet zorunludur'],
    maxlength: [400, 'Özet 400 karakterden uzun olamaz']
  },
  content: {
    type: String,
    required: [true, 'İçerik zorunludur']
  },
  image: {
    type: String,
    default: 'no-image.jpg'
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: true
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Slug oluşturma
PostSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      locale: 'tr'
    });
  }
  
  if (this.isModified('content') || this.isModified('title') || this.isModified('summary')) {
    this.updatedAt = Date.now();
  }
  
  next();
});

// Popüler yazıları getir (static)
PostSchema.statics.getPopularPosts = function(limit = 5) {
  return this.find({ isPublished: true })
    .sort({ viewCount: -1 })
    .limit(limit)
    .populate('category', 'name slug');
};

// Yazı görüntülenme sayısını artır (method)
PostSchema.methods.incrementViewCount = async function() {
  this.viewCount += 1;
  await this.save();
  return this;
};

module.exports = mongoose.model('Post', PostSchema);
