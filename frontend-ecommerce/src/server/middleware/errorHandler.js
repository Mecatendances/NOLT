export const errorHandler = (err, req, res, next) => {
  req.logger.error('Erreur serveur:', err);

  // Gestion des erreurs de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: "Erreur de validation des données",
      errors: err.errors 
    });
  }

  // Gestion des erreurs d'authentification
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      message: "Non autorisé" 
    });
  }

  // Erreur par défaut
  res.status(500).json({ 
    message: "Erreur serveur interne" 
  });
};