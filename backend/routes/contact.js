const express = require('express');
const router = express.Router();
const { csrfProtection } = require('../middlewares/csrfProtection');

// @desc    İletişim formu gönderimi
// @route   POST /api/contact
// @access  Public
router.post('/', csrfProtection, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Form validasyonu
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen tüm alanları doldurun'
      });
    }

    // E-posta formatı kontrolü
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen geçerli bir e-posta adresi girin'
      });
    }

    // Gerçek uygulamada burada e-posta gönderimi yapılabilir
    // Örnek: nodemailer kullanarak e-posta gönderimi
    /*
    const nodemailer = require('nodemailer');
    
    // Transporter oluştur
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
    
    // E-posta gönder
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.CONTACT_EMAIL,
      subject: `İletişim Formu: ${subject}`,
      text: message,
      html: `
        <h3>İletişim Formu Mesajı</h3>
        <p><strong>İsim:</strong> ${name}</p>
        <p><strong>E-posta:</strong> ${email}</p>
        <p><strong>Konu:</strong> ${subject}</p>
        <p><strong>Mesaj:</strong> ${message}</p>
      `
    });
    */

    // Şimdilik sadece başarılı yanıt döndür
    res.status(200).json({
      success: true,
      message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.'
    });
  } catch (err) {
    console.error('İletişim formu hatası:', err);
    res.status(500).json({
      success: false,
      message: 'Mesajınız gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
    });
  }
});

module.exports = router;
