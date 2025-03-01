require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

/**
 * Setup database by running schema.sql
 */
async function setupDatabase() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    
    console.log('Running schema.sql...');
    const schemaPath = path.join(__dirname, '../../schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    await client.query(schemaSql);
    console.log('Schema created successfully!');
    
    await client.end();
    console.log('Database setup completed!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    
    if (client) {
      await client.end();
    }
    
    process.exit(1);
  }
}

// Run setup function
setupDatabase();