import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  FileText, 
  CheckSquare, 
  MessageSquare, 
  LogOut, 
  Menu, 
  X,
  User
} from 'lucide-react';

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: Home },
    { path: '/notes', name: 'Notes', icon: FileText },
    { path: '/tasks', name: 'Tasks', icon: CheckSquare },
    { path: '/chat', name: 'AI Chat', icon: MessageSquare },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex items-center justify-center h-16 bg-blue-600">
            <h1 className="text-xl font-bold text-white">Productivity Assistant</h1>
          </div>
          
          <div className="flex-grow flex flex-col mt-5">
            <nav className="flex-1 px-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">{user?.username}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-3 p-2 text-gray-400 hover:text-gray-600"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="bg-blue-600 px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">Productivity Assistant</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="bg-white border-b border-gray-200">
            <nav className="px-2 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      isActive(item.path)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex items-center px-4 py-2">
                  <User className="mr-3 h-5 w-5 text-gray-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="md:pl-64">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
