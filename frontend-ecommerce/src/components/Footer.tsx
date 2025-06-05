import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useBranding } from '../hooks/useBranding';
import { getImageUrl } from '../utils/getImageUrl';

interface FooterProps {
  shopId?: string;
}

const Footer: React.FC<FooterProps> = ({ shopId }) => {
  // Si shopId n'est pas passé en prop, on tente de le récupérer via l'URL
  const params = useParams();
  const effectiveShopId = shopId || params.id;
  const { branding } = useBranding(effectiveShopId);

  return (
    <footer className="bg-gray-900 text-white py-16" style={{background: 'var(--brand-footer-bg, #18181b)', color: 'var(--brand-footer-text, #fff)'}}>
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="font-thunder text-2xl mb-6 italic uppercase" style={{color: 'var(--brand-secondary, #FFD600)'}}>{branding?.name || 'FC CHALON'}</h3>
            <p className="font-montserrat" style={{color: 'var(--brand-footer-desc, #d1d5db)'}}>
              {branding?.description || 'Indestructibles depuis 1926. Le club de football emblématique de Chalon-sur-Saône.'}
            </p>
            <div className="flex gap-4 mt-6">
              {branding?.socialLinks?.facebook && (
                <a href={branding.socialLinks.facebook} className="hover:opacity-80" style={{color: 'var(--brand-footer-text, #fff)'}} target="_blank" rel="noopener noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
              )}
              {branding?.socialLinks?.instagram && (
                <a href={branding.socialLinks.instagram} className="hover:opacity-80" style={{color: 'var(--brand-footer-text, #fff)'}} target="_blank" rel="noopener noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
              )}
              {branding?.socialLinks?.twitter && (
                <a href={branding.socialLinks.twitter} className="hover:opacity-80" style={{color: 'var(--brand-footer-text, #fff)'}} target="_blank" rel="noopener noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                </a>
              )}
              {branding?.socialLinks?.linkedin && (
                <a href={branding.socialLinks.linkedin} className="hover:opacity-80" style={{color: 'var(--brand-footer-text, #fff)'}} target="_blank" rel="noopener noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect><line x1="16" y1="8" x2="16" y2="16"></line><line x1="8" y1="8" x2="8" y2="16"></line><line x1="12" y1="12" x2="12" y2="16"></line></svg>
                </a>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4 font-montserrat">Club</h4>
            <ul className="space-y-3 font-montserrat" style={{color: 'var(--brand-footer-link, #d1d5db)'}}>
              <li><a href="#" className="transition-colors hover:underline" style={{color: 'inherit'}} >À propos</a></li>
              <li><a href="#" className="transition-colors hover:underline" style={{color: 'inherit'}} >Notre histoire</a></li>
              <li><a href="#" className="transition-colors hover:underline" style={{color: 'inherit'}} >Équipes</a></li>
              <li><a href="#" className="transition-colors hover:underline" style={{color: 'inherit'}} >Stade</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4 font-montserrat">Supporters</h4>
            <ul className="space-y-3 font-montserrat" style={{color: 'var(--brand-footer-link, #d1d5db)'}}>
              <li><a href="#" className="transition-colors hover:underline" style={{color: 'inherit'}} >Billetterie</a></li>
              <li><a href="#" className="transition-colors hover:underline" style={{color: 'inherit'}} >Abonnements</a></li>
              <li><Link to="/public/shops" className="transition-colors hover:underline" style={{color: 'inherit'}} >Boutique</Link></li>
              <li><a href="#" className="transition-colors hover:underline" style={{color: 'inherit'}} >Club des supporters</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4 font-montserrat">Contact</h4>
            <ul className="space-y-3 font-montserrat" style={{color: 'var(--brand-footer-link, #d1d5db)'}}>
              <li>{branding?.email || 'contact@fcchalon.com'}</li>
              <li>+33 3 85 93 14 14</li>
              <li>Stade Léo Lagrange, 71100 Chalon-sur-Saône</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center font-montserrat" style={{borderColor: 'var(--brand-footer-border, #27272a)', color: 'var(--brand-footer-copyright, #a3a3a3)'}}>
          <p>{branding?.footer || '© 2025 FC Chalon. Tous droits réservés.'}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 