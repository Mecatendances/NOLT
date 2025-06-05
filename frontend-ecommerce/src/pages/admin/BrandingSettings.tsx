import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
  Tabs,
  Tab,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import { PhotoCamera, Delete, InfoOutlined, Palette, HelpOutline, Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/api';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import axios from 'axios';
import { getImageUrl } from '../../utils/getImageUrl';

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
  landingTitle?: string;
  landingSlogan?: string;
  landingCoverImage?: string;
  dashboardTitle?: string;
  dashboardSlogan?: string;
  dashboardCoverImage?: string;
  footerText: string;
  contactEmail: string;
}

export function BrandingSettings() {
  const theme = useTheme();
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState<BrandingSettings>({
    name: '',
    description: '',
    footer: '',
    email: '',
    primaryColor: '#1976d2',
    secondaryColor: '#f50057',
    socialLinks: {},
    landingTitle: '',
    landingSlogan: '',
    landingCoverImage: '',
    dashboardTitle: '',
    dashboardSlogan: '',
    dashboardCoverImage: '',
    footerText: '',
    contactEmail: '',
  });

  useEffect(() => {
    axios.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : '';
    axios.defaults.headers.common['Content-Type'] = 'application/json';

    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
      delete axios.defaults.headers.common['Authorization'];
      delete axios.defaults.headers.common['Content-Type'];
    };
  }, [token]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/admin/branding');
      if (Array.isArray(response.data)) {
        setSettings(response.data[0]);
      } else {
        setSettings(response.data);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, field: keyof BrandingSettings) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`/api/admin/branding/upload/${field}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSettings(prev => ({
        ...prev,
        [field]: response.data.url
      }));
    } catch (err) {
      setError('Erreur lors du téléchargement du fichier');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await axios.put('/api/admin/branding', settings);
      setSuccess('Paramètres sauvegardés avec succès');
    } catch (err) {
      setError('Erreur lors de la sauvegarde des paramètres');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading && !settings.name) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
        <Typography variant="h4" gutterBottom>
          Personnalisation de la plateforme
          <Tooltip title="Personnalisez l'apparence de votre plateforme NOLT pour tous les utilisateurs">
            <IconButton size="small" sx={{ ml: 1 }}>
              <HelpOutline fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Modifiez l'apparence de votre plateforme NOLT. Les champs sont regroupés par page ou section pour une personnalisation claire et efficace.
        </Typography>
      </Paper>

      {/* Aperçu en direct */}
      <Paper elevation={2} sx={{ mb: 4, overflow: 'hidden' }}>
        <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
          <Typography variant="h6">Aperçu en direct</Typography>
        </Box>
        <Box p={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card sx={{ background: settings.primaryColor, color: '#fff' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Landing publique
                    <Tooltip title="Aperçu de la page d'accueil publique">
                      <IconButton size="small" sx={{ ml: 1, color: 'white' }}>
                        <HelpOutline fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    {settings.logo && <img src={getImageUrl(settings.logo)} alt="Logo" style={{ height: 60, marginRight: 16 }} />}
                    <Box>
                      <Typography variant="h4" fontWeight="bold">{settings.landingTitle || 'Les Boutiques NOLT'}</Typography>
                      <Typography variant="subtitle1">{settings.landingSlogan || 'Un concept unique pour tous les clubs et communautés'}</Typography>
                    </Box>
                  </Box>
                  {settings.landingCoverImage && (
                    <Box mt={2}>
                      <img src={getImageUrl(settings.landingCoverImage)} alt="Image de fond landing" style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 8 }} />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ background: settings.secondaryColor, color: '#fff' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Dashboard admin
                    <Tooltip title="Aperçu de l'interface d'administration">
                      <IconButton size="small" sx={{ ml: 1, color: 'white' }}>
                        <HelpOutline fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    {settings.logo && <img src={getImageUrl(settings.logo)} alt="Logo" style={{ height: 40, marginRight: 16 }} />}
                    <Box>
                      <Typography variant="h4" fontWeight="bold">{settings.dashboardTitle || 'Tableau de bord'}</Typography>
                      <Typography variant="subtitle1">{settings.dashboardSlogan || 'Gérez vos boutiques et campagnes'}</Typography>
                    </Box>
                  </Box>
                  {settings.dashboardCoverImage && (
                    <Box mt={2}>
                      <img src={getImageUrl(settings.dashboardCoverImage)} alt="Image de fond dashboard" style={{ width: '100%', maxHeight: 80, objectFit: 'cover', borderRadius: 8 }} />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Onglets de navigation */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Landing publique" />
          <Tab label="Dashboard admin" />
          <Tab label="Couleurs" />
          <Tab label="Images" />
          <Tab label="Footer" />
          <Tab label="Réseaux sociaux" />
        </Tabs>

        {/* Contenu des onglets */}
        <Box p={3}>
          {/* Landing publique */}
          {activeTab === 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Landing publique
                  <Tooltip title="Personnalisez l'apparence de la page d'accueil publique">
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <HelpOutline fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nom de la plateforme"
                      value={settings.name || ""}
                      onChange={e => setSettings(prev => ({ ...prev, name: e.target.value }))}
                      helperText="Nom affiché dans le header et les liens principaux"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Titre principal"
                      value={settings.landingTitle || ""}
                      onChange={e => setSettings(prev => ({ ...prev, landingTitle: e.target.value }))}
                      helperText="Titre principal affiché sur la page d'accueil"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Slogan"
                      value={settings.landingSlogan || ""}
                      onChange={e => setSettings(prev => ({ ...prev, landingSlogan: e.target.value }))}
                      helperText="Slogan ou sous-titre de la page d'accueil"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={3}
                      value={settings.description || ""}
                      onChange={e => setSettings(prev => ({ ...prev, description: e.target.value }))}
                      helperText="Description détaillée de votre plateforme"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box textAlign="center">
                      <Typography variant="subtitle1" gutterBottom>
                        Image de fond
                        <Tooltip title="Image de fond de la page d'accueil (recommandé: 1920x1080px)">
                          <IconButton size="small" sx={{ ml: 1 }}>
                            <HelpOutline fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Typography>
                      {settings.landingCoverImage && (
                        <Box mb={2}>
                          <img src={getImageUrl(settings.landingCoverImage)} alt="Cover" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: 8 }} />
                        </Box>
                      )}
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="landing-cover-upload"
                        type="file"
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'landingCoverImage')}
                      />
                      <label htmlFor="landing-cover-upload">
                        <Button variant="outlined" component="span" startIcon={<PhotoCamera />}>
                          Choisir une image de fond
                        </Button>
                      </label>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Dashboard admin */}
          {activeTab === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Dashboard admin
                  <Tooltip title="Personnalisez l'apparence de l'interface d'administration">
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <HelpOutline fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Titre du dashboard"
                      value={settings.dashboardTitle || ""}
                      onChange={e => setSettings(prev => ({ ...prev, dashboardTitle: e.target.value }))}
                      helperText="Titre affiché dans l'en-tête du dashboard"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Slogan du dashboard"
                      value={settings.dashboardSlogan || ""}
                      onChange={e => setSettings(prev => ({ ...prev, dashboardSlogan: e.target.value }))}
                      helperText="Slogan ou sous-titre du dashboard"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box textAlign="center">
                      <Typography variant="subtitle1" gutterBottom>
                        Image de fond
                        <Tooltip title="Image de fond du dashboard (recommandé: 1920x400px)">
                          <IconButton size="small" sx={{ ml: 1 }}>
                            <HelpOutline fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Typography>
                      {settings.dashboardCoverImage && (
                        <Box mb={2}>
                          <img src={getImageUrl(settings.dashboardCoverImage)} alt="Cover" style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: 8 }} />
                        </Box>
                      )}
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="dashboard-cover-upload"
                        type="file"
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'dashboardCoverImage')}
                      />
                      <label htmlFor="dashboard-cover-upload">
                        <Button variant="outlined" component="span" startIcon={<PhotoCamera />}>
                          Choisir une image de fond
                        </Button>
                      </label>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Couleurs */}
          {activeTab === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Couleurs de la plateforme
                  <Tooltip title="Définissez les couleurs principales de votre plateforme">
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <HelpOutline fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Couleur primaire
                        <Tooltip title="Couleur principale utilisée pour les éléments importants">
                          <IconButton size="small" sx={{ ml: 1 }}>
                            <HelpOutline fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Typography>
                      <Box display="flex" gap={2} alignItems="center">
                        <ChromePicker
                          color={settings.primaryColor}
                          onChange={color => setSettings(prev => ({ ...prev, primaryColor: color.hex }))}
                          disableAlpha
                        />
                        <TextField
                          value={settings.primaryColor || ""}
                          onChange={e => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                          helperText="Code hexadécimal"
                        />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Couleur secondaire
                        <Tooltip title="Couleur secondaire utilisée pour les éléments de support">
                          <IconButton size="small" sx={{ ml: 1 }}>
                            <HelpOutline fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Typography>
                      <Box display="flex" gap={2} alignItems="center">
                        <ChromePicker
                          color={settings.secondaryColor}
                          onChange={color => setSettings(prev => ({ ...prev, secondaryColor: color.hex }))}
                          disableAlpha
                        />
                        <TextField
                          value={settings.secondaryColor || ""}
                          onChange={e => setSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          helperText="Code hexadécimal"
                        />
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Images */}
          {activeTab === 3 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Images principales
                  <Tooltip title="Gérez les images principales de votre plateforme">
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <HelpOutline fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box textAlign="center">
                      <Typography variant="subtitle1" gutterBottom>
                        Logo
                        <Tooltip title="Logo principal (recommandé: PNG transparent, 200x200px)">
                          <IconButton size="small" sx={{ ml: 1 }}>
                            <HelpOutline fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Typography>
                      {settings.logo && (
                        <Box mb={2}>
                          <img src={getImageUrl(settings.logo)} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100px', objectFit: 'contain' }} />
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
                      <Typography variant="subtitle1" gutterBottom>
                        Favicon
                        <Tooltip title="Icône du navigateur (recommandé: ICO ou PNG, 32x32px)">
                          <IconButton size="small" sx={{ ml: 1 }}>
                            <HelpOutline fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Typography>
                      {settings.favicon && (
                        <Box mb={2}>
                          <img src={getImageUrl(settings.favicon)} alt="Favicon" style={{ maxWidth: '32px', maxHeight: '32px' }} />
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
                      <Typography variant="subtitle1" gutterBottom>
                        Image de couverture
                        <Tooltip title="Image de couverture générale (recommandé: 1920x400px)">
                          <IconButton size="small" sx={{ ml: 1 }}>
                            <HelpOutline fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Typography>
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
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          {activeTab === 4 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Footer
                  <Tooltip title="Personnalisez le pied de page de votre plateforme">
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <HelpOutline fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Texte du footer"
                      multiline
                      rows={3}
                      value={settings.footerText || ""}
                      onChange={e => setSettings(prev => ({ ...prev, footerText: e.target.value }))}
                      helperText="Texte affiché dans le pied de page"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email de contact"
                      type="email"
                      value={settings.contactEmail || ""}
                      onChange={e => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                      helperText="Email affiché dans le footer"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Réseaux sociaux */}
          {activeTab === 5 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Réseaux sociaux
                  <Tooltip title="Ajoutez les liens vers vos réseaux sociaux">
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <HelpOutline fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        <Facebook sx={{ mr: 1, color: '#1877f2' }} />
                        Facebook
                      </Typography>
                      <TextField
                        fullWidth
                        label="URL Facebook"
                        value={settings.socialLinks?.facebook || ""}
                        onChange={e => setSettings(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, facebook: e.target.value } }))}
                        helperText="Lien vers votre page Facebook"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        <Instagram sx={{ mr: 1, color: '#e4405f' }} />
                        Instagram
                      </Typography>
                      <TextField
                        fullWidth
                        label="URL Instagram"
                        value={settings.socialLinks?.instagram || ""}
                        onChange={e => setSettings(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, instagram: e.target.value } }))}
                        helperText="Lien vers votre compte Instagram"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        <Twitter sx={{ mr: 1, color: '#1da1f2' }} />
                        Twitter
                      </Typography>
                      <TextField
                        fullWidth
                        label="URL Twitter"
                        value={settings.socialLinks?.twitter || ""}
                        onChange={e => setSettings(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, twitter: e.target.value } }))}
                        helperText="Lien vers votre compte Twitter"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        <LinkedIn sx={{ mr: 1, color: '#0077b5' }} />
                        LinkedIn
                      </Typography>
                      <TextField
                        fullWidth
                        label="URL LinkedIn"
                        value={settings.socialLinks?.linkedin || ""}
                        onChange={e => setSettings(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, linkedin: e.target.value } }))}
                        helperText="Lien vers votre profil LinkedIn"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Box>
      </Paper>

      {/* Bouton de sauvegarde sticky */}
      <Box position="fixed" bottom={32} right={32} zIndex={1000}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={loading}
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </Box>

      {/* Feedback utilisateur */}
      {error && (
        <Alert severity="error" sx={{ position: 'fixed', bottom: 32, left: 32, zIndex: 1000 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ position: 'fixed', bottom: 32, left: 32, zIndex: 1000 }}>
          {success}
        </Alert>
      )}
    </Box>
  );
} 