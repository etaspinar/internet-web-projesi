const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27018/tech-blog');
    console.log(`MongoDB bağlantısı başarılı: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB bağlantı hatası: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
