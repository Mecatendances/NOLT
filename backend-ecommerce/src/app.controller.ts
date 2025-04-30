import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get()
  getHome(@Res() res: Response) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Catalogue Dolibarr</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: #f5f5f5;
            }
            .container {
              max-width: 1200px;
              margin: 0 auto;
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 {
              color: #333;
              text-align: center;
              margin-bottom: 30px;
            }
            .nav-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 20px;
              margin-top: 30px;
            }
            .nav-card {
              background: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              text-align: center;
              transition: transform 0.2s;
            }
            .nav-card:hover {
              transform: translateY(-5px);
            }
            .nav-card h2 {
              color: #007bff;
              margin-bottom: 15px;
            }
            .nav-card p {
              color: #666;
              margin-bottom: 20px;
            }
            .nav-link {
              display: inline-block;
              padding: 10px 20px;
              background: #007bff;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              transition: background 0.3s;
            }
            .nav-link:hover {
              background: #0056b3;
            }
            .stats {
              text-align: center;
              margin-top: 30px;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Catalogue Dolibarr</h1>
            <div class="nav-grid">
              <div class="nav-card">
                <h2>📦 Produits</h2>
                <p>Consultez la liste complète des produits avec leurs prix et stocks</p>
                <a href="/api/dolibarr/products-view" class="nav-link">Vue Liste</a>
                <br><br>
                <a href="/api/dolibarr/products/table" class="nav-link">Vue Tableau</a>
              </div>
              <div class="nav-card">
                <h2>🌳 Catégories</h2>
                <p>Explorez les produits par catégories</p>
                <a href="/api/dolibarr/categories/tree" class="nav-link">Vue Arborescence</a>
                <br><br>
                <a href="/api/dolibarr/categories/table" class="nav-link">Vue Tableau</a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    res.send(html);
  }

  @Get('health')
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}
