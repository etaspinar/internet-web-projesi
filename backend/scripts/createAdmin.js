const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// .env dosyasını yükle
dotenv.config();

// User modelini içe aktar
const User = require('../models/User');

// MongoDB bağlantısı
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27018/tech-blog', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`MongoDB Bağlantısı Başarılı: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Hata: ${error.message}`);
    process.exit(1);
  }
};

// Admin kullanıcısı oluştur
const createAdmin = async () => {
  try {
    // Veritabanına bağlan
    await connectDB();

    // Admin kullanıcısı için bilgiler
    const adminData = {
      name: 'Admin Kullanıcı',
      email: 'admin@teknolojidunyasi.com',
      password: 'admin123456',
      role: 'admin'
    };

    // Önce bu e-posta ile bir kullanıcı var mı kontrol et
    const existingUser = await User.findOne({ email: adminData.email });

    if (existingUser) {
      console.log('Bu e-posta adresi ile bir kullanıcı zaten var!');
      
      // Eğer kullanıcı varsa ama admin değilse, admin yap
      if (existingUser.role !== 'admin') {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log('Kullanıcı admin rolüne yükseltildi!');
      } else {
        console.log('Kullanıcı zaten admin rolüne sahip.');
      }
    } else {
      // Yeni admin kullanıcısı oluştur
      const admin = await User.create(adminData);
      console.log(`Admin kullanıcısı oluşturuldu: ${admin.name} (${admin.email})`);
    }

    // Bağlantıyı kapat
    mongoose.connection.close();
    console.log('Veritabanı bağlantısı kapatıldı.');
    process.exit(0);
  } catch (error) {
    console.error(`Hata: ${error.message}`);
    process.exit(1);
  }
};

// Scripti çalıştır
createAdmin();
