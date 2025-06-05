import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { 
  PhotoCamera, 
  Delete as DeleteIcon, 
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Store as StoreIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import { useAuth } from '../../../contexts/AuthContext';
import { adminApi } from '../../../services/api';
import { getImageUrl } from '../../../utils/getImageUrl';

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

export function ShopBrandingSettings() {
  const { id: shopId } = useParams<{ id: string }>();
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
  const [currentTab, setCurrentTab] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [defaultSettings, setDefaultSettings] = useState<BrandingSettings | null>(null);

  useEffect(() => {
    if (shopId) {
      console.log("[ShopBrandingSettings] shopId utilisé pour l'API :", shopId);
      fetchSettings();
    } else {
      console.warn("[ShopBrandingSettings] Aucun shopId trouvé dans l'URL, aucune requête API envoyée.");
    }
  }, [shopId]);

  const fetchSettings = async () => {
    if (!shopId) {
      setError('Aucun identifiant de boutique trouvé.');
      return;
    }
    try {
      setLoading(true);
      const response = await adminApi.getBrandingSettings({ shopId });
      setSettings(response.data);
      setDefaultSettings(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon' | 'coverImage') => {
    if (!shopId) {
      setError('Aucun identifiant de boutique trouvé.');
      return;
    }
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
    if (!shopId) {
      setError('Aucun identifiant de boutique trouvé.');
      return;
    }
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

  const handleReset = () => {
    if (defaultSettings) {
      setSettings(defaultSettings);
      setSuccess('Paramètres réinitialisés');
    }
  };

  const handleDeleteImage = async (type: 'logo' | 'favicon' | 'coverImage') => {
    if (!shopId) {
      setError('Aucun identifiant de boutique trouvé.');
      return;
    }
    try {
      setLoading(true);
      await adminApi.deleteBrandingImage(type, { shopId });
      setSettings(prev => ({ ...prev, [type]: undefined }));
      setSuccess('Image supprimée avec succès');
    } catch (err) {
      setError('Erreur lors de la suppression de l\'image');
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Personnalisation de la boutique
        </Typography>
        <Box display="flex" gap={2}>
          <Tooltip title="Voir la boutique">
            <Button
              variant="outlined"
              startIcon={<StoreIcon />}
              component={Link}
              to={`/public/shops/${shopId}`}
              target="_blank"
            >
              Voir la boutique
            </Button>
          </Tooltip>
          <Tooltip title="Aperçu des changements">
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={() => setPreviewOpen(true)}
            >
              Aperçu
            </Button>
          </Tooltip>
          <Tooltip title="Réinitialiser les paramètres">
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleReset}
            >
              Réinitialiser
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Images" />
          <Tab label="Informations" />
          <Tab label="Couleurs" />
          <Tab label="Réseaux sociaux" />
        </Tabs>

        <CardContent>
          <Grid container spacing={3}>
            {currentTab === 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Images
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Box textAlign="center">
                      <Typography variant="subtitle1" gutterBottom>Logo</Typography>
                      {settings.logo && (
                        <Box mb={1} position="relative">
                          <img src={getImageUrl(settings.logo)} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100px' }} />
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteImage('logo')}
                            sx={{ position: 'absolute', top: 0, right: 0 }}
                          >
                            <DeleteIcon />
                          </IconButton>
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
                        <Box mb={1} position="relative">
                          <img src={getImageUrl(settings.favicon)} alt="Favicon" style={{ maxWidth: '32px', maxHeight: '32px' }} />
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteImage('favicon')}
                            sx={{ position: 'absolute', top: 0, right: 0 }}
                          >
                            <DeleteIcon />
                          </IconButton>
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
                        <Box mb={2}>
                          <img src={getImageUrl(settings.coverImage)} alt="Cover" style={{ maxWidth: '100%', maxHeight: '100px', objectFit: 'cover', borderRadius: 8 }} />
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
            )}

            {currentTab === 1 && (
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
                      InputProps={{
                        endAdornment: (
                          <Tooltip title="Le nom qui apparaîtra dans l'en-tête de votre boutique">
                            <IconButton size="small">
                              <HelpIcon />
                            </IconButton>
                          </Tooltip>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email de contact"
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                      InputProps={{
                        endAdornment: (
                          <Tooltip title="L'email qui sera affiché pour les contacts">
                            <IconButton size="small">
                              <HelpIcon />
                            </IconButton>
                          </Tooltip>
                        ),
                      }}
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
                      InputProps={{
                        endAdornment: (
                          <Tooltip title="La description qui apparaîtra dans les moteurs de recherche">
                            <IconButton size="small">
                              <HelpIcon />
                            </IconButton>
                          </Tooltip>
                        ),
                      }}
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
                      InputProps={{
                        endAdornment: (
                          <Tooltip title="Le texte qui apparaîtra en bas de toutes les pages">
                            <IconButton size="small">
                              <HelpIcon />
                            </IconButton>
                          </Tooltip>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            )}

            {currentTab === 2 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Couleurs
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Couleur primaire
                        <Tooltip title="La couleur principale de votre boutique">
                          <IconButton size="small">
                            <HelpIcon />
                          </IconButton>
                        </Tooltip>
                      </Typography>
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
                      <Typography variant="subtitle1" gutterBottom>
                        Couleur secondaire
                        <Tooltip title="La couleur d'accent de votre boutique">
                          <IconButton size="small">
                            <HelpIcon />
                          </IconButton>
                        </Tooltip>
                      </Typography>
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
            )}

            {currentTab === 3 && (
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
                      InputProps={{
                        endAdornment: (
                          <Tooltip title="L'URL de votre page Facebook">
                            <IconButton size="small">
                              <HelpIcon />
                            </IconButton>
                          </Tooltip>
                        ),
                      }}
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
                      InputProps={{
                        endAdornment: (
                          <Tooltip title="L'URL de votre compte Twitter">
                            <IconButton size="small">
                              <HelpIcon />
                            </IconButton>
                          </Tooltip>
                        ),
                      }}
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
                      InputProps={{
                        endAdornment: (
                          <Tooltip title="L'URL de votre compte Instagram">
                            <IconButton size="small">
                              <HelpIcon />
                            </IconButton>
                          </Tooltip>
                        ),
                      }}
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
                      InputProps={{
                        endAdornment: (
                          <Tooltip title="L'URL de votre profil LinkedIn">
                            <IconButton size="small">
                              <HelpIcon />
                            </IconButton>
                          </Tooltip>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={3}>
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

      {/* Dialog d'aperçu */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Aperçu de la personnalisation</DialogTitle>
        <DialogContent>
          <Box p={2}>
            <Typography variant="h6" gutterBottom>
              {settings.name}
            </Typography>
            {settings.logo && (
              <Box mb={2}>
                <img src={getImageUrl(settings.logo)} alt="Logo" style={{ maxHeight: '100px' }} />
              </Box>
            )}
            <Typography variant="body1" paragraph>
              {settings.description}
            </Typography>
            <Box display="flex" gap={2} mt={2}>
              <Box
                width={100}
                height={100}
                bgcolor={settings.primaryColor}
                borderRadius={1}
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
              >
                Primaire
              </Box>
              <Box
                width={100}
                height={100}
                bgcolor={settings.secondaryColor}
                borderRadius={1}
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
              >
                Secondaire
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 