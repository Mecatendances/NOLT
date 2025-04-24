import { Controller, Get, Query, Res } from '@nestjs/common';
import { DolibarrService } from './dolibarr.service';
import { Response } from 'express';

@Controller('dolibarr')
export class DolibarrController {
  constructor(private readonly dolibarrService: DolibarrService) {}

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

                const formatPrice = (price) => {
                  if (!price) return '-';
                  const numPrice = parseFloat(price);
                  return isNaN(numPrice) ? '-' : numPrice.toFixed(2) + ' €';
                };

                return `
                <tr>
                  <td>${prod.id}</td>
                  <td>${prod.ref}</td>
                  <td>${prod.label}</td>
                  <td>${prod.description || ''}</td>
                  <td class="price">${formatPrice(prod.price_ht)}</td>
                  <td class="price">${formatPrice(prod.price_ttc)}</td>
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
                let typeClass = '';
                // Vérification des valeurs numériques et booléennes
                const isClient = tp.client === 1 || tp.client === true || tp.client === '1';
                const isSupplier = tp.fournisseur === 1 || tp.fournisseur === true || tp.fournisseur === '1';

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

                // Ajout de logs pour déboguer
                console.log('Tiers:', {
                  id: tp.id,
                  name: tp.name,
                  client: tp.client,
                  fournisseur: tp.fournisseur,
                  isClient,
                  isSupplier,
                  type: getTypeLabel()
                });

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
}
