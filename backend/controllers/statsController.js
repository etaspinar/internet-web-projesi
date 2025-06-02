const Visitor = require('../models/Visitor');

// Son 1 aylık ziyaretçi sayısını ve aktif kullanıcı sayısını getir
exports.getVisitorStats = async (req, res) => {
  try {
    // Son 1 ayın başlangıç tarihi
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    // Son 1 aydaki tekil ziyaretçi sayısı (sessionId'ye göre)
    const monthlyVisitorsCount = await Visitor.aggregate([
      {
        $match: {
          date: { $gte: oneMonthAgo }
        }
      },
      {
        $group: {
          _id: "$sessionId"
        }
      }
    ]);
    
    const monthlyVisitors = monthlyVisitorsCount.length;
    
    // Aktif kullanıcı sayısı (son 15 dakika içinde)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const onlineUsersCount = await Visitor.aggregate([
      {
        $match: {
          date: { $gte: fifteenMinutesAgo }
        }
      },
      {
        $group: {
          _id: "$sessionId"
        }
      }
    ]);
    
    const onlineUsers = onlineUsersCount.length;
    
    console.log(`API istatistikleri: Aylık ziyaretçi: ${monthlyVisitors}, Çevrimiçi: ${onlineUsers}`);
    
    res.status(200).json({
      success: true,
      data: {
        monthlyVisitors,
        onlineUsers
      }
    });
  } catch (err) {
    console.error('Ziyaretçi istatistikleri alınırken hata:', err);
    res.status(500).json({
      success: false,
      message: 'Ziyaretçi istatistikleri alınırken bir hata oluştu'
    });
  }
};

// Yeni ziyaretçi kaydı ekle
exports.recordVisit = async (req, res) => {
  try {
    const { ip, userAgent, path, sessionId } = req.body;
    
    // Yeni ziyaretçi kaydı oluştur
    await Visitor.create({
      ip,
      userAgent,
      path,
      sessionId,
      date: new Date()
    });
    
    res.status(201).json({
      success: true,
      message: 'Ziyaret kaydedildi'
    });
  } catch (err) {
    console.error('Ziyaret kaydedilirken hata:', err);
    res.status(500).json({
      success: false,
      message: 'Ziyaret kaydedilirken bir hata oluştu'
    });
  }
};

// Canlı istatistikleri WebSocket üzerinden gönderme işlemi için yardımcı fonksiyon
exports.getLiveStats = async () => {
  try {
    // Son 15 dakika içindeki aktif kullanıcı sayısı
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const onlineUsersCount = await Visitor.aggregate([
      {
        $match: {
          date: { $gte: fifteenMinutesAgo }
        }
      },
      {
        $group: {
          _id: "$sessionId"
        }
      }
    ]);

    // Son 1 aydaki tekil ziyaretçi sayısı
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const monthlyVisitorsCount = await Visitor.aggregate([
      {
        $match: {
          date: { $gte: oneMonthAgo }
        }
      },
      {
        $group: {
          _id: "$sessionId"
        }
      }
    ]);
    
    return {
      onlineUsers: onlineUsersCount.length,
      monthlyVisitors: monthlyVisitorsCount.length
    };
  } catch (error) {
    console.error('Canlı istatistikler alınırken hata:', error);
    return {
      onlineUsers: 0,
      monthlyVisitors: 0
    };
  }
};
