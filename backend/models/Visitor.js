const mongoose = require('mongoose');

const VisitorSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  path: {
    type: String,
    default: '/'
  },
  date: {
    type: Date,
    default: Date.now
  },
  // Tekil ziyaretçileri takip etmek için session ID
  sessionId: {
    type: String,
    required: true
  }
});

// İndeksler ekleyelim
VisitorSchema.index({ date: 1 });
VisitorSchema.index({ sessionId: 1 });
VisitorSchema.index({ ip: 1 });

module.exports = mongoose.model('Visitor', VisitorSchema);
