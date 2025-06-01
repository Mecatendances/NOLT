import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserCircle, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import { GlobalRole, ShopRole } from '../types/userRole';
import { useBranding } from '../hooks/useBranding';

export function TopBar() {
  const { isAuthenticated, user, logout, hasRole, hasShopRole } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  // Branding dynamique (global ou boutique si dans l'URL)
  const { branding } = useBranding(params.id);

  return (
    <header
      className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm"
      style={branding?.primaryColor ? { borderColor: branding.primaryColor } : {}}
    >
      <Link to="/home" className="flex items-center gap-2 text-lg font-thunder text-nolt-orange hover:text-nolt-yellow transition-colors">
        {branding?.logo ? (
          <img src={branding.logo} alt={branding.name || 'Logo'} className="h-10 w-auto max-w-[120px] object-contain" style={{ maxHeight: 40 }} />
        ) : (
          branding?.name || 'FC CHALON'
        )}
      </Link>

      <div className="flex items-center gap-4">
        {/* Bouton Administration visible uniquement pour le Super Admin */}
        {isAuthenticated && user?.role === GlobalRole.SUPERADMIN && (
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg bg-nolt-orange text-white hover:bg-nolt-yellow hover:text-nolt-black transition-colors"
          >
            Administration
          </Link>
        )}

        {/* Lien Mes boutiques pour les admins locaux */}
        {isAuthenticated && hasShopRole && hasShopRole(undefined, ShopRole.SHOP_ADMIN) && (
          <Link
            to="/my-shops"
            className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg bg-nolt-yellow text-nolt-black hover:bg-nolt-orange hover:text-white transition-colors"
          >
            Mes boutiques
          </Link>
        )}

        {!isAuthenticated ? (
          <>
            <Link to="/login" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-montserrat text-white bg-nolt-orange rounded-lg hover:bg-nolt-yellow hover:text-nolt-black transition-colors">
              Se connecter
            </Link>
            <Link to="/register" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-montserrat text-nolt-orange border border-nolt-orange rounded-lg hover:bg-nolt-yellow hover:text-nolt-black transition-colors ml-2">
              Créer un compte
            </Link>
          </>
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
            {hasRole(GlobalRole.ADMIN, GlobalRole.SUPERADMIN) && (
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