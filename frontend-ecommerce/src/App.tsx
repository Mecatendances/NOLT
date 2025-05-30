import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { RequireAuth } from './components/RequireAuth';
import { TopBar } from './components/TopBar';

// Layouts
import { AdminLayout } from './layouts/AdminLayout';

// Pages
import { HomePage } from './pages/HomePage';
import { Login } from './pages/auth/Login';
import { PublicShopsList } from './pages/shop/PublicShopsList';
import { PublicShopView } from './pages/shop/PublicShopView';
import { Checkout } from './pages/shop/Checkout';
import { ShopsList } from './pages/shop/ShopsList';
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
import AdminUsersList from './pages/admin/UsersList';
import { ShopDetails as AdminShopDetails } from './pages/admin/ShopDetails';
import ShopRolesPage from './pages/admin/ShopRolesPage';
import { MyAdminShops } from './components/shops/MyAdminShops';
import ShopAdminDashboard from './pages/shop/admin/Dashboard';
import ShopAdminOrders from './pages/shop/admin/Orders';
import ShopAdminCampaigns from './pages/shop/admin/Campaigns';
import ShopAdminUsers from './pages/shop/admin/Users';

const queryClient = new QueryClient();

function App() {
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
              <Route path="/checkout" element={<Checkout />} />
              
              {/* Routes d'administration */}
              <Route path="/admin" element={<RequireAuth requireAdmin={true}><AdminLayout /></RequireAuth>}>
                <Route index element={<Dashboard />} />
                <Route path="shops" element={<AdminShopCatalog />} />
                <Route path="shops/new" element={<CreateShop />} />
                <Route path="shops/:shopId/products" element={<ShopProducts />} />
                <Route path="pages" element={<Pages />} />
                <Route path="orders" element={<OrdersList />} />
                <Route path="orders/:id" element={<OrderDetail />} />
                <Route path="campaigns" element={<CampaignsList />} />
                <Route path="campaigns/:id" element={<CampaignDetail />} />
                <Route path="pages/new" element={<PageEditor />} />
                <Route path="pages/:id/edit" element={<PageEditor isEditing />} />
                <Route path="users" element={<AdminUsersList />} />
                <Route path="shops/:shopId" element={<AdminShopDetails />} />
                <Route path="shops/:shopId/roles" element={<ShopRolesPage />} />
              </Route>

              {/* Routes de gestion des boutiques */}
              <Route path="/shops" element={<RequireAuth><ShopsList /></RequireAuth>} />
              <Route path="/shops/:id" element={<RequireAuth><ShopDetails /></RequireAuth>}>
                <Route index element={<div>Bienvenue sur la boutique ! (à personnaliser)</div>} />
                <Route path="admin" element={<RequireAuth><ShopAdminDashboard /></RequireAuth>}>
                  <Route index element={<div>Bienvenue sur le dashboard de la boutique ! (à personnaliser)</div>} />
                  <Route path="orders" element={<ShopAdminOrders />} />
                  <Route path="campaigns" element={<ShopAdminCampaigns />} />
                  <Route path="users" element={<ShopAdminUsers />} />
                </Route>
              </Route>
              <Route path="/create-shop" element={<RequireAuth requireAdmin={true}><CreateShop /></RequireAuth>} />

              <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

              <Route path="/my-shops" element={<MyAdminShops />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;