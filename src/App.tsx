import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { useEffect } from 'react';
import { Navbar, Footer } from './components/Navigation';
import JournalPage from './pages/Journal';
import ArticlePage from './pages/Article';
import PortfolioPage from './pages/Portfolio';
import DashboardPage from './pages/Dashboard';
import AboutPage from './pages/About';
import ArchivePage from './pages/Archive';
import WritePostPage from './pages/WritePost';
import SignInPage from './pages/SignIn';
import AnalyticsPage from './pages/Analytics';
import SettingsPage from './pages/Settings';
import { analyticsClient } from './lib/analyticsService';

// Auth guard component
function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuth = sessionStorage.getItem('editorial_auth') === 'true';
  if (!isAuth) {
    return <Navigate to="/sign-in" replace />;
  }
  return <>{children}</>;
}

// Analytics tracker — sends page views + heartbeat on every route change
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    analyticsClient.trackPageView(location.pathname);
  }, [location.pathname]);

  // Heartbeat every 10 seconds to track active users
  useEffect(() => {
    analyticsClient.heartbeat();
    const interval = setInterval(() => {
      analyticsClient.heartbeat();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <div key={location.pathname}>
        <Routes location={location}>
          {/* Public routes */}
          <Route path="/" element={<JournalPage />} />
          <Route path="/article/:id" element={<ArticlePage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/sign-in" element={<SignInPage />} />

          {/* Protected admin routes */}
          <Route path="/admin" element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/admin/write" element={<RequireAuth><WritePostPage /></RequireAuth>} />
          <Route path="/admin/edit/:id" element={<RequireAuth><WritePostPage /></RequireAuth>} />
          <Route path="/admin/analytics" element={<RequireAuth><AnalyticsPage /></RequireAuth>} />
          <Route path="/admin/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
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
        <AnalyticsTracker />
        <main className="flex-grow">
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
    </Router>
  );
}
