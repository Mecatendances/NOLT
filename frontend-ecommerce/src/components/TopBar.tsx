import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserCircle, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import { UserRole } from '../types/userRole';

export function TopBar() {
  const { isAuthenticated, user, logout, hasRole } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
      <Link to="/home" className="text-lg font-thunder text-nolt-orange hover:text-nolt-yellow transition-colors">
        FC CHALON
      </Link>

      <div className="relative">
        {!isAuthenticated ? (
          <Link to="/login" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-montserrat text-white bg-nolt-orange rounded-lg hover:bg-nolt-yellow hover:text-nolt-black transition-colors">
            Se connecter
          </Link>
        ) : (
          <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
            <UserCircle className="h-5 w-5 text-nolt-orange" />
            <span className="font-montserrat text-sm">{user!.name}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        )}

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-50">Mon profil</Link>
            {hasRole(UserRole.ADMIN, UserRole.SUPERADMIN) && (
              <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
            )}
            <button onClick={() => { logout(); navigate('/home'); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
              <LogOut className="h-4 w-4" /> Déconnexion
            </button>
          </div>
        )}
      </div>
    </header>
  );
} 