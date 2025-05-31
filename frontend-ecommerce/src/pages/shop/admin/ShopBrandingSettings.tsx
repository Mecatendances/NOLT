import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import { useAuth } from '../../../contexts/AuthContext';
import { adminApi } from '../../../services/api';

interface BrandingSettings {
  name: string;
  description: string;
  footer: string;
  email: string;
  logo?: string;
  favicon?: string;
  coverImage?: string;
  primaryColor: string;
  secondaryColor: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

const ShopBrandingSettings: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const { user } = useAuth();
  const [settings, setSettings] = useState<BrandingSettings>({
    name: '',
    description: '',
    footer: '',
    email: '',
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    socialLinks: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<'primary' | 'secondary' | null>(null);

  useEffect(() => {
    if (shopId) {
      fetchSettings();
    }
  }, [shopId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getBrandingSettings({ shopId });
      setSettings(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon' | 'coverImage') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await adminApi.uploadBrandingImage(type, formData, { shopId });
      setSettings(prev => ({ ...prev, [type]: response.data.url }));
      setSuccess('Image téléchargée avec succès');
    } catch (err) {
      setError('Erreur lors du téléchargement de l\'image');
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await adminApi.updateBrandingSettings(settings, { shopId });
      setSuccess('Paramètres sauvegardés avec succès');
    } catch (err) {
      setError('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Personnalisation de la boutique
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {/* Images */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Images
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="subtitle1" gutterBottom>Logo</Typography>
                    {settings.logo && (
                      <Box mb={1}>
                        <img src={settings.logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100px' }} />
                      </Box>
                    )}
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="logo-upload"
                      type="file"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'logo')}
                    />
                    <label htmlFor="logo-upload">
                      <Button variant="outlined" component="span" startIcon={<PhotoCamera />}>
                        Choisir un logo
                      </Button>
                    </label>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="subtitle1" gutterBottom>Favicon</Typography>
                    {settings.favicon && (
                      <Box mb={1}>
                        <img src={settings.favicon} alt="Favicon" style={{ maxWidth: '100%', maxHeight: '32px' }} />
                      </Box>
                    )}
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="favicon-upload"
                      type="file"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'favicon')}
                    />
                    <label htmlFor="favicon-upload">
                      <Button variant="outlined" component="span" startIcon={<PhotoCamera />}>
                        Choisir un favicon
                      </Button>
                    </label>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="subtitle1" gutterBottom>Image de couverture</Typography>
                    {settings.coverImage && (
                      <Box mb={1}>
                        <img src={settings.coverImage} alt="Cover" style={{ maxWidth: '100%', maxHeight: '100px' }} />
                      </Box>
                    )}
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="cover-upload"
                      type="file"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'coverImage')}
                    />
                    <label htmlFor="cover-upload">
                      <Button variant="outlined" component="span" startIcon={<PhotoCamera />}>
                        Choisir une image
                      </Button>
                    </label>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Informations de base */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informations de base
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nom de la boutique"
                    value={settings.name}
                    onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email de contact"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={settings.description}
                    onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Footer"
                    multiline
                    rows={2}
                    value={settings.footer}
                    onChange={(e) => setSettings(prev => ({ ...prev, footer: e.target.value }))}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Couleurs */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Couleurs
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>Couleur primaire</Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        width={40}
                        height={40}
                        bgcolor={settings.primaryColor}
                        borderRadius={1}
                        onClick={() => setShowColorPicker('primary')}
                        sx={{ cursor: 'pointer' }}
                      />
                      <TextField
                        value={settings.primaryColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                      />
                    </Box>
                    {showColorPicker === 'primary' && (
                      <Box position="absolute" zIndex={2} mt={1}>
                        <Box position="fixed" top={0} right={0} bottom={0} left={0} onClick={() => setShowColorPicker(null)} />
                        <ChromePicker
                          color={settings.primaryColor}
                          onChange={(color) => setSettings(prev => ({ ...prev, primaryColor: color.hex }))}
                        />
                      </Box>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>Couleur secondaire</Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        width={40}
                        height={40}
                        bgcolor={settings.secondaryColor}
                        borderRadius={1}
                        onClick={() => setShowColorPicker('secondary')}
                        sx={{ cursor: 'pointer' }}
                      />
                      <TextField
                        value={settings.secondaryColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      />
                    </Box>
                    {showColorPicker === 'secondary' && (
                      <Box position="absolute" zIndex={2} mt={1}>
                        <Box position="fixed" top={0} right={0} bottom={0} left={0} onClick={() => setShowColorPicker(null)} />
                        <ChromePicker
                          color={settings.secondaryColor}
                          onChange={(color) => setSettings(prev => ({ ...prev, secondaryColor: color.hex }))}
                        />
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Liens sociaux */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Liens sociaux
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Facebook"
                    value={settings.socialLinks.facebook || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, facebook: e.target.value }
                    }))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Twitter"
                    value={settings.socialLinks.twitter || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                    }))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Instagram"
                    value={settings.socialLinks.instagram || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                    }))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="LinkedIn"
                    value={settings.socialLinks.linkedin || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                    }))}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  disabled={loading}
                >
                  Sauvegarder
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ShopBrandingSettings; 