const Post = require('../models/Post');
const Category = require('../models/Category');

// @desc    Sitemap.xml oluştur
// @route   GET /sitemap.xml
// @access  Public
exports.generateSitemap = async (req, res) => {
  try {
    // XML başlığı ayarla
    res.header('Content-Type', 'application/xml');
    
    // Sitemap başlangıcı
    let xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    
    // Ana sayfa
    xml += `
      <url>
        <loc>${process.env.CLIENT_URL || 'http://localhost:3000'}/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
    `;
    
    // Kategoriler sayfası
    xml += `
      <url>
        <loc>${process.env.CLIENT_URL || 'http://localhost:3000'}/kategoriler</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
    `;
    
    // Galeri sayfası
    xml += `
      <url>
        <loc>${process.env.CLIENT_URL || 'http://localhost:3000'}/galeri</loc>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>
    `;
    
    // Hakkımızda sayfası
    xml += `
      <url>
        <loc>${process.env.CLIENT_URL || 'http://localhost:3000'}/hakkimizda</loc>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
      </url>
    `;
    
    // İletişim sayfası
    xml += `
      <url>
        <loc>${process.env.CLIENT_URL || 'http://localhost:3000'}/iletisim</loc>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
      </url>
    `;
    
    try {
      // Kategorileri ekle
      const categories = await Category.find();
      
      categories.forEach(category => {
        xml += `
          <url>
            <loc>${process.env.CLIENT_URL || 'http://localhost:3000'}/kategori/${category.slug}</loc>
            <changefreq>weekly</changefreq>
            <priority>0.7</priority>
          </url>
        `;
      });
      
      // Yazıları ekle
      const posts = await Post.find().populate('category');
      
      posts.forEach(post => {
        xml += `
          <url>
            <loc>${process.env.CLIENT_URL || 'http://localhost:3000'}/haber/${post.slug}</loc>
            <changefreq>weekly</changefreq>
            <priority>0.6</priority>
            ${post.updatedAt ? `<lastmod>${post.updatedAt.toISOString()}</lastmod>` : ''}
          </url>
        `;
      });
    } catch (dbErr) {
      console.error('Veritabanı sorgusu sırasında hata:', dbErr);
      // Veritabanı hatası olsa bile devam et, en azından statik sayfaları gösterelim
    }
    
    // Sitemap sonlandır
    xml += '</urlset>';
    
    // XML'i yanıt olarak gönder
    res.send(xml);
  } catch (err) {
    console.error('Sitemap oluşturulurken hata:', err);
    res.status(500).send('Sitemap oluşturulurken bir hata oluştu');
  }
};
