const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: 'culturecompass-db.cbqmia4we3up.us-east-2.rds.amazonaws.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'hZ04YADHXbDbrXBxga6a',
  ssl: {
    rejectUnauthorized: false
  }
});

async function runSchema() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    console.log('Reading schema file...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

    console.log('Executing schema...');
    await client.query(schemaSQL);

    console.log('✓ Schema created successfully!');
    console.log('✓ All tables, views, functions, and sample data have been created.');

  } catch (error) {
    console.error('Error executing schema:', error.message);
    console.error('Details:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSchema();
