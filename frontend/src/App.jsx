import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './styles/App.css';

// Pages
import Home from './pages/Home';
import Categories from './pages/Categories';
import PostDetail from './pages/PostDetail';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import CreateAdmin from './pages/CreateAdmin';
import CreatePost from './pages/CreatePost';
import CreateCategory from './pages/CreateCategory';
import UploadMedia from './pages/UploadMedia';
import Sitemap from './pages/Sitemap';
import NotFound from './pages/NotFound';
import AllPosts from './pages/AllPosts';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/kategoriler" element={<Categories />} />
            <Route path="/kategori/:categorySlug" element={<Categories />} />
            <Route path="/haber/:slug" element={<PostDetail />} />
            <Route path="/tum-icerikler" element={<AllPosts />} />
            <Route path="/galeri" element={<Gallery />} />
            <Route path="/hakkimizda" element={<About />} />
            <Route path="/iletisim" element={<Contact />} />
            <Route path="/giris" element={<Login />} />
            <Route path="/kayit" element={<Register />} />
            <Route path="/profil" element={<Profile />} />
            <Route path="/admin/post-olustur" element={<CreatePost />} />
            <Route path="/admin/kategori-olustur" element={<CreateCategory />} />
            <Route path="/admin/gorsel-ekle" element={<UploadMedia />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/create-admin" element={<CreateAdmin />} />
            <Route path="/sitemap.xml" element={<Sitemap />} />
            <Route path="/site-haritasi" element={<Sitemap />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
