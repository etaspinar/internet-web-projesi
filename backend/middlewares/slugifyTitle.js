const slugify = require('slugify');

// Başlığı slug formatına dönüştüren middleware
const slugifyTitle = (req, res, next) => {
  if (req.body.title) {
    req.body.slug = slugify(req.body.title, {
      lower: true,
      strict: true,
      locale: 'tr'
    });
  }
  
  next();
};

module.exports = slugifyTitle;
