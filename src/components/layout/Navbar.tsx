import { useAuth } from '../../contexts/AuthContext';
import { Plane, Home, Camera, Gift, User, LogOut } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <Plane className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-800">TravelHub</span>
          </div>

          {user && (
            <div className="flex items-center space-x-6">
              <button
                onClick={() => onNavigate('home')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition ${
                  currentPage === 'home' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Home</span>
              </button>

              <button
                onClick={() => onNavigate('dashboard')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition ${
                  currentPage === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>

              <button
                onClick={() => onNavigate('photos')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition ${
                  currentPage === 'photos' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Camera className="w-5 h-5" />
                <span className="hidden sm:inline">Photos</span>
              </button>

              <button
                onClick={() => onNavigate('rewards')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition ${
                  currentPage === 'rewards' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Gift className="w-5 h-5" />
                <span className="hidden sm:inline">Rewards</span>
              </button>

              <button
                onClick={signOut}
                className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
