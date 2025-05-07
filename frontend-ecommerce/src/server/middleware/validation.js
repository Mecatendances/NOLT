export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const { body, query, params } = req;
      
      if (schema.body) {
        req.body = schema.body.parse(body);
      }
      
      if (schema.query) {
        req.query = schema.query.parse(query);
      }
      
      if (schema.params) {
        req.params = schema.params.parse(params);
      }
      
      next();
    } catch (error) {
      res.status(400).json({
        message: 'Données de requête invalides',
        errors: error.errors || error.message
      });
    }
  };
};