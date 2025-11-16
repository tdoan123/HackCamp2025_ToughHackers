-- Indigenous Knowledge Sharing Platform Database Schema
-- PostgreSQL Database

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types for better data integrity
CREATE TYPE user_role AS ENUM ('learner', 'knowledge_keeper', 'moderator', 'admin');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE cultural_sensitivity AS ENUM ('general', 'sacred', 'elders_only');
CREATE TYPE contact_request_status AS ENUM ('pending', 'accepted', 'declined');

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'learner',
    location VARCHAR(255),
    indigenous_nation VARCHAR(255),
    willing_to_connect BOOLEAN DEFAULT FALSE,
    bio TEXT,
    interests TEXT[], -- Array of interests
    permissions TEXT[], -- Array of permissions like ['approve_stories', 'approve_events']
    profile_image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Index for faster queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_willing_to_connect ON users(willing_to_connect);
CREATE INDEX idx_users_indigenous_nation ON users(indigenous_nation);

-- =====================================================
-- TERRITORIES TABLE
-- =====================================================
CREATE TABLE territories (
    territory_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    indigenous_nation VARCHAR(255) NOT NULL,
    description TEXT,
    cultural_significance TEXT,
    video_url TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for location-based queries
CREATE INDEX idx_territories_nation ON territories(indigenous_nation);
CREATE INDEX idx_territories_location ON territories(latitude, longitude);

-- =====================================================
-- STORIES TABLE
-- =====================================================
CREATE TABLE stories (
    story_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    territory_id UUID REFERENCES territories(territory_id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[], -- Array of tags
    status approval_status NOT NULL DEFAULT 'pending',
    cultural_sensitivity_flag cultural_sensitivity DEFAULT 'general',
    is_public BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP,
    rejection_reason TEXT,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX idx_stories_author ON stories(author_user_id);
CREATE INDEX idx_stories_territory ON stories(territory_id);
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_public ON stories(is_public);
CREATE INDEX idx_stories_tags ON stories USING GIN(tags);
CREATE INDEX idx_stories_submitted_at ON stories(submitted_at DESC);

-- =====================================================
-- STORY MEDIA TABLE
-- =====================================================
CREATE TABLE story_media (
    media_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES stories(story_id) ON DELETE CASCADE,
    media_type VARCHAR(50) NOT NULL, -- 'image', 'video', 'audio'
    media_url TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_story_media_story ON story_media(story_id);

-- =====================================================
-- EVENTS TABLE
-- =====================================================
CREATE TABLE events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    territory_id UUID REFERENCES territories(territory_id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    location VARCHAR(500),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    capacity INTEGER,
    registered_count INTEGER DEFAULT 0,
    status approval_status NOT NULL DEFAULT 'pending',
    is_public BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for event queries
CREATE INDEX idx_events_host ON events(host_user_id);
CREATE INDEX idx_events_territory ON events(territory_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_public ON events(is_public);

-- =====================================================
-- EVENT REGISTRATIONS TABLE
-- =====================================================
CREATE TABLE event_registrations (
    registration_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attended BOOLEAN DEFAULT FALSE,
    UNIQUE(event_id, user_id)
);

CREATE INDEX idx_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_registrations_user ON event_registrations(user_id);

-- =====================================================
-- CONTACT REQUESTS TABLE
-- =====================================================
CREATE TABLE contact_requests (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    message TEXT,
    status contact_request_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    response_message TEXT,
    UNIQUE(from_user_id, to_user_id)
);

CREATE INDEX idx_contact_requests_from ON contact_requests(from_user_id);
CREATE INDEX idx_contact_requests_to ON contact_requests(to_user_id);
CREATE INDEX idx_contact_requests_status ON contact_requests(status);

-- =====================================================
-- MESSAGES TABLE
-- =====================================================
CREATE TABLE messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

CREATE INDEX idx_messages_from ON messages(from_user_id);
CREATE INDEX idx_messages_to ON messages(to_user_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at DESC);
CREATE INDEX idx_messages_conversation ON messages(from_user_id, to_user_id);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    notification_type VARCHAR(100) NOT NULL, -- 'story_approved', 'event_approved', 'new_message', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT,
    related_id UUID, -- ID of related story, event, message, etc.
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- =====================================================
-- AUDIT LOG TABLE (for tracking approvals and important actions)
-- =====================================================
CREATE TABLE audit_log (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'approve_story', 'reject_event', 'ban_user', etc.
    entity_type VARCHAR(50) NOT NULL, -- 'story', 'event', 'user', etc.
    entity_id UUID,
    details JSONB, -- Additional details about the action
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_territories_updated_at BEFORE UPDATE ON territories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER FOR STORY APPROVAL
-- =====================================================

-- Function to set is_public when story is approved
CREATE OR REPLACE FUNCTION handle_story_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        NEW.is_public = TRUE;
        NEW.reviewed_at = CURRENT_TIMESTAMP;
    ELSIF NEW.status != 'approved' THEN
        NEW.is_public = FALSE;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER story_approval_trigger BEFORE UPDATE ON stories
    FOR EACH ROW EXECUTE FUNCTION handle_story_approval();

-- =====================================================
-- TRIGGER FOR EVENT APPROVAL
-- =====================================================

-- Function to set is_public when event is approved
CREATE OR REPLACE FUNCTION handle_event_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        NEW.is_public = TRUE;
        NEW.reviewed_at = CURRENT_TIMESTAMP;
    ELSIF NEW.status != 'approved' THEN
        NEW.is_public = FALSE;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER event_approval_trigger BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION handle_event_approval();

-- =====================================================
-- TRIGGER FOR EVENT REGISTRATION COUNT
-- =====================================================

-- Function to update registered_count when someone registers
CREATE OR REPLACE FUNCTION update_event_registration_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE events
        SET registered_count = registered_count + 1
        WHERE event_id = NEW.event_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE events
        SET registered_count = registered_count - 1
        WHERE event_id = OLD.event_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER event_registration_count_trigger
AFTER INSERT OR DELETE ON event_registrations
    FOR EACH ROW EXECUTE FUNCTION update_event_registration_count();

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample users
INSERT INTO users (name, email, password_hash, role, location, indigenous_nation, willing_to_connect, bio, interests, permissions) VALUES
('Sarah Chen', 'sarah@example.com', '$2a$10$samplehash1', 'learner', 'Vancouver, BC', NULL, FALSE, NULL, ARRAY['Coast Salish culture', 'traditional art'], NULL),
('Elder James Wilson', 'jwilson@example.com', '$2a$10$samplehash2', 'knowledge_keeper', 'Haida Gwaii, BC', 'Haida Nation', TRUE, 'Traditional storyteller and carver with 40 years of experience sharing Haida culture.', ARRAY['storytelling', 'carving', 'oral traditions'], NULL),
('Maria Rodriguez', 'maria@example.com', '$2a$10$samplehash3', 'admin', 'Victoria, BC', NULL, FALSE, 'Platform administrator dedicated to preserving indigenous knowledge.', NULL, ARRAY['approve_stories', 'approve_events', 'manage_users', 'moderate_content']),
('Tom Blackwater', 'tom@example.com', '$2a$10$samplehash4', 'moderator', 'Prince George, BC', 'Carrier Nation', TRUE, 'Community moderator and cultural educator.', ARRAY['language preservation', 'traditional ceremonies'], ARRAY['approve_stories', 'approve_events']),
('Lisa Thompson', 'lisa@example.com', '$2a$10$samplehash5', 'learner', 'Kelowna, BC', NULL, FALSE, NULL, ARRAY['indigenous history', 'land acknowledgment'], NULL);

-- Insert sample territories
INSERT INTO territories (name, indigenous_nation, description, cultural_significance, latitude, longitude, created_by) VALUES
('Haida Gwaii', 'Haida Nation', 'The Haida Gwaii archipelago, formerly known as the Queen Charlotte Islands, is an archipelago located off the northern Pacific coast of Canada.', 'Home to ancient cedar forests and the ancestral lands of the Haida people. Rich in cultural heritage including totem poles, longhouses, and traditional art.', 53.2532, -132.0982, (SELECT user_id FROM users WHERE email = 'maria@example.com')),
('Okanagan Territory', 'Syilx Okanagan Nation', 'The traditional territory of the Syilx Okanagan people in the Interior of British Columbia.', 'Sacred lands with important fishing sites, gathering places, and cultural landmarks. Known for sustainable land management practices.', 49.8880, -119.4960, (SELECT user_id FROM users WHERE email = 'maria@example.com')),
('Coast Salish Territory', 'Coast Salish Peoples', 'Traditional lands of the Coast Salish peoples along the Pacific Northwest coast.', 'Home to diverse Coast Salish communities with rich traditions in weaving, carving, and salmon fishing.', 49.2827, -123.1207, (SELECT user_id FROM users WHERE email = 'maria@example.com'));

-- Insert sample stories (some approved, some pending)
INSERT INTO stories (author_user_id, territory_id, title, content, tags, status, cultural_sensitivity_flag, reviewed_by, reviewed_at) VALUES
((SELECT user_id FROM users WHERE email = 'jwilson@example.com'),
 (SELECT territory_id FROM territories WHERE name = 'Haida Gwaii'),
 'The Raven and the First People',
 'Long ago, when the world was new and shrouded in darkness, Raven discovered a clamshell on the beach. Inside were the first humans, scared and unsure. Raven coaxed them out into the world and brought them light by stealing the sun from an old chief who kept it hidden in a box...',
 ARRAY['creation story', 'oral tradition', 'Raven'],
 'approved',
 'general',
 (SELECT user_id FROM users WHERE email = 'maria@example.com'),
 CURRENT_TIMESTAMP - INTERVAL '2 days'),

((SELECT user_id FROM users WHERE email = 'tom@example.com'),
 (SELECT territory_id FROM territories WHERE name = 'Okanagan Territory'),
 'Traditional Salmon Fishing Practices',
 'Our people have been fishing for salmon in these waters for thousands of years. We follow practices passed down through generations, always taking only what we need and giving thanks for the salmon''s sacrifice...',
 ARRAY['fishing', 'sustainability', 'traditions'],
 'pending',
 'general',
 NULL,
 NULL),

((SELECT user_id FROM users WHERE email = 'jwilson@example.com'),
 (SELECT territory_id FROM territories WHERE name = 'Haida Gwaii'),
 'Learning the Art of Cedar Carving',
 'Cedar is sacred to our people. Before taking any cedar, we offer prayers and tobacco. The process of carving is meditative, connecting us to our ancestors who carved before us...',
 ARRAY['carving', 'cedar', 'traditional art'],
 'approved',
 'general',
 (SELECT user_id FROM users WHERE email = 'maria@example.com'),
 CURRENT_TIMESTAMP - INTERVAL '5 days');

-- Insert sample events
INSERT INTO events (host_user_id, territory_id, title, description, event_date, event_time, location, capacity, status, reviewed_by, reviewed_at) VALUES
((SELECT user_id FROM users WHERE email = 'jwilson@example.com'),
 (SELECT territory_id FROM territories WHERE name = 'Haida Gwaii'),
 'Traditional Drum Making Workshop',
 'Learn the art of creating hand drums using traditional methods. All materials provided. Limited spaces available.',
 '2025-12-15',
 '14:00:00',
 'Haida Heritage Centre, Skidegate',
 20,
 'approved',
 (SELECT user_id FROM users WHERE email = 'maria@example.com'),
 CURRENT_TIMESTAMP - INTERVAL '1 day'),

((SELECT user_id FROM users WHERE email = 'tom@example.com'),
 (SELECT territory_id FROM territories WHERE name = 'Okanagan Territory'),
 'Community Feast and Storytelling',
 'Join us for a traditional feast followed by storytelling from our elders. Open to all community members.',
 '2025-11-20',
 '18:00:00',
 'Band Hall, Penticton',
 50,
 'pending',
 NULL,
 NULL);

-- Insert sample contact request
INSERT INTO contact_requests (from_user_id, to_user_id, message, status) VALUES
((SELECT user_id FROM users WHERE email = 'sarah@example.com'),
 (SELECT user_id FROM users WHERE email = 'jwilson@example.com'),
 'I would love to learn more about Haida carving traditions and potentially attend one of your workshops. I am deeply respectful of indigenous culture and eager to learn.',
 'pending');

-- Insert sample event registration
INSERT INTO event_registrations (event_id, user_id) VALUES
((SELECT event_id FROM events WHERE title = 'Traditional Drum Making Workshop'),
 (SELECT user_id FROM users WHERE email = 'sarah@example.com')),
((SELECT event_id FROM events WHERE title = 'Traditional Drum Making Workshop'),
 (SELECT user_id FROM users WHERE email = 'lisa@example.com'));

-- =====================================================
-- HELPFUL VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for approved public stories with author info
CREATE VIEW public_stories AS
SELECT
    s.story_id,
    s.title,
    s.content,
    s.tags,
    s.cultural_sensitivity_flag,
    s.view_count,
    s.submitted_at,
    u.name AS author_name,
    u.indigenous_nation AS author_nation,
    t.name AS territory_name,
    t.indigenous_nation AS territory_nation
FROM stories s
JOIN users u ON s.author_user_id = u.user_id
LEFT JOIN territories t ON s.territory_id = t.territory_id
WHERE s.is_public = TRUE AND s.status = 'approved';

-- View for upcoming approved events
CREATE VIEW upcoming_events AS
SELECT
    e.event_id,
    e.title,
    e.description,
    e.event_date,
    e.event_time,
    e.location,
    e.capacity,
    e.registered_count,
    u.name AS host_name,
    u.indigenous_nation AS host_nation,
    t.name AS territory_name
FROM events e
JOIN users u ON e.host_user_id = u.user_id
LEFT JOIN territories t ON e.territory_id = t.territory_id
WHERE e.is_public = TRUE
  AND e.status = 'approved'
  AND e.event_date >= CURRENT_DATE
ORDER BY e.event_date, e.event_time;

-- View for knowledge keepers willing to connect
CREATE VIEW available_knowledge_keepers AS
SELECT
    user_id,
    name,
    indigenous_nation,
    bio,
    interests,
    location
FROM users
WHERE role = 'knowledge_keeper'
  AND willing_to_connect = TRUE
  AND is_active = TRUE;

-- View for pending content (for admins/moderators)
CREATE VIEW pending_content_summary AS
SELECT
    'story' AS content_type,
    s.story_id AS content_id,
    s.title,
    u.name AS author_name,
    s.submitted_at,
    NULL AS event_date
FROM stories s
JOIN users u ON s.author_user_id = u.user_id
WHERE s.status = 'pending'
UNION ALL
SELECT
    'event' AS content_type,
    e.event_id AS content_id,
    e.title,
    u.name AS author_name,
    e.submitted_at,
    e.event_date
FROM events e
JOIN users u ON e.host_user_id = u.user_id
WHERE e.status = 'pending'
ORDER BY submitted_at;

-- =====================================================
-- USEFUL FUNCTIONS
-- =====================================================

-- Function to get user's full conversation with another user
CREATE OR REPLACE FUNCTION get_conversation(user1_id UUID, user2_id UUID)
RETURNS TABLE (
    message_id UUID,
    from_user_id UUID,
    to_user_id UUID,
    content TEXT,
    sent_at TIMESTAMP,
    is_read BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT m.message_id, m.from_user_id, m.to_user_id, m.content, m.sent_at, m.is_read
    FROM messages m
    WHERE (m.from_user_id = user1_id AND m.to_user_id = user2_id)
       OR (m.from_user_id = user2_id AND m.to_user_id = user1_id)
    ORDER BY m.sent_at;
END;
$$ LANGUAGE plpgsql;

-- Function to approve a story
CREATE OR REPLACE FUNCTION approve_story(
    p_story_id UUID,
    p_reviewer_id UUID
)
RETURNS VOID AS $$
BEGIN
    UPDATE stories
    SET status = 'approved',
        reviewed_by = p_reviewer_id,
        reviewed_at = CURRENT_TIMESTAMP
    WHERE story_id = p_story_id;

    -- Log the action
    INSERT INTO audit_log (user_id, action, entity_type, entity_id)
    VALUES (p_reviewer_id, 'approve_story', 'story', p_story_id);

    -- Create notification for author
    INSERT INTO notifications (user_id, notification_type, title, message, related_id)
    SELECT author_user_id, 'story_approved', 'Story Approved!',
           'Your story "' || title || '" has been approved and is now public.',
           story_id
    FROM stories
    WHERE story_id = p_story_id;
END;
$$ LANGUAGE plpgsql;

-- Function to reject a story
CREATE OR REPLACE FUNCTION reject_story(
    p_story_id UUID,
    p_reviewer_id UUID,
    p_reason TEXT
)
RETURNS VOID AS $$
BEGIN
    UPDATE stories
    SET status = 'rejected',
        reviewed_by = p_reviewer_id,
        reviewed_at = CURRENT_TIMESTAMP,
        rejection_reason = p_reason
    WHERE story_id = p_story_id;

    -- Log the action
    INSERT INTO audit_log (user_id, action, entity_type, entity_id, details)
    VALUES (p_reviewer_id, 'reject_story', 'story', p_story_id,
            jsonb_build_object('reason', p_reason));

    -- Create notification for author
    INSERT INTO notifications (user_id, notification_type, title, message, related_id)
    SELECT author_user_id, 'story_rejected', 'Story Needs Revision',
           'Your story "' || title || '" needs revision. Reason: ' || p_reason,
           story_id
    FROM stories
    WHERE story_id = p_story_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE users IS 'Stores user accounts with role-based permissions';
COMMENT ON TABLE territories IS 'Indigenous territories and their cultural information';
COMMENT ON TABLE stories IS 'User-submitted stories with approval workflow';
COMMENT ON TABLE events IS 'Community events with approval workflow';
COMMENT ON TABLE contact_requests IS 'Requests to connect with knowledge keepers';
COMMENT ON TABLE messages IS 'Direct messages between users';
COMMENT ON TABLE audit_log IS 'Tracks all important actions for accountability';
