import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Shop } from '../../types/shop';
import { Card, CardContent, Typography, Grid, Button, Box } from '@mui/material';

export const MyAdminShops: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await api.get('/shops/admin/my-shops');
        setShops(response.data);
        setLoading(false);
      } catch (err) {
        setError('Impossible de charger les boutiques');
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  if (loading) {
    return <Typography>Chargement des boutiques...</Typography>;
  }
  if (error) {
    return <Typography color="error">{error}</Typography>;
  }
  if (shops.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Vous n'administrez aucune boutique
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/shops')}
          sx={{ mt: 2 }}
        >
          Voir toutes les boutiques
        </Button>
      </Box>
    );
  }
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mes boutiques
      </Typography>
      <Grid container spacing={3}>
        {shops.map((shop) => (
          <Grid item xs={12} sm={6} md={4} key={shop.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {shop.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {shop.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    component={Link}
                    to={`/shops/${shop.id}/admin`}
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    Gérer la boutique
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}; 