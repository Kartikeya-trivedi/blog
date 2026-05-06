import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Navbar, Footer } from './components/Navigation';
import JournalPage from './pages/Journal';
import ArticlePage from './pages/Article';
import PortfolioPage from './pages/Portfolio';
import DashboardPage from './pages/Dashboard';
import AboutPage from './pages/About';
import ArchivePage from './pages/Archive';
import WritePostPage from './pages/WritePost';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <div key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<JournalPage />} />
          <Route path="/article/:id" element={<ArticlePage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/write" element={<WritePostPage />} />
          <Route path="/admin/edit/:id" element={<WritePostPage />} />
        </Routes>
      </div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
    </Router>
  );
}

