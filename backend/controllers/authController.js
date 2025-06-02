const User = require('../models/User');
const jwt = require('jsonwebtoken');

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const expiresIn = process.env.JWT_COOKIE_EXPIRE || 30;

  const options = {
    expires: new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt 
      },
      message: statusCode === 201 ? 'Hesabınız başarıyla oluşturuldu!' : 'Giriş başarılı!'
    });
};


exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu e-posta adresi ile daha önce hesap oluşturulmuş.'
      });
    }
    const user = await User.create({
      name,
      email,
      password
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    let errorMessage = 'Kayıt olurken bir hata oluştu.';

    if (err.code === 11000) {
      errorMessage = 'Bu e-posta adresi ile daha önce hesap oluşturulmuş.';
    } else if (err.name === 'ValidationError') {
      errorMessage = Object.values(err.errors).map(val => val.message).join(', ');
    }

    res.status(400).json({
      success: false,
      message: errorMessage
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Email ve şifre kontrolü
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen e-posta ve şifre giriniz'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Bu e-posta adresiyle kayıtlı bir hesap bulunamadı'
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Hatalı şifre girdiniz'
      });
    }

    const fullUser = await User.findById(user._id);

    sendTokenResponse(fullUser, 200, res);
  } catch (err) {
    console.error('Giriş hatası:', err);
    res.status(500).json({
      success: false,
      message: 'Giriş yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
    });
  }
};


exports.logout = (req, res) => {
  // JWT token localStorage'da saklandığı için cookie temizlemeye gerek yok
  // Frontend tarafında localStorage.removeItem('user') yapılacak
  
  res.status(200).json({
    success: true,
    data: {},
    message: 'Çıkış başarılı!'
  });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcı bilgileri alınırken bir hata oluştu'
    });
  }
};


exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password, adminCode } = req.body;

   
    const correctAdminCode = process.env.ADMIN_CODE || 'teknoloji123';

    if (adminCode !== correctAdminCode) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz admin kodu'
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
   
      existingUser.role = 'admin';
      await existingUser.save();

      return res.status(200).json({
        success: true,
        message: 'Kullanıcı admin rolüne yükseltildi',
        data: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role
        }
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'admin'
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    let errorMessage = 'Admin kullanıcısı oluşturulurken bir hata oluştu.';

    if (err.code === 11000) {
      errorMessage = 'Bu e-posta adresi ile daha önce hesap oluşturulmuş.';
    } else if (err.name === 'ValidationError') {
      errorMessage = Object.values(err.errors).map(val => val.message).join(', ');
    }

    res.status(400).json({
      success: false,
      message: errorMessage
    });
  }
};
