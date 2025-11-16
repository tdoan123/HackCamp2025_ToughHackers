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

async function checkData() {
  try {
    await client.connect();

    // Check stories
    console.log('=== STORIES ===');
    const stories = await client.query('SELECT story_id, title, status, is_public FROM stories');
    console.log(`Total stories: ${stories.rows.length}`);
    stories.rows.forEach(s => {
      console.log(`  - ${s.title}: status=${s.status}, is_public=${s.is_public}`);
    });

    // Check public stories view
    const publicStories = await client.query('SELECT * FROM public_stories');
    console.log(`\nPublic stories (from view): ${publicStories.rows.length}`);

    // Check events
    console.log('\n=== EVENTS ===');
    const events = await client.query('SELECT event_id, title, event_date, status, is_public FROM events');
    console.log(`Total events: ${events.rows.length}`);
    events.rows.forEach(e => {
      console.log(`  - ${e.title}: date=${e.event_date}, status=${e.status}, is_public=${e.is_public}`);
    });

    // Check upcoming events view
    const upcomingEvents = await client.query('SELECT * FROM upcoming_events');
    console.log(`\nUpcoming events (from view): ${upcomingEvents.rows.length}`);

    // Check users
    console.log('\n=== USERS ===');
    const users = await client.query('SELECT name, role FROM users');
    users.rows.forEach(u => {
      console.log(`  - ${u.name}: ${u.role}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkData();
