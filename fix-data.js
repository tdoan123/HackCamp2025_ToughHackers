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

async function fixData() {
  try {
    await client.connect();
    console.log('Connected to database\n');

    // Fix approved stories to be public
    console.log('Fixing approved stories...');
    const storiesResult = await client.query(`
      UPDATE stories
      SET is_public = TRUE
      WHERE status = 'approved' AND is_public = FALSE
      RETURNING story_id, title
    `);
    console.log(`✓ Updated ${storiesResult.rows.length} stories to public:`);
    storiesResult.rows.forEach(s => console.log(`  - ${s.title}`));

    // Fix approved events to be public
    console.log('\nFixing approved events...');
    const eventsResult = await client.query(`
      UPDATE events
      SET is_public = TRUE
      WHERE status = 'approved' AND is_public = FALSE
      RETURNING event_id, title
    `);
    console.log(`✓ Updated ${eventsResult.rows.length} events to public:`);
    eventsResult.rows.forEach(e => console.log(`  - ${e.title}`));

    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

fixData();
