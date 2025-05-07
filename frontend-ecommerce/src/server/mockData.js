export const createMockProducts = () => {
  return [
    {
      id: 1,
      ref: "MAILLOT-FOOT-DOM-2024",
      label: "Maillot de Football Domicile 2024",
      price: 89.99,
      stock: 150,
      description: "Maillot officiel domicile en tissu respirant avec technologie DriFit. Design moderne et élégant aux couleurs du club.",
      image_url: "https://pic.gowizzyou.com/uploads/0005444_27423_FO RENA M JSS_5.png"
    },
    {
      id: 2,
      ref: "MAILLOT-FOOT-EXT-2024",
      label: "Maillot de Football Extérieur 2024",
      price: 89.99,
      stock: 120,
      description: "Maillot officiel extérieur avec design exclusif. Tissu léger et confortable pour des performances optimales.",
      image_url: "https://pic.gowizzyou.com/uploads/0005449_27423_FO RENA M JSS_10.png"
    },
    {
      id: 3,
      ref: "MAILLOT-GARDIEN-2024",
      label: "Maillot de Gardien Pro 2024",
      price: 94.99,
      stock: 100,
      description: "Maillot de gardien professionnel. Coupe ajustée et matériaux renforcés pour une protection optimale.",
      image_url: "https://pic.gowizzyou.com/uploads/gardien_ares.png"
    },
    {
      id: 4,
      ref: "SHORT-MATCH-2024",
      label: "Short de Match Premium",
      price: 39.99,
      stock: 200,
      description: "Short de match officiel avec tissus légers et respirants. Design moderne et confortable pour des performances optimales.",
      image_url: "https://pic.gowizzyou.com/uploads/0005493_27423_Bermuda.png"
    },
    {
      id: 5,
      ref: "CHAUSSETTES-PRO-2024",
      label: "Chaussettes de Sport Pro",
      price: 14.99,
      stock: 300,
      description: "Chaussettes professionnelles renforcées aux points de friction. Compression adaptée pour un soutien optimal.",
      image_url: "https://pic.gowizzyou.com/uploads/chaussettes_ares.png" 
    },
    {
      id: 6,
      ref: "SURVET-TRAINING-2024",
      label: "Survêtement Training Elite",
      price: 119.99,
      stock: 85,
      description: "Survêtement d'entraînement complet avec veste et pantalon assortis. Confort et style pour les séances d'entraînement.",
      image_url: "https://pic.gowizzyou.com/uploads/0005494_27423_PAN01 Pants Coton_3.png"
    },
    {
      id: 7,
      ref: "BALLON-MATCH-2024",
      label: "Ballon de Match Officiel",
      price: 29.99,
      stock: 120,
      description: "Ballon de match officiel approuvé par les fédérations. Haute qualité avec coutures renforcées.",
      image_url: "https://pic.gowizzyou.com/uploads/ballon_officiel_chalon.png"
    },
    {
      id: 8,
      ref: "GANTS-GARDIEN-PRO",
      label: "Gants de Gardien Professionnels",
      price: 49.99,
      stock: 60,
      description: "Gants de gardien haut de gamme avec grip supérieur et protection anti-impact. Idéal pour les matchs de haut niveau.",
      image_url: "https://pic.gowizzyou.com/uploads/gant gardien.png" 
    },
    {
      id: 9,
      ref: "VESTE-REPRESENTENTION-PRO",
      label: "Veste de Représentation Officielle",
      price: 89.99,
      stock: 75,
      description: "Veste de représentation officielle, élégante et confortable. Parfaite pour les déplacements et événements du club.",
      image_url: "https://pic.gowizzyou.com/uploads/0005492_27423_50 Hoodie Men_3.png"
    },
    {
      id: 10,
      ref: "POLO-CLUB-2024",
      label: "Polo Club Officiel",
      price: 49.99,
      stock: 90,
      description: "Polo officiel du club en tissu premium. Style élégant et confortable pour représenter vos couleurs au quotidien.",
      image_url: "https://pic.gowizzyou.com/uploads/polo_chalon.png"
    },
    {
      id: 11,
      ref: "MAILLOT-TRAINING-2024",
      label: "Maillot d'Entraînement Performance",
      price: 59.99,
      stock: 120,
      description: "Maillot d'entraînement léger avec technologie anti-transpiration. Idéal pour les séances intensives.",
      image_url: "https://pic.gowizzyou.com/uploads/0005445_27423_FO RENA M JSS_6.png"
    },
    {
      id: 12,
      ref: "BONNET-HIVER-2024",
      label: "Bonnet Hiver FC Chalon",
      price: 24.99,
      stock: 150,
      description: "Bonnet chaud aux couleurs du club pour les supporters. Tissu double épaisseur pour un confort optimal.",
      image_url: "https://pic.gowizzyou.com/uploads/bonnet.png"
    },
    {
      id: 13,
      ref: "ECHARPE-SUPPORTER-2024",
      label: "Écharpe Supporter FC Chalon",
      price: 29.99,
      stock: 200,
      description: "Écharpe officielle du club pour supporter votre équipe. Design exclusif et matière douce et chaude.",
      image_url: "https://pic.gowizzyou.com/uploads/echarpe.png"
    },
    {
      id: 14,
      ref: "SAC-SPORT-TEAM",
      label: "Sac de Sport Team FC Chalon",
      price: 59.99,
      stock: 80,
      description: "Sac de sport spacieux avec compartiments multiples. Résistant et pratique pour transporter votre équipement.",
      image_url: "https://pic.gowizzyou.com/uploads/sacdesport.png"
    },
    {
      id: 15,
      ref: "CASQUETTE-ETE-2024",
      label: "Casquette Été FC Chalon",
      price: 24.99,
      stock: 150,
      description: "Casquette légère avec logo brodé. Protection solaire et style pour les jours ensoleillés.",
      image_url: "https://pic.gowizzyou.com/uploads/casquette.png"
    }
  ];
};

// Fonction pour créer des boutiques par défaut
export const createDefaultShops = () => {
  const products = createMockProducts();
  
  return [
    {
      id: 1,
      name: "Boutique Officielle FC Chalon",
      description: "La boutique officielle du club FC Chalon avec tous les équipements officiels et articles pour supporters.",
      products: products.slice(0, 10), 
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      name: "Collection Supporters",
      description: "Accessoires et vêtements pour les supporters passionnés du FC Chalon. Montrez votre soutien avec notre collection exclusive!",
      products: [...products.slice(10, 15), ...products.slice(6, 10)],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
};