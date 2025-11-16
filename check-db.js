const { Client } = require('pg');

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

async function checkDatabase() {
  try {
    await client.connect();
    console.log('✓ Connected to database\n');

    // Check tables
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('Tables in database:');
    if (tablesResult.rows.length === 0) {
      console.log('  (none)');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }
    console.log(`\nTotal: ${tablesResult.rows.length} tables\n`);

    // Check if we have sample data
    if (tablesResult.rows.some(r => r.table_name === 'users')) {
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      const storyCount = await client.query('SELECT COUNT(*) FROM stories');
      const eventCount = await client.query('SELECT COUNT(*) FROM events');

      console.log('Sample data:');
      console.log(`  - Users: ${userCount.rows[0].count}`);
      console.log(`  - Stories: ${storyCount.rows[0].count}`);
      console.log(`  - Events: ${eventCount.rows[0].count}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkDatabase();
