import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ClipboardList,
  ChevronRight,
  LogOut,
  LucideIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/userRole';

// Définir un type pour les éléments de navigation
interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
  exact?: boolean;
  action?: () => void;
}

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, hasRole } = useAuth();
  
  // ID de la boutique actuelle (première boutique licenciée ou valeur par défaut)
  const myShopId = user?.licenseeShops?.[0] ?? '183';
  
  // Navigation de base pour tous les administrateurs
  const baseNavigation: NavItem[] = [
    { 
      name: 'Tableau de bord', 
      path: '/admin', 
      icon: LayoutDashboard,
      exact: true 
    },
    {
      name: 'Commandes',
      path: '/admin/orders',
      icon: ClipboardList
    }
  ];
  
  // Options supplémentaires pour le SUPERADMIN uniquement
  const superAdminNavigation: NavItem[] = [
    { 
      name: 'Boutiques', 
      path: '/admin/shops', 
      icon: ShoppingBag,
      action: () => navigate('/admin/shops')
    },
    {
      name: 'Campagnes',
      path: '/admin/campaigns',
      icon: ClipboardList
    }
  ];
  
  // Options pour les ADMIN standard
  const adminNavigation: NavItem[] = [
    { 
      name: 'Produits', 
      path: '/admin/shops', 
      icon: ShoppingBag,
      action: () => navigate('/admin/shops')
    },
    {
      name: 'Campagnes',
      path: '/admin/campaigns',
      icon: ClipboardList
    }
  ];
  
  // Sélectionner les options de navigation en fonction du rôle
  const navigation: NavItem[] = [
    ...baseNavigation,
    ...(hasRole(UserRole.SUPERADMIN) ? superAdminNavigation : adminNavigation)
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Barre latérale */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-screen">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <a 
              href="https://wearenolt.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-2xl font-thunder text-nolt-orange hover:text-orange-600 transition-colors"
            >
              NOLT Admin
            </a>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => item.action ? item.action() : navigate(item.path)}
                className={`
                  w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors
                  ${isActive(item.path, item.exact)
                    ? 'bg-orange-50 text-nolt-orange'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
                <ChevronRight 
                  className={`
                    ml-auto h-4 w-4 transition-transform
                    ${isActive(item.path, item.exact) ? 'rotate-90' : ''}
                  `}
                />
              </button>
            ))}
          </nav>

          {/* Footer avec bouton de déconnexion */}
          <div className="p-4 border-t">
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 ml-64">
        {/* En-tête */}
        <header className="bg-white border-b border-gray-200 h-16 fixed right-0 left-64 z-10">
          <div className="px-8 h-full flex items-center justify-between">
            <h1 className="text-xl font-thunder text-gray-900">
              Administration
            </h1>
            {/* Bouton d'action rapide superadmin (suppprimé) */}
            <Link 
              to="/" 
              className="text-gray-500 hover:text-nolt-orange transition-colors"
            >
              Voir le site
            </Link>
          </div>
        </header>

        {/* Contenu */}
        <main className="p-8 mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}