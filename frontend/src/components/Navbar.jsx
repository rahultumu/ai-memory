import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, LogOut, Search, Calendar, MessageSquare } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!token) {
    return (
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 text-blue-600 font-bold text-xl">
          <Brain className="w-6 h-6" />
          <span>AI Memory Companion</span>
        </div>
        <div className="space-x-4 text-sm font-medium">
          <Link to="/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
          <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition">Sign Up</Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="flex items-center space-x-2 text-blue-600 font-bold text-xl">
        <Brain className="w-6 h-6" />
        <span className="hidden sm:inline">Memory Companion</span>
      </Link>
      
      <div className="flex space-x-6 text-gray-500 font-medium text-sm items-center">
        <Link to="/" className="hover:text-blue-600 flex items-center space-x-1">
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        <Link to="/explorer" className="hover:text-blue-600 flex items-center space-x-1">
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Explore</span>
        </Link>
        <Link to="/chat" className="hover:text-blue-600 flex items-center space-x-1 mb-1 sm:mb-0">
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Chat</span>
        </Link>
        <button onClick={handleLogout} className="text-red-500 hover:text-red-600 flex items-center space-x-1">
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}
