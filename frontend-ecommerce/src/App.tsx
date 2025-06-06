import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { RequireAuth } from './components/RequireAuth';
import { TopBar } from './components/TopBar';
import { useBranding } from './hooks/useBranding';

// Layouts
import { AdminLayout } from './layouts/AdminLayout';
import { ShopAdminLayout } from './layouts/ShopAdminLayout';

// Pages
import { HomePage } from './pages/HomePage';
import { Login } from './pages/auth/Login';
import { PublicShopsList } from './pages/shop/PublicShopsList';
import { PublicShopView } from './pages/shop/PublicShopView';
import { Checkout } from './pages/shop/Checkout';
import { ShopsList } from './pages/admin/ShopsList';
import { CreateShop } from './pages/shop/CreateShop';
import { ShopDetails } from './pages/shop/ShopDetails';
import { Dashboard } from './pages/admin/Dashboard';
import { Pages } from './pages/admin/Pages';
import { PageEditor } from './pages/admin/PageEditor';
import { OrdersList } from './pages/admin/OrdersList';
import { OrderDetail } from './pages/admin/OrderDetail';
import { CampaignsList } from './pages/admin/CampaignsList';
import { CampaignDetail } from './pages/admin/CampaignDetail';
import { Profile } from './pages/Profile';
import { ShopProducts } from './pages/admin/ShopProducts';
import { AdminShopCatalog } from './pages/admin/AdminShopCatalog';
import { AdminUsersList } from './pages/admin/UsersList';
import { ShopDetails as AdminShopDetails } from './pages/admin/ShopDetails';
import { ShopRolesPage } from './pages/admin/ShopRolesPage';
import { MyAdminShops } from './components/shops/MyAdminShops';
import { ShopAdminDashboard } from './pages/shop/admin/Dashboard';
import { ShopAdminOrders } from './pages/shop/admin/Orders';
import { ShopAdminCampaigns } from './pages/shop/admin/Campaigns';
import { ShopAdminUsers } from './pages/shop/admin/Users';
import { Products } from './pages/shop/admin/Products';
import { Register } from './pages/Register';
import { EmailSettingsAdmin } from './pages/admin/EmailSettings';
import { IntegrationsAdmin } from './pages/admin/Integrations';
import { ShopIntegrations } from './pages/shop/admin/Integrations';
import { ShopBrandingSettings } from './pages/shop/admin/ShopBrandingSettings';
import { BrandingSettings } from './pages/admin/BrandingSettings';
import { OrderDetails } from './pages/shop/admin/OrderDetails';
import { CampaignsByShop } from './pages/admin/CampaignsByShop';

const queryClient = new QueryClient();

function App() {
  // Récupérer le branding global (favicon global par défaut)
  const { branding } = useBranding();

  useEffect(() => {
    if (branding?.favicon) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = branding.favicon;
    }
    // Couleurs dynamiques
    if (branding?.primaryColor) {
      document.documentElement.style.setProperty('--brand-primary', branding.primaryColor);
    }
    if (branding?.secondaryColor) {
      document.documentElement.style.setProperty('--brand-secondary', branding.secondaryColor);
    }
  }, [branding?.favicon, branding?.primaryColor, branding?.secondaryColor]);

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <TopBar />
            <Routes>
              {/* Redirect root to the shop */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              
              {/* Routes publiques */}
              <Route path="/home" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/public/shops" element={<PublicShopsList />} />
              <Route path="/public/shops/:id" element={<PublicShopView />} />
              <Route path="/checkout/:shopId" element={<Checkout />} />
              
              {/* Routes d'administration */}
              <Route path="/admin" element={<RequireAuth requireAdmin={true}><AdminLayout /></RequireAuth>}>
                <Route index element={<Dashboard />} />
                <Route path="shops" element={<ShopsList />} />
                <Route path="shops/new" element={<CreateShop />} />
                <Route path="shops/:shopId/products" element={<AdminShopCatalog />} />
                <Route path="pages" element={<Pages />} />
                <Route path="orders" element={<OrdersList />} />
                <Route path="orders/:id" element={<OrderDetail />} />
                <Route path="campaigns" element={<CampaignsList />} />
                <Route path="campaigns/by-shop" element={<CampaignsByShop />} />
                <Route path="campaigns/:id" element={<CampaignDetail />} />
                <Route path="pages/new" element={<PageEditor />} />
                <Route path="pages/:id/edit" element={<PageEditor isEditing />} />
                <Route path="users" element={<AdminUsersList />} />
                <Route path="shops/:shopId" element={<AdminShopDetails />} />
                <Route path="shops/:shopId/roles" element={<ShopRolesPage />} />
                <Route path="email-settings" element={<EmailSettingsAdmin />} />
                <Route path="integrations" element={<IntegrationsAdmin />} />
                <Route path="branding" element={<BrandingSettings />} />
              </Route>

              {/* Routes de gestion des boutiques */}
              <Route path="/shops/:id/admin" element={<RequireAuth><ShopAdminLayout /></RequireAuth>}>
                <Route index element={<ShopAdminDashboard />} />
                <Route path="orders" element={<ShopAdminOrders />} />
                <Route path="campaigns" element={<ShopAdminCampaigns />} />
                <Route path="users" element={<ShopAdminUsers />} />
                <Route path="products" element={<Products />} />
                <Route path="integrations" element={<ShopIntegrations />} />
                <Route path="branding" element={<ShopBrandingSettings />} />
                <Route path="orders/:orderId" element={<OrderDetails />} />
              </Route>
              <Route path="/shops/:id" element={<RequireAuth><ShopDetails /></RequireAuth>} />
              <Route path="/create-shop" element={<RequireAuth requireAdmin={true}><CreateShop /></RequireAuth>} />

              <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

              <Route path="/my-shops" element={<MyAdminShops />} />

              <Route path="/register" element={<Register />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;