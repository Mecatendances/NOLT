import { Controller, Get, Res } from '@nestjs/common';
import { DolibarrService } from '../dolibarr/dolibarr.service';
import { Response } from 'express';

@Controller('products')
export class ProductController {
  constructor(private readonly dolibarrService: DolibarrService) {}

  @Get()
  async getAllProducts(@Res() res: Response) {
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
                  <td class="price">${prod.price_ht ? prod.price_ht.toFixed(2) + ' €' : '-'}</td>
                  <td class="price">${prod.price_ttc ? prod.price_ttc.toFixed(2) + ' €' : '-'}</td>
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
