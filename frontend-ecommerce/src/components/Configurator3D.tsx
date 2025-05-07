import React, { useEffect, useRef } from 'react';

interface Configurator3DProps {
  className?: string;
}

interface Showcase {
  createViewer: (options: { divId: string }) => Promise<Viewer>;
}

interface Viewer {
  update: (options: { fields: Record<string, string> }) => Promise<void>;
  dispose: () => void;
}

declare global {
  interface Window {
    apvizShowcaseReady: (showcase: Showcase) => Promise<void>;
    apvizViewer: unknown;
  }
}

export function Configurator3D({ className }: Configurator3DProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const viewerRef = useRef<React.MutableRefObject<Viewer | null>>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    // Définir la fonction de callback
    window.apvizShowcaseReady = async (showcase: Showcase) => {
      try {
        const viewer = await showcase.createViewer({
          divId: "apviz-3d-viewer"
        });

        // Stocker le viewer pour le nettoyage futur
        window.apvizViewer = viewer;
        viewerRef.current = viewer;

        await viewer.update({
          fields: {
            "Gem": "Diamond",
            "Ring": "Gold Pink"
          }
        });

        // Gestionnaire d'événements pour l'input
        if (inputRef.current) {
          inputRef.current.addEventListener("input", (e) => {
            const target = e.target as HTMLInputElement;
            if (viewerRef.current) {
              viewerRef.current.update({
                fields: {
                  "Gem": "Diamond",
                  "Ring": "Gold Pink"
                },
                markingZones: {
                  "Engraving": {
                    text: {
                      value: target.value,
                      fontKey: "Arial",
                      heightMode: "characters",
                      horizontalAlignment: "center",
                      verticalAlignment: "middle",
                      relief: {
                        direction: "down",
                        depth: 0.000002,
                        angle: 80
                      }
                    }
                  }
                }
              });
            }
          });
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du viewer:', error);
      }
    };

    // Charger le script Apviz
    const script = document.createElement('script');
    script.src = "https://public.apviz.io/showcases/U0hPVzo1ajlKbGQxOFpN/releases/UkVMUzpIejE1ME5UMk1w/main.js";
    script.integrity = "sha384-gsXDSToM7fE7cZsncUHyovYQwg2M+fi1S7LIlYStw1M1NhYL7E3eufm+TizwbO++";
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.setAttribute('data-apviz-callback', 'apvizShowcaseReady');
    document.body.appendChild(script);
    scriptRef.current = script;

    // Nettoyage
    return () => {
      // Nettoyer le viewer
      if (viewerRef.current) {
        try {
          viewerRef.current.current?.dispose();
          viewerRef.current.current = null;
          window.apvizViewer = null;
        } catch (e) {
          console.warn('Erreur lors du nettoyage du viewer:', e);
        }
      }

      // Supprimer le script
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        document.body.removeChild(scriptRef.current);
      }

      // Supprimer la fonction de callback
      delete window.apvizShowcaseReady;
    };
  }, []);

  return (
    <div className={className}>
      <div className="relative">
        <div id="apviz-3d-viewer" className="w-full h-[500px] rounded-xl overflow-hidden" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Entrez votre texte de gravure..."
          className="absolute top-4 left-4 w-64 px-4 py-2 rounded-lg border border-gray-200 bg-white/80 backdrop-blur focus:outline-none focus:ring-2 focus:ring-nolt-orange"
        />
      </div>
    </div>
  );
}