import { Link, useNavigate } from 'react-router-dom';
import { Share2, Map, LayoutDashboard, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
            <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-lg shadow-emerald-200">
              <Share2 size={24} />
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-800">
              Loca<span className="text-emerald-500">loop</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-1">
              <Map size={18} /> Discover
            </Link>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-semibold text-slate-800">{user.name}</span>
                    <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                      ⭐ {user.trustScore} Trust Score
                    </span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                >
                  <LogIn size={18} />
                  Log in
                </Link>
                <Link 
                  to="/register"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-200 rounded-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  <UserPlus size={18} />
                  Sign up
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
