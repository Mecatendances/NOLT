export const generateLayout = (title: string, content: string) => `
<!DOCTYPE html>
<html>
  <head>
    <title>${title} - Catalogue Dolibarr</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background: #f5f5f5;
      }
      .navbar {
        background: #007bff;
        padding: 15px 20px;
        color: white;
      }
      .navbar-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .nav-links {
        display: flex;
        gap: 20px;
      }
      .nav-link {
        color: white;
        text-decoration: none;
        padding: 5px 10px;
        border-radius: 4px;
        transition: background 0.3s;
      }
      .nav-link:hover {
        background: rgba(255,255,255,0.1);
      }
      .container {
        max-width: 1200px;
        margin: 20px auto;
        padding: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .breadcrumb {
        margin-bottom: 20px;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 4px;
      }
      .breadcrumb a {
        color: #007bff;
        text-decoration: none;
      }
      .breadcrumb a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="navbar">
      <div class="navbar-content">
        <a href="/" class="nav-link">🏠 Accueil</a>
        <div class="nav-links">
          <a href="/api/dolibarr/products-view" class="nav-link">📦 Produits</a>
          <a href="/api/dolibarr/categories/tree" class="nav-link">🌳 Catégories</a>
        </div>
      </div>
    </div>
    <div class="container">
      ${content}
    </div>
  </body>
</html>
`; 