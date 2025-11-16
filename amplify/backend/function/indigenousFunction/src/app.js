/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/




const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const { Pool } = require('pg')

// PostgreSQL connection pool
const pool = new Pool({
  host: 'culturecompass-db.cbqmia4we3up.us-east-2.rds.amazonaws.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'hZ04YADHXbDbrXBxga6a',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false
  }
})

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

/**********************
 * Database test endpoint *
 **********************/
app.get('/api/test-db', async function(req, res) {
  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as version');
    res.json({
      success: true,
      message: 'Database connection successful!',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// =====================================================
// USERS ENDPOINTS
// =====================================================

// Get all users
app.get('/api/users', async function(req, res) {
  try {
    const result = await pool.query('SELECT user_id, name, email, role, location, indigenous_nation, willing_to_connect, bio, interests, profile_image_url, is_active, created_at FROM users WHERE is_active = TRUE ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user by ID
app.get('/api/users/:id', async function(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT user_id, name, email, role, location, indigenous_nation, willing_to_connect, bio, interests, profile_image_url, is_active, created_at FROM users WHERE user_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new user
app.post('/api/users', async function(req, res) {
  try {
    const { name, email, password_hash, role, location, indigenous_nation, willing_to_connect, bio, interests } = req.body;
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, location, indigenous_nation, willing_to_connect, bio, interests) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING user_id, name, email, role, created_at',
      [name, email, password_hash, role || 'learner', location, indigenous_nation, willing_to_connect || false, bio, interests]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update user
app.put('/api/users/:id', async function(req, res) {
  try {
    const { id } = req.params;
    const { name, location, indigenous_nation, willing_to_connect, bio, interests, profile_image_url } = req.body;
    const result = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), location = COALESCE($2, location), indigenous_nation = COALESCE($3, indigenous_nation), willing_to_connect = COALESCE($4, willing_to_connect), bio = COALESCE($5, bio), interests = COALESCE($6, interests), profile_image_url = COALESCE($7, profile_image_url) WHERE user_id = $8 RETURNING user_id, name, email, role, location, indigenous_nation, willing_to_connect, bio, interests',
      [name, location, indigenous_nation, willing_to_connect, bio, interests, profile_image_url, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete user (soft delete)
app.delete('/api/users/:id', async function(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query('UPDATE users SET is_active = FALSE WHERE user_id = $1 RETURNING user_id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get knowledge keepers willing to connect
app.get('/api/knowledge-keepers', async function(req, res) {
  try {
    const result = await pool.query('SELECT * FROM available_knowledge_keepers');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// STORIES ENDPOINTS
// =====================================================

// Get all public stories
app.get('/api/stories', async function(req, res) {
  try {
    const result = await pool.query('SELECT * FROM public_stories ORDER BY submitted_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get story by ID
app.get('/api/stories/:id', async function(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT s.*, u.name as author_name, u.indigenous_nation as author_nation, t.name as territory_name FROM stories s LEFT JOIN users u ON s.author_user_id = u.user_id LEFT JOIN territories t ON s.territory_id = t.territory_id WHERE s.story_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }
    // Increment view count
    await pool.query('UPDATE stories SET view_count = view_count + 1 WHERE story_id = $1', [id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new story
app.post('/api/stories', async function(req, res) {
  try {
    const { author_user_id, territory_id, title, content, tags, cultural_sensitivity_flag } = req.body;
    const result = await pool.query(
      'INSERT INTO stories (author_user_id, territory_id, title, content, tags, cultural_sensitivity_flag) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [author_user_id, territory_id, title, content, tags, cultural_sensitivity_flag || 'general']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update story
app.put('/api/stories/:id', async function(req, res) {
  try {
    const { id } = req.params;
    const { title, content, tags, cultural_sensitivity_flag } = req.body;
    const result = await pool.query(
      'UPDATE stories SET title = COALESCE($1, title), content = COALESCE($2, content), tags = COALESCE($3, tags), cultural_sensitivity_flag = COALESCE($4, cultural_sensitivity_flag) WHERE story_id = $5 RETURNING *',
      [title, content, tags, cultural_sensitivity_flag, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Approve story
app.put('/api/stories/:id/approve', async function(req, res) {
  try {
    const { id } = req.params;
    const { reviewer_id } = req.body;
    await pool.query('SELECT approve_story($1, $2)', [id, reviewer_id]);
    res.json({ success: true, message: 'Story approved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reject story
app.put('/api/stories/:id/reject', async function(req, res) {
  try {
    const { id } = req.params;
    const { reviewer_id, reason } = req.body;
    await pool.query('SELECT reject_story($1, $2, $3)', [id, reviewer_id, reason]);
    res.json({ success: true, message: 'Story rejected' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete story
app.delete('/api/stories/:id', async function(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM stories WHERE story_id = $1 RETURNING story_id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }
    res.json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// EVENTS ENDPOINTS
// =====================================================

// Get all upcoming events
app.get('/api/events', async function(req, res) {
  try {
    const result = await pool.query('SELECT * FROM upcoming_events');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get event by ID
app.get('/api/events/:id', async function(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT e.*, u.name as host_name, u.indigenous_nation as host_nation, t.name as territory_name FROM events e LEFT JOIN users u ON e.host_user_id = u.user_id LEFT JOIN territories t ON e.territory_id = t.territory_id WHERE e.event_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new event
app.post('/api/events', async function(req, res) {
  try {
    const { host_user_id, territory_id, title, description, event_date, event_time, location, latitude, longitude, capacity } = req.body;
    const result = await pool.query(
      'INSERT INTO events (host_user_id, territory_id, title, description, event_date, event_time, location, latitude, longitude, capacity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [host_user_id, territory_id, title, description, event_date, event_time, location, latitude, longitude, capacity]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update event
app.put('/api/events/:id', async function(req, res) {
  try {
    const { id } = req.params;
    const { title, description, event_date, event_time, location, capacity } = req.body;
    const result = await pool.query(
      'UPDATE events SET title = COALESCE($1, title), description = COALESCE($2, description), event_date = COALESCE($3, event_date), event_time = COALESCE($4, event_time), location = COALESCE($5, location), capacity = COALESCE($6, capacity) WHERE event_id = $7 RETURNING *',
      [title, description, event_date, event_time, location, capacity, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Register for event
app.post('/api/events/:id/register', async function(req, res) {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    const result = await pool.query(
      'INSERT INTO event_registrations (event_id, user_id) VALUES ($1, $2) RETURNING *',
      [id, user_id]
    );
    res.status(201).json({ success: true, message: 'Registered successfully', data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ success: false, message: 'Already registered for this event' });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

// Delete event
app.delete('/api/events/:id', async function(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM events WHERE event_id = $1 RETURNING event_id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// TERRITORIES ENDPOINTS
// =====================================================

// Get all territories
app.get('/api/territories', async function(req, res) {
  try {
    const result = await pool.query('SELECT * FROM territories ORDER BY name');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get territory by ID
app.get('/api/territories/:id', async function(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM territories WHERE territory_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Territory not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new territory
app.post('/api/territories', async function(req, res) {
  try {
    const { name, indigenous_nation, description, cultural_significance, video_url, latitude, longitude, created_by } = req.body;
    const result = await pool.query(
      'INSERT INTO territories (name, indigenous_nation, description, cultural_significance, video_url, latitude, longitude, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, indigenous_nation, description, cultural_significance, video_url, latitude, longitude, created_by]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// CONTACT REQUESTS ENDPOINTS
// =====================================================

// Get contact requests for a user
app.get('/api/contact-requests/:user_id', async function(req, res) {
  try {
    const { user_id } = req.params;
    const result = await pool.query(
      'SELECT cr.*, u1.name as from_user_name, u2.name as to_user_name FROM contact_requests cr JOIN users u1 ON cr.from_user_id = u1.user_id JOIN users u2 ON cr.to_user_id = u2.user_id WHERE cr.to_user_id = $1 OR cr.from_user_id = $1 ORDER BY cr.created_at DESC',
      [user_id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create contact request
app.post('/api/contact-requests', async function(req, res) {
  try {
    const { from_user_id, to_user_id, message } = req.body;
    const result = await pool.query(
      'INSERT INTO contact_requests (from_user_id, to_user_id, message) VALUES ($1, $2, $3) RETURNING *',
      [from_user_id, to_user_id, message]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update contact request status
app.put('/api/contact-requests/:id', async function(req, res) {
  try {
    const { id } = req.params;
    const { status, response_message } = req.body;
    const result = await pool.query(
      'UPDATE contact_requests SET status = $1, response_message = $2, responded_at = CURRENT_TIMESTAMP WHERE request_id = $3 RETURNING *',
      [status, response_message, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Contact request not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// MESSAGES ENDPOINTS
// =====================================================

// Get conversation between two users
app.get('/api/messages/:user1_id/:user2_id', async function(req, res) {
  try {
    const { user1_id, user2_id } = req.params;
    const result = await pool.query('SELECT * FROM get_conversation($1, $2)', [user1_id, user2_id]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send message
app.post('/api/messages', async function(req, res) {
  try {
    const { from_user_id, to_user_id, content } = req.body;
    const result = await pool.query(
      'INSERT INTO messages (from_user_id, to_user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [from_user_id, to_user_id, content]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// NOTIFICATIONS ENDPOINTS
// =====================================================

// Get user notifications
app.get('/api/notifications/:user_id', async function(req, res) {
  try {
    const { user_id } = req.params;
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [user_id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', async function(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE notification_id = $1 RETURNING *',
      [id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =====================================================
// ADMIN ENDPOINTS
// =====================================================

// Get pending content
app.get('/api/admin/pending-content', async function(req, res) {
  try {
    const result = await pool.query('SELECT * FROM pending_content_summary');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
