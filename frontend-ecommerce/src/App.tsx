import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { RequireAuth } from './components/RequireAuth';

// Layouts
import { AdminLayout } from './layouts/AdminLayout';

// Pages
import { HomePage } from './pages/HomePage';
import { Login } from './pages/auth/Login';
import { PublicShopsList } from './pages/PublicShopsList';
import { PublicShopView } from './pages/shop/PublicShopView';
import { Checkout } from './pages/shop/Checkout';
import { ShopsList } from './pages/ShopsList';
import { CreateShop } from './pages/CreateShop';
import { ShopDetails } from './pages/ShopDetails';
import { Dashboard } from './pages/admin/Dashboard';
import { Pages } from './pages/admin/Pages';
import { PageEditor } from './pages/admin/PageEditor';
import { TestFCChalon } from './pages/TestFCChalon';
import { OrdersList } from './pages/admin/OrdersList';
import { OrderDetail } from './pages/admin/OrderDetail';
import { CampaignsList } from './pages/admin/CampaignsList';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* Redirect root to the shop */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              
              {/* Routes publiques */}
              <Route path="/home" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/public/shops" element={<PublicShopsList />} />
              <Route path="/public/shops/:id" element={<PublicShopView />} />
              <Route path="/checkout" element={<Checkout />} />
              
              {/* Page de test */}
              <Route path="/test-fc-chalon" element={<TestFCChalon />} />

              {/* Routes d'administration */}
              <Route path="/admin" element={<RequireAuth requireAdmin={true}><AdminLayout /></RequireAuth>}>
                <Route index element={<Dashboard />} />
                <Route path="shops" element={<ShopsList />} />
                <Route path="shops/new" element={<CreateShop />} />
                <Route path="pages" element={<Pages />} />
                <Route path="orders" element={<OrdersList />} />
                <Route path="orders/:id" element={<OrderDetail />} />
                <Route path="campaigns" element={<CampaignsList />} />
                <Route path="pages/new" element={<PageEditor />} />
                <Route path="pages/:id/edit" element={<PageEditor isEditing />} />
              </Route>

              {/* Routes de gestion des boutiques */}
              <Route path="/shops" element={<RequireAuth><ShopsList /></RequireAuth>} />
              <Route path="/shops/:id" element={<RequireAuth><ShopDetails /></RequireAuth>} />
              <Route path="/create-shop" element={<RequireAuth requireAdmin={true}><CreateShop /></RequireAuth>} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;