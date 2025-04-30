import { Controller, Get, Query, Res, Param } from '@nestjs/common';
import { DolibarrService } from './dolibarr.service';
import { Response } from 'express';
import { DolibarrProduct, CategoryTree } from './interfaces';
import { HttpService } from '@nestjs/axios';
import { generateLayout } from './templates/layout';

@Controller('dolibarr')
export class DolibarrController {
  constructor(
    private readonly dolibarrService: DolibarrService,
    private readonly httpService: HttpService
  ) {}

  /**
   * Formatte un prix en euros avec deux décimales
   */
  private formatPrice(price: string | number | undefined): string {
    if (price === undefined || price === null || price === '') return '-';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '-' : numPrice.toFixed(2) + ' €';
  }

  @Get('products/:id/details')
  async getProductDetails(@Param('id') id: string) {
    const product = await this.dolibarrService.getProduct(id);
    
    console.log('=== DONNÉES DU PRODUIT ===');
    console.log(JSON.stringify(product, null, 2));
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Détails du Produit - ${product.label}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              padding: 20px;
            }
            .product-details {
              max-width: 800px;
              margin: 0 auto;
              background: #f9f9f9;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .back-button {
              display: inline-block;
              margin-bottom: 20px;
              padding: 8px 16px;
              background-color: #007bff;
              color: white;
              text-decoration: none;
              border-radius: 4px;
            }
            .detail-row {
              display: flex;
              margin-bottom: 10px;
              border-bottom: 1px solid #eee;
              padding: 8px 0;
            }
            .detail-label {
              width: 200px;
              font-weight: bold;
            }
            .detail-value {
              flex: 1;
            }
          </style>
        </head>
        <body>
          <a href="/api/dolibarr/products/table" class="back-button">← Retour à la liste</a>
          <div class="product-details">
            <h1>${product.label}</h1>
            
            <div class="detail-row">
              <div class="detail-label">Référence:</div>
              <div class="detail-value">${product.ref}</div>
            </div>
            
            <div class="detail-row">
              <div class="detail-label">Description:</div>
              <div class="detail-value">${product.description || 'Aucune description'}</div>
            </div>
            
            <div class="detail-row">
              <div class="detail-label">Prix HT:</div>
              <div class="detail-value">${this.formatPrice(product.price_ht)}</div>
            </div>
            
            <div class="detail-row">
              <div class="detail-label">Prix TTC:</div>
              <div class="detail-value">${this.formatPrice(product.price_ttc)}</div>
            </div>
            
            <div class="detail-row">
              <div class="detail-label">Stock:</div>
              <div class="detail-value">${product.stock || 0}</div>
            </div>
          </div>
        </body>
      </html>
    `;

    return html;
  }

  @Get('products')
  async getProducts(
    @Query('category') categoryId?: string,
    @Query('page') page = 0,
    @Query('includeStock') includeStock = 'false'
  ) {
    const category = categoryId ? Number(categoryId) : undefined;
    const stock = includeStock === 'true';
    return this.dolibarrService.getProducts(category, page, stock);
  }

  @Get('products/table')
  async getProductsTable(@Res() res: Response) {
    const products = await this.dolibarrService.getProducts();
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Produits Dolibarr</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            .controls {
              margin-bottom: 20px;
            }
            .search-box {
              padding: 8px;
              width: 300px;
              margin-right: 10px;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              cursor: pointer;
            }
            th:hover {
              background-color: #e6e6e6;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            tr:hover {
              background-color: #f5f5f5;
            }
            .pagination {
              margin-top: 20px;
              text-align: center;
            }
            .pagination button {
              padding: 8px 16px;
              margin: 0 4px;
              cursor: pointer;
            }
            .pagination button:disabled {
              cursor: not-allowed;
              opacity: 0.5;
            }
            .price {
              text-align: right;
            }
            .stock {
              text-align: center;
            }
            .stock.low {
              color: red;
            }
            .stock.medium {
              color: orange;
            }
            .stock.high {
              color: green;
            }
            .product-link {
              color: #007bff;
              text-decoration: none;
            }
            .product-link:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <h1>Liste des Produits</h1>
          <div class="controls">
            <input type="text" id="searchBox" class="search-box" placeholder="Rechercher...">
            <span id="totalProducts" style="margin-left: 20px; font-weight: bold;"></span>
          </div>
          <table id="productsTable">
            <thead>
              <tr>
                <th onclick="sortTable(0)">ID ↕</th>
                <th onclick="sortTable(1)">Référence ↕</th>
                <th onclick="sortTable(2)">Label ↕</th>
                <th onclick="sortTable(3)">Description ↕</th>
                <th onclick="sortTable(4)">Prix HT ↕</th>
                <th onclick="sortTable(5)">Prix TTC ↕</th>
                <th onclick="sortTable(6)">Stock ↕</th>
                <th onclick="sortTable(7)">Catégorie ↕</th>
              </tr>
            </thead>
            <tbody>
              ${products.map(prod => {
                let stockClass = 'low';
                if (prod.stock >= 50) {
                  stockClass = 'high';
                } else if (prod.stock >= 10) {
                  stockClass = 'medium';
                }

                return `
                <tr>
                  <td>${prod.id}</td>
                  <td><a href="/api/dolibarr/products/${prod.id}/details" class="product-link">${prod.ref}</a></td>
                  <td><a href="/api/dolibarr/products/${prod.id}/details" class="product-link">${prod.label}</a></td>
                  <td>${prod.description || ''}</td>
                  <td class="price">${this.formatPrice(prod.price_ht)}</td>
                  <td class="price">${this.formatPrice(prod.price_ttc)}</td>
                  <td class="stock ${stockClass}">${prod.stock || 0}</td>
                  <td>${prod.category || '-'}</td>
                </tr>
              `}).join('')}
            </tbody>
          </table>
          <div class="pagination">
            <button onclick="changePage(-1)" id="prevPage">Précédent</button>
            <span id="pageInfo">Page 1</span>
            <button onclick="changePage(1)" id="nextPage">Suivant</button>
          </div>

          <script>
            let currentPage = 1;
            const rowsPerPage = 10;
            let currentSort = { column: 0, direction: 'asc' };
            let filteredData = [...document.querySelectorAll('#productsTable tbody tr')];

            function sortTable(column) {
              const tbody = document.querySelector('#productsTable tbody');
              const rows = Array.from(tbody.querySelectorAll('tr'));
              
              if (currentSort.column === column) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
              } else {
                currentSort.column = column;
                currentSort.direction = 'asc';
              }

              rows.sort((a, b) => {
                const aValue = a.cells[column].textContent;
                const bValue = b.cells[column].textContent;
                
                if (column === 0 || column === 4 || column === 5 || column === 6) { // Numeric columns
                  const aNum = parseFloat(aValue) || 0;
                  const bNum = parseFloat(bValue) || 0;
                  return currentSort.direction === 'asc' ? aNum - bNum : bNum - aNum;
                }
                
                return currentSort.direction === 'asc'
                  ? aValue.localeCompare(bValue)
                  : bValue.localeCompare(aValue);
              });

              tbody.innerHTML = '';
              rows.forEach(row => tbody.appendChild(row));
              updatePagination();
            }

            function filterTable() {
              const searchBox = document.getElementById('searchBox');
              const searchText = searchBox.value.toLowerCase();
              
              filteredData = Array.from(document.querySelectorAll('#productsTable tbody tr')).filter(row => {
                return Array.from(row.cells).some(cell => 
                  cell.textContent.toLowerCase().includes(searchText)
                );
              });

              currentPage = 1;
              updatePagination();
            }

            function updatePagination() {
              const tbody = document.querySelector('#productsTable tbody');
              tbody.innerHTML = '';
              
              const start = (currentPage - 1) * rowsPerPage;
              const end = start + rowsPerPage;
              const paginatedData = filteredData.slice(start, end);
              
              paginatedData.forEach(row => tbody.appendChild(row));
              
              document.getElementById('pageInfo').textContent = 
                \`Page \${currentPage} sur \${Math.ceil(filteredData.length / rowsPerPage)}\`;
              
              document.getElementById('totalProducts').textContent = 
                \`Total: \${filteredData.length} produits\`;
              
              document.getElementById('prevPage').disabled = currentPage === 1;
              document.getElementById('nextPage').disabled = 
                currentPage >= Math.ceil(filteredData.length / rowsPerPage);
            }

            function changePage(delta) {
              currentPage += delta;
              updatePagination();
            }

            document.getElementById('searchBox').addEventListener('input', filterTable);
            updatePagination();
          </script>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get('categories')
  async getCategories() {
    return this.dolibarrService.getCategories();
  }

  @Get('categories/table')
  async getCategoriesTable(@Res() res: Response) {
    const categories = await this.dolibarrService.getCategories();
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Catégories Dolibarr</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            .controls {
              margin-bottom: 20px;
            }
            .search-box {
              padding: 8px;
              width: 300px;
              margin-right: 10px;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              cursor: pointer;
            }
            th:hover {
              background-color: #e6e6e6;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            tr:hover {
              background-color: #f5f5f5;
            }
            .pagination {
              margin-top: 20px;
              text-align: center;
            }
            .pagination button {
              padding: 8px 16px;
              margin: 0 4px;
              cursor: pointer;
            }
            .pagination button:disabled {
              cursor: not-allowed;
              opacity: 0.5;
            }
          </style>
        </head>
        <body>
          <h1>Liste des Catégories</h1>
          <div class="controls">
            <input type="text" id="searchBox" class="search-box" placeholder="Rechercher...">
            <span id="totalCategories" style="margin-left: 20px; font-weight: bold;"></span>
          </div>
          <table id="categoriesTable">
            <thead>
              <tr>
                <th onclick="sortTable(0)">ID ↕</th>
                <th onclick="sortTable(1)">Label ↕</th>
                <th onclick="sortTable(2)">Description ↕</th>
                <th onclick="sortTable(3)">Type ↕</th>
              </tr>
            </thead>
            <tbody>
              ${categories.map(cat => `
                <tr>
                  <td>${cat.id}</td>
                  <td>${cat.label}</td>
                  <td>${cat.description || ''}</td>
                  <td>${cat.type}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="pagination">
            <button onclick="changePage(-1)" id="prevPage">Précédent</button>
            <span id="pageInfo">Page 1</span>
            <button onclick="changePage(1)" id="nextPage">Suivant</button>
          </div>

          <script>
            let currentPage = 1;
            const rowsPerPage = 10;
            let currentSort = { column: 0, direction: 'asc' };
            let filteredData = [...document.querySelectorAll('#categoriesTable tbody tr')];

            function sortTable(column) {
              const tbody = document.querySelector('#categoriesTable tbody');
              const rows = Array.from(tbody.querySelectorAll('tr'));
              
              if (currentSort.column === column) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
              } else {
                currentSort.column = column;
                currentSort.direction = 'asc';
              }

              rows.sort((a, b) => {
                const aValue = a.cells[column].textContent;
                const bValue = b.cells[column].textContent;
                
                if (column === 0) { // ID column
                  return currentSort.direction === 'asc' 
                    ? parseInt(aValue) - parseInt(bValue)
                    : parseInt(bValue) - parseInt(aValue);
                }
                
                return currentSort.direction === 'asc'
                  ? aValue.localeCompare(bValue)
                  : bValue.localeCompare(aValue);
              });

              tbody.innerHTML = '';
              rows.forEach(row => tbody.appendChild(row));
              updatePagination();
            }

            function filterTable() {
              const searchBox = document.getElementById('searchBox');
              const searchText = searchBox.value.toLowerCase();
              
              filteredData = Array.from(document.querySelectorAll('#categoriesTable tbody tr')).filter(row => {
                return Array.from(row.cells).some(cell => 
                  cell.textContent.toLowerCase().includes(searchText)
                );
              });

              currentPage = 1;
              updatePagination();
            }

            function updatePagination() {
              const tbody = document.querySelector('#categoriesTable tbody');
              tbody.innerHTML = '';
              
              const start = (currentPage - 1) * rowsPerPage;
              const end = start + rowsPerPage;
              const paginatedData = filteredData.slice(start, end);
              
              paginatedData.forEach(row => tbody.appendChild(row));
              
              document.getElementById('pageInfo').textContent = 
                \`Page \${currentPage} sur \${Math.ceil(filteredData.length / rowsPerPage)}\`;
              
              document.getElementById('totalCategories').textContent = 
                \`Total: \${filteredData.length} catégories\`;
              
              document.getElementById('prevPage').disabled = currentPage === 1;
              document.getElementById('nextPage').disabled = 
                currentPage >= Math.ceil(filteredData.length / rowsPerPage);
            }

            function changePage(delta) {
              currentPage += delta;
              updatePagination();
            }

            document.getElementById('searchBox').addEventListener('input', filterTable);
            updatePagination();
          </script>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get('thirdparties')
  async getThirdParties() {
    return this.dolibarrService.getThirdParties();
  }

  @Get('thirdparties/table')
  async getThirdPartiesTable(@Res() res: Response) {
    const thirdParties = await this.dolibarrService.getThirdParties();
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tiers Dolibarr</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            .controls {
              margin-bottom: 20px;
            }
            .search-box {
              padding: 8px;
              width: 300px;
              margin-right: 10px;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              cursor: pointer;
            }
            th:hover {
              background-color: #e6e6e6;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            tr:hover {
              background-color: #f5f5f5;
            }
            .pagination {
              margin-top: 20px;
              text-align: center;
            }
            .pagination button {
              padding: 8px 16px;
              margin: 0 4px;
              cursor: pointer;
            }
            .pagination button:disabled {
              cursor: not-allowed;
              opacity: 0.5;
            }
            .type {
              text-align: center;
            }
            .type.customer {
              color: blue;
            }
            .type.supplier {
              color: green;
            }
            .type.both {
              color: purple;
            }
          </style>
        </head>
        <body>
          <h1>Liste des Tiers</h1>
          <div class="controls">
            <input type="text" id="searchBox" class="search-box" placeholder="Rechercher...">
            <span id="totalThirdParties" style="margin-left: 20px; font-weight: bold;"></span>
          </div>
          <table id="thirdPartiesTable">
            <thead>
              <tr>
                <th onclick="sortTable(0)">ID ↕</th>
                <th onclick="sortTable(1)">Référence ↕</th>
                <th onclick="sortTable(2)">Nom ↕</th>
                <th onclick="sortTable(3)">Type ↕</th>
                <th onclick="sortTable(4)">Email ↕</th>
                <th onclick="sortTable(5)">Téléphone ↕</th>
                <th onclick="sortTable(6)">Ville ↕</th>
                <th onclick="sortTable(7)">Pays ↕</th>
              </tr>
            </thead>
            <tbody>
              ${thirdParties.map(tp => {
                // Standardisation des valeurs pour client et fournisseur
                const isClient = tp.client === 1 || tp.client === true || tp.client === '1';
                const isSupplier = tp.fournisseur === 1 || tp.fournisseur === true || tp.fournisseur === '1';

                let typeClass = '';
                if (isClient && isSupplier) {
                  typeClass = 'both';
                } else if (isClient) {
                  typeClass = 'customer';
                } else if (isSupplier) {
                  typeClass = 'supplier';
                }

                const getTypeLabel = () => {
                  if (isClient && isSupplier) return 'Client & Fournisseur';
                  if (isClient) return 'Client';
                  if (isSupplier) return 'Fournisseur';
                  return 'Autre';
                };

                return `
                <tr>
                  <td>${tp.id}</td>
                  <td>${tp.ref}</td>
                  <td>${tp.name}</td>
                  <td class="type ${typeClass}">${getTypeLabel()}</td>
                  <td>${tp.email || '-'}</td>
                  <td>${tp.phone || '-'}</td>
                  <td>${tp.town || '-'}</td>
                  <td>${tp.country || '-'}</td>
                </tr>
              `}).join('')}
            </tbody>
          </table>
          <div class="pagination">
            <button onclick="changePage(-1)" id="prevPage">Précédent</button>
            <span id="pageInfo">Page 1</span>
            <button onclick="changePage(1)" id="nextPage">Suivant</button>
          </div>

          <script>
            let currentPage = 1;
            const rowsPerPage = 10;
            let currentSort = { column: 0, direction: 'asc' };
            let filteredData = [...document.querySelectorAll('#thirdPartiesTable tbody tr')];

            function sortTable(column) {
              const tbody = document.querySelector('#thirdPartiesTable tbody');
              const rows = Array.from(tbody.querySelectorAll('tr'));
              
              if (currentSort.column === column) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
              } else {
                currentSort.column = column;
                currentSort.direction = 'asc';
              }

              rows.sort((a, b) => {
                const aValue = a.cells[column].textContent;
                const bValue = b.cells[column].textContent;
                
                if (column === 0) { // ID column
                  return currentSort.direction === 'asc' 
                    ? parseInt(aValue) - parseInt(bValue)
                    : parseInt(bValue) - parseInt(aValue);
                }
                
                return currentSort.direction === 'asc'
                  ? aValue.localeCompare(bValue)
                  : bValue.localeCompare(aValue);
              });

              tbody.innerHTML = '';
              rows.forEach(row => tbody.appendChild(row));
              updatePagination();
            }

            function filterTable() {
              const searchBox = document.getElementById('searchBox');
              const searchText = searchBox.value.toLowerCase();
              
              filteredData = Array.from(document.querySelectorAll('#thirdPartiesTable tbody tr')).filter(row => {
                return Array.from(row.cells).some(cell => 
                  cell.textContent.toLowerCase().includes(searchText)
                );
              });

              currentPage = 1;
              updatePagination();
            }

            function updatePagination() {
              const tbody = document.querySelector('#thirdPartiesTable tbody');
              tbody.innerHTML = '';
              
              const start = (currentPage - 1) * rowsPerPage;
              const end = start + rowsPerPage;
              const paginatedData = filteredData.slice(start, end);
              
              paginatedData.forEach(row => tbody.appendChild(row));
              
              document.getElementById('pageInfo').textContent = 
                \`Page \${currentPage} sur \${Math.ceil(filteredData.length / rowsPerPage)}\`;
              
              document.getElementById('totalThirdParties').textContent = 
                \`Total: \${filteredData.length} tiers\`;
              
              document.getElementById('prevPage').disabled = currentPage === 1;
              document.getElementById('nextPage').disabled = 
                currentPage >= Math.ceil(filteredData.length / rowsPerPage);
            }

            function changePage(delta) {
              currentPage += delta;
              updatePagination();
            }

            document.getElementById('searchBox').addEventListener('input', filterTable);
            updatePagination();
          </script>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get('categories/tree')
  async getCategoryTreeView(@Res() res: Response) {
    const categoryTree = await this.dolibarrService.getCategoryTree();
    
    const generateTreeHtml = (categories: CategoryTree[]): string => {
      if (!categories || categories.length === 0) return '';
      
      return `
        <ul class="category-tree">
          ${categories.map(category => `
            <li class="category-item">
              <div class="category-header" onclick="toggleCategory('${category.id}')">
                <span class="toggle-icon">▶</span>
                <span class="category-label">${category.label}</span>
                <span class="product-count">(${category.products?.length || 0} produits)</span>
              </div>
              
              <div id="category-${category.id}" class="category-content" style="display: none;">
                ${category.description ? `
                  <div class="category-description">
                    ${category.description}
                  </div>
                ` : ''}
                
                ${category.products && category.products.length > 0 ? `
                  <div class="product-list">
                    <h4>Produits :</h4>
                    <div class="product-grid">
                      ${category.products.map(product => `
                        <div class="product-card">
                          <h3>${product.label}</h3>
                          <p class="product-ref">Réf: ${product.ref}</p>
                          <p class="product-price">${parseFloat(product.price_ttc).toFixed(2)} €</p>
                          <p class="product-stock">Stock: ${product.stock || 0}</p>
                          <a href="/api/dolibarr/products/${product.id}/details" class="product-link">Voir détails</a>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
                
                ${generateTreeHtml(category.children || [])}
              </div>
            </li>
          `).join('')}
        </ul>
      `;
    };

    const content = `
      <h1>Arborescence des Catégories</h1>
      <div class="category-controls">
        <input type="text" id="categorySearch" placeholder="Rechercher une catégorie..." />
        <button onclick="expandAll()">Tout déplier</button>
        <button onclick="collapseAll()">Tout replier</button>
      </div>
      ${generateTreeHtml(categoryTree)}
      
      <style>
        .category-tree {
          list-style: none;
          padding-left: 20px;
        }
        .category-item {
          margin: 10px 0;
        }
        .category-header {
          cursor: pointer;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 4px;
          display: flex;
          align-items: center;
        }
        .category-header:hover {
          background: #e9ecef;
        }
        .toggle-icon {
          margin-right: 10px;
          transition: transform 0.3s;
        }
        .category-label {
          font-weight: bold;
          flex: 1;
        }
        .product-count {
          color: #6c757d;
        }
        .category-description {
          margin: 10px 0;
          padding: 10px;
          background: #fff;
          border-left: 3px solid #007bff;
        }
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }
        .product-card {
          padding: 15px;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          transition: transform 0.2s;
        }
        .product-card:hover {
          transform: translateY(-5px);
        }
        .category-controls {
          margin-bottom: 20px;
          display: flex;
          gap: 10px;
        }
        #categorySearch {
          flex: 1;
          padding: 8px;
          border: 1px solid #dee2e6;
          border-radius: 4px;
        }
      </style>
      
      <script>
        function toggleCategory(id) {
          const content = document.getElementById(\`category-\${id}\`);
          const icon = content.previousElementSibling.querySelector('.toggle-icon');
          if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.style.transform = 'rotate(90deg)';
          } else {
            content.style.display = 'none';
            icon.style.transform = 'rotate(0)';
          }
        }
        
        function expandAll() {
          document.querySelectorAll('.category-content').forEach(content => {
            content.style.display = 'block';
            content.previousElementSibling.querySelector('.toggle-icon').style.transform = 'rotate(90deg)';
          });
        }
        
        function collapseAll() {
          document.querySelectorAll('.category-content').forEach(content => {
            content.style.display = 'none';
            content.previousElementSibling.querySelector('.toggle-icon').style.transform = 'rotate(0)';
          });
        }
        
        document.getElementById('categorySearch').addEventListener('input', function(e) {
          const search = e.target.value.toLowerCase();
          document.querySelectorAll('.category-item').forEach(item => {
            const label = item.querySelector('.category-label').textContent.toLowerCase();
            if (label.includes(search)) {
              item.style.display = 'block';
              let parent = item.parentElement;
              while (parent && !parent.classList.contains('container')) {
                if (parent.style.display === 'none') {
                  parent.style.display = 'block';
                }
                parent = parent.parentElement;
              }
            } else {
              item.style.display = 'none';
            }
          });
        });
      </script>
    `;

    res.send(generateLayout('Catégories', content));
  }

  @Get('categories/:id/products')
  async getCategoryProducts(@Param('id') categoryId: string) {
    try {
      const products = await this.dolibarrService.getCategoryProducts(categoryId);
      return products;
    } catch (error) {
      throw new Error(`Impossible de récupérer les produits de la catégorie : ${error.message}`);
    }
  }

  @Get('products-view')
  async getAllProductsView(@Res() res: Response) {
    const products = await this.dolibarrService.getProducts();
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Produits</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            .controls {
              margin-bottom: 20px;
            }
            .search-box {
              padding: 8px;
              width: 300px;
              margin-right: 10px;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              cursor: pointer;
            }
            th:hover {
              background-color: #e6e6e6;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            tr:hover {
              background-color: #f5f5f5;
            }
            .pagination {
              margin-top: 20px;
              text-align: center;
            }
            .pagination button {
              padding: 8px 16px;
              margin: 0 4px;
              cursor: pointer;
            }
            .pagination button:disabled {
              cursor: not-allowed;
              opacity: 0.5;
            }
            .price {
              text-align: right;
            }
            .stock {
              text-align: center;
            }
            .stock.low {
              color: red;
            }
            .stock.medium {
              color: orange;
            }
            .stock.high {
              color: green;
            }
          </style>
        </head>
        <body>
          <h1>Liste des Produits</h1>
          <div class="controls">
            <input type="text" id="searchBox" class="search-box" placeholder="Rechercher...">
          </div>
          <table id="productsTable">
            <thead>
              <tr>
                <th onclick="sortTable(0)">ID ↕</th>
                <th onclick="sortTable(1)">Référence ↕</th>
                <th onclick="sortTable(2)">Label ↕</th>
                <th onclick="sortTable(3)">Description ↕</th>
                <th onclick="sortTable(4)">Prix HT ↕</th>
                <th onclick="sortTable(5)">Prix TTC ↕</th>
                <th onclick="sortTable(6)">Stock ↕</th>
                <th onclick="sortTable(7)">Catégorie ↕</th>
              </tr>
            </thead>
            <tbody>
              ${products.map(prod => {
                let stockClass = 'low';
                if (prod.stock >= 50) {
                  stockClass = 'high';
                } else if (prod.stock >= 10) {
                  stockClass = 'medium';
                }
                return `
                <tr>
                  <td>${prod.id}</td>
                  <td>${prod.ref}</td>
                  <td>${prod.label}</td>
                  <td>${prod.description || ''}</td>
                  <td class="price">${this.formatPrice(prod.price_ht)}</td>
                  <td class="price">${this.formatPrice(prod.price_ttc)}</td>
                  <td class="stock ${stockClass}">${prod.stock || 0}</td>
                  <td>${prod.category || '-'}</td>
                </tr>
              `;
              }).join('')}
            </tbody>
          </table>
          <div class="pagination">
            <button onclick="changePage(-1)" id="prevPage">Précédent</button>
            <span id="pageInfo">Page 1</span>
            <button onclick="changePage(1)" id="nextPage">Suivant</button>
          </div>

          <script>
            let currentPage = 1;
            const rowsPerPage = 10;
            let currentSort = { column: 0, direction: 'asc' };
            let filteredData = [...document.querySelectorAll('#productsTable tbody tr')];

            function sortTable(column) {
              const tbody = document.querySelector('#productsTable tbody');
              const rows = Array.from(tbody.querySelectorAll('tr'));
              
              if (currentSort.column === column) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
              } else {
                currentSort.column = column;
                currentSort.direction = 'asc';
              }

              rows.sort((a, b) => {
                const aValue = a.cells[column].textContent;
                const bValue = b.cells[column].textContent;
                
                if (column === 0 || column === 4 || column === 5 || column === 6) { // Numeric columns
                  const aNum = parseFloat(aValue) || 0;
                  const bNum = parseFloat(bValue) || 0;
                  return currentSort.direction === 'asc' ? aNum - bNum : bNum - aNum;
                }
                
                return currentSort.direction === 'asc'
                  ? aValue.localeCompare(bValue)
                  : bValue.localeCompare(aValue);
              });

              tbody.innerHTML = '';
              rows.forEach(row => tbody.appendChild(row));
              updatePagination();
            }

            function filterTable() {
              const searchBox = document.getElementById('searchBox');
              const searchText = searchBox.value.toLowerCase();
              
              filteredData = Array.from(document.querySelectorAll('#productsTable tbody tr')).filter(row => {
                return Array.from(row.cells).some(cell => 
                  cell.textContent.toLowerCase().includes(searchText)
                );
              });

              currentPage = 1;
              updatePagination();
            }

            function updatePagination() {
              const tbody = document.querySelector('#productsTable tbody');
              tbody.innerHTML = '';
              
              const start = (currentPage - 1) * rowsPerPage;
              const end = start + rowsPerPage;
              const paginatedData = filteredData.slice(start, end);
              
              paginatedData.forEach(row => tbody.appendChild(row));
              
              document.getElementById('pageInfo').textContent = 
                \`Page \${currentPage} sur \${Math.ceil(filteredData.length / rowsPerPage)}\`;
              
              document.getElementById('prevPage').disabled = currentPage === 1;
              document.getElementById('nextPage').disabled = 
                currentPage >= Math.ceil(filteredData.length / rowsPerPage);
            }

            function changePage(delta) {
              currentPage += delta;
              updatePagination();
            }

            document.getElementById('searchBox').addEventListener('input', filterTable);
            updatePagination();
          </script>
        </body>
      </html>
    `;
    
    res.send(html);
  }
}