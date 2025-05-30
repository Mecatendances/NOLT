const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '80PmrhDuCIBO61Z1',
  database: process.env.DB_NAME || 'ecommerce',
});

const users = [
  {
    email: 'admin@fcchalon.com',
    password: 'password',
    role: 'ADMIN',
    name: 'Admin FC Chalon',
  },
  {
    email: 'licensee@boutique.com',
    password: 'password',
    role: 'LICENSEE',
    name: 'Licensee Boutique',
  },
  {
    email: 'client@test.com',
    password: 'password',
    role: 'CLIENT',
    name: 'Client Test',
  },
];

async function main() {
  await client.connect();
  for (const user of users) {
    const res = await client.query('SELECT * FROM users WHERE email = $1', [user.email]);
    if (res.rows.length > 0) {
      console.log(`Utilisateur déjà existant : ${user.email}`);
      continue;
    }
    const hashed = await bcrypt.hash(user.password, 12);
    await client.query(
      'INSERT INTO users (id, email, password, role, name) VALUES ($1, $2, $3, $4, $5)',
      [uuidv4(), user.email, hashed, user.role, user.name]
    );
    console.log(`✅ Utilisateur créé : ${user.email} (${user.role})`);
  }
  await client.end();
}

main().catch(console.error); 