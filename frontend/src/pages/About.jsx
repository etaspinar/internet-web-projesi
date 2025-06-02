import React from 'react';

const About = () => {
  return (
    <div>
      <h1 className="mb-4">Hakkımızda</h1>
      
      <div className="row">
        <div className="col-lg-6">
          <img 
            src="https://via.placeholder.com/600x400" 
            alt="Teknoloji Blogu Ekibi" 
            className="img-fluid rounded mb-4"
          />
        </div>
        <div className="col-lg-6">
          <h2>Teknoloji Blogu</h2>
          <p className="lead">
            Teknoloji dünyasındaki en güncel gelişmeleri ve haberleri sizlere sunuyoruz.
          </p>
          <p>
            2023 yılında kurulan Teknoloji Blogu, teknoloji meraklıları için güvenilir bir haber kaynağı olmayı hedeflemektedir. 
            Yapay zeka, yazılım, donanım, mobil teknolojiler ve daha birçok alanda güncel haberleri, incelemeleri ve analizleri 
            okuyucularımızla buluşturuyoruz.
          </p>
          <p>
            Deneyimli editör kadromuz ve teknoloji uzmanlarımızla birlikte, teknoloji dünyasındaki gelişmeleri yakından takip ediyor 
            ve sizlere en doğru bilgileri sunmak için çalışıyoruz.
          </p>
        </div>
      </div>
      
      <div className="row mt-5">
        <div className="col-12">
          <h3 className="mb-4">Misyonumuz</h3>
          <p>
            Teknoloji Blogu olarak misyonumuz, teknoloji dünyasındaki gelişmeleri herkesin anlayabileceği bir dille aktarmak ve 
            okuyucularımızı doğru bilgilerle buluşturmaktır. Tarafsız ve güvenilir habercilik anlayışımızla, teknoloji meraklılarının 
            başvuru kaynağı olmayı hedefliyoruz.
          </p>
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body text-center">
              <h5 className="card-title">Güncel</h5>
              <p className="card-text">
                Teknoloji dünyasındaki en son gelişmeleri anında sizlere ulaştırıyoruz.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body text-center">
              <h5 className="card-title">Güvenilir</h5>
              <p className="card-text">
                Haberlerimizi güvenilir kaynaklardan doğrulayarak sizlere sunuyoruz.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body text-center">
              <h5 className="card-title">Anlaşılır</h5>
              <p className="card-text">
                Karmaşık teknolojik gelişmeleri herkesin anlayabileceği bir dille aktarıyoruz.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-12">
          <h3 className="mb-4">Ekibimiz</h3>
          <div className="row row-cols-1 row-cols-md-3 g-4">
            <div className="col">
              <div className="card h-100">
                <img src="https://via.placeholder.com/300" className="card-img-top" alt="Takım Üyesi" />
                <div className="card-body">
                  <h5 className="card-title">Ahmet Yılmaz</h5>
                  <p className="card-text">Genel Yayın Yönetmeni</p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card h-100">
                <img src="https://via.placeholder.com/300" className="card-img-top" alt="Takım Üyesi" />
                <div className="card-body">
                  <h5 className="card-title">Ayşe Demir</h5>
                  <p className="card-text">Teknoloji Editörü</p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card h-100">
                <img src="https://via.placeholder.com/300" className="card-img-top" alt="Takım Üyesi" />
                <div className="card-body">
                  <h5 className="card-title">Mehmet Kaya</h5>
                  <p className="card-text">Yazılım Uzmanı</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
