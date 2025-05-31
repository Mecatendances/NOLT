import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Dashboard,
  ShoppingCart,
  People,
  Settings,
  Campaign,
  Palette,
} from '@mui/icons-material';

interface ShopAdminLayoutProps {
  children: React.ReactNode;
}

const ShopAdminLayout: React.FC<ShopAdminLayoutProps> = ({ children }) => {
  const { shopId } = useParams<{ shopId: string }>();
  const location = useLocation();
  const theme = useTheme();

  const menuItems = [
    {
      text: 'Tableau de bord',
      icon: <Dashboard />,
      path: `/shops/${shopId}/admin/dashboard`,
    },
    {
      text: 'Catalogue',
      icon: <ShoppingCart />,
      path: `/shops/${shopId}/admin/catalog`,
    },
    {
      text: 'Commandes',
      icon: <ShoppingCart />,
      path: `/shops/${shopId}/admin/orders`,
    },
    {
      text: 'Utilisateurs',
      icon: <People />,
      path: `/shops/${shopId}/admin/users`,
    },
    {
      text: 'Campagnes',
      icon: <Campaign />,
      path: `/shops/${shopId}/admin/campaigns`,
    },
    {
      text: 'Personnalisation',
      icon: <Palette />,
      path: `/shops/${shopId}/admin/branding`,
    },
    {
      text: 'Paramètres',
      icon: <Settings />,
      path: `/shops/${shopId}/admin/settings`,
    },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.default,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Box sx={{ overflow: 'auto', mt: 8 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                component="a"
                href={item.path}
                selected={location.pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.contrastText,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.primary,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          backgroundColor: theme.palette.background.default,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default ShopAdminLayout; 