import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => (
  <footer className="bg-gray-900 text-white py-16">
    <div className="container mx-auto max-w-7xl px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h3 className="font-thunder text-2xl mb-6 text-nolt-yellow italic uppercase">FC CHALON</h3>
          <p className="text-gray-300 font-montserrat">
            Indestructibles depuis 1926. Le club de football emblématique de Chalon-sur-Saône.
          </p>
          <div className="flex gap-4 mt-6">
            <a href="#" className="text-white hover:text-nolt-yellow">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#" className="text-white hover:text-nolt-yellow">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" className="text-white hover:text-nolt-yellow">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-lg font-bold mb-4 font-montserrat">Club</h4>
          <ul className="space-y-3 text-gray-300 font-montserrat">
            <li><a href="#" className="hover:text-nolt-yellow transition-colors">À propos</a></li>
            <li><a href="#" className="hover:text-nolt-yellow transition-colors">Notre histoire</a></li>
            <li><a href="#" className="hover:text-nolt-yellow transition-colors">Équipes</a></li>
            <li><a href="#" className="hover:text-nolt-yellow transition-colors">Stade</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-bold mb-4 font-montserrat">Supporters</h4>
          <ul className="space-y-3 text-gray-300 font-montserrat">
            <li><a href="#" className="hover:text-nolt-yellow transition-colors">Billetterie</a></li>
            <li><a href="#" className="hover:text-nolt-yellow transition-colors">Abonnements</a></li>
            <li><Link to="/public/shops" className="hover:text-nolt-yellow transition-colors">Boutique</Link></li>
            <li><a href="#" className="hover:text-nolt-yellow transition-colors">Club des supporters</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-bold mb-4 font-montserrat">Contact</h4>
          <ul className="space-y-3 text-gray-300 font-montserrat">
            <li>contact@fcchalon.com</li>
            <li>+33 3 85 93 14 14</li>
            <li>Stade Léo Lagrange, 71100 Chalon-sur-Saône</li>
          </ul>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 font-montserrat">
        <p>© 2025 FC Chalon. Tous droits réservés.</p>
      </div>
    </div>
  </footer>
);

export default Footer; 