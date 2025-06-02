const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Dosya yükleme klasörlerini oluştur
const createUploadDirectories = () => {
  const dirs = [
    './uploads',
    './uploads/posts',
    './uploads/categories',
    './uploads/users',
    './uploads/gallery'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Başlangıçta klasörleri oluştur
createUploadDirectories();

// Dosya depolama ayarları
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Dosya türüne göre farklı klasörlere kaydet
    let uploadPath = './uploads';
    
    if (req.originalUrl.includes('/posts')) {
      uploadPath = './uploads/posts';
    } else if (req.originalUrl.includes('/categories')) {
      uploadPath = './uploads/categories';
    } else if (req.originalUrl.includes('/users')) {
      uploadPath = './uploads/users';
    } else if (req.originalUrl.includes('/media')) {
      uploadPath = './uploads/gallery';
      console.log('Medya dosyası gallery klasörüne kaydediliyor:', uploadPath);
    }
    
    // Klasörün var olduğundan emin ol
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log(`${uploadPath} klasörü oluşturuldu`);
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Benzersiz dosya adı oluştur
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Dosya filtreleme
const fileFilter = (req, file, cb) => {
  // İzin verilen dosya türleri
  const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir! (JPEG, JPG, PNG, GIF, WEBP)'));
  }
};

// Multer ayarları
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

module.exports = upload;
