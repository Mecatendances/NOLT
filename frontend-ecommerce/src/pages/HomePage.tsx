import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Calendar, Users, Trophy, ArrowRight } from 'lucide-react';

export function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-nolt-black py-32 flex items-center justify-center overflow-hidden">
        {/* Main background image */}
        <div className="absolute inset-0">
          <img 
            src="https://pic.gowizzyou.com/uploads/fcchalon.png" 
            alt="FC Chalon stadium" 
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-nolt-orange/90 to-black/70" />
        
        <div className="relative text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="font-thunder text-7xl mb-6 tracking-tight italic uppercase">FC CHALON</h1>
          <p className="text-3xl font-thunder italic text-nolt-yellow mb-8">INDESTRUCTIBLES DEPUIS 1926</p>
          <p className="max-w-2xl mx-auto text-xl font-montserrat mb-10">
            Le club emblématique de Chalon-sur-Saône, fier de ses valeurs, de son histoire et de ses supporters.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link 
              to="/public/shops" 
              className="px-8 py-3 bg-nolt-yellow text-nolt-black rounded-xl font-semibold flex items-center gap-2 hover:bg-yellow-300 transition-colors text-lg font-montserrat"
            >
              <ShoppingBag className="h-5 w-5" />
              Boutique Officielle
            </Link>
            <a 
              href="https://www.fcchalon.com/evenement/"
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-3 bg-white text-nolt-orange rounded-xl font-semibold flex items-center gap-2 hover:bg-gray-100 transition-colors text-lg font-montserrat"
            >
              <Calendar className="h-5 w-5" />
              Calendrier des matchs
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="font-thunder text-4xl text-center text-nolt-black mb-16 italic uppercase">FC Chalon - Un club, une passion</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="bg-nolt-orange inline-flex items-center justify-center w-16 h-16 rounded-full text-white mb-6">
                <Trophy className="h-8 w-8" />
              </div>
              <h3 className="font-thunder text-2xl text-nolt-black mb-4 italic uppercase">Notre Histoire</h3>
              <p className="text-gray-600 font-montserrat">
                Depuis 1926, le FC Chalon écrit son histoire et forge sa légende dans le coeur du football français, avec passion et détermination.
              </p>
              <button className="mt-6 text-nolt-orange hover:text-nolt-yellow transition-colors font-montserrat flex items-center gap-1 mx-auto">
                Découvrir notre histoire
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            
            <div className="text-center">
              <div className="bg-nolt-orange inline-flex items-center justify-center w-16 h-16 rounded-full text-white mb-6">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="font-thunder text-2xl text-nolt-black mb-4 italic uppercase">Nos Équipes</h3>
              <p className="text-gray-600 font-montserrat">
                De l'équipe première aux sections jeunes, découvrez nos joueurs qui défendent fièrement les couleurs du club chaque semaine.
              </p>
              <button className="mt-6 text-nolt-orange hover:text-nolt-yellow transition-colors font-montserrat flex items-center gap-1 mx-auto">
                Voir nos équipes
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            
            <div className="text-center">
              <div className="bg-nolt-orange inline-flex items-center justify-center w-16 h-16 rounded-full text-white mb-6">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="font-thunder text-2xl text-nolt-black mb-4 italic uppercase">Notre Boutique</h3>
              <p className="text-gray-600 font-montserrat">
                Équipez-vous aux couleurs du FC Chalon avec notre collection officielle de maillots, trainings et accessoires pour tous les supporters.
              </p>
              <Link 
                to="/public/shops"
                className="mt-6 text-nolt-orange hover:text-nolt-yellow transition-colors font-montserrat flex items-center gap-1 mx-auto"
              >
                Visiter la boutique
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-nolt-orange py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center text-white">
          <h2 className="font-thunder text-4xl mb-6 italic uppercase">Rejoignez l'aventure FC Chalon</h2>
          <p className="text-xl max-w-3xl mx-auto font-montserrat mb-8">
            Devenez membre du club, participez à nos événements et soutenez votre équipe lors des matchs à domicile comme à l'extérieur.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-6 py-3 bg-white text-nolt-orange rounded-lg font-medium hover:bg-gray-100 transition-colors font-montserrat">
              Devenir membre
            </button>
            <Link
              to="/login" 
              className="px-6 py-3 bg-nolt-yellow text-nolt-black rounded-lg font-medium hover:bg-yellow-300 transition-colors font-montserrat"
            >
              Espace membres
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-nolt-yellow">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-nolt-yellow">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                  </svg>
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
    </div>
  );
}