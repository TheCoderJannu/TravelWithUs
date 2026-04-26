import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { Navbar } from './components/layout/Navbar';
import { HomePage } from './components/home/HomePage';
import { Dashboard } from './components/dashboard/Dashboard';
import { PhotoGallery } from './components/social/PhotoGallery';
import { RewardsPage } from './components/rewards/RewardsPage';

function AppContent() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentPage, setCurrentPage] = useState('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex items-center justify-center px-4 py-12">
        {authMode === 'login' ? (
          <Login onToggle={() => setAuthMode('register')} />
        ) : (
          <Register onToggle={() => setAuthMode('login')} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="py-8 px-4">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'photos' && <PhotoGallery />}
        {currentPage === 'rewards' && <RewardsPage />}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
