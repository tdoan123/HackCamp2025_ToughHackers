// API client for Culture Compass backend
const API_BASE_URL = 'https://aurlwyacu4.execute-api.us-east-1.amazonaws.com/dev/api'

// Temporary default user ID for submissions (until auth is implemented)
// This is the "Sarah Chen" learner user from the sample data
const DEFAULT_USER_ID = '6e8d6c4a-9f2b-4c3e-8a1d-7b5c3d2e1f4a'

export interface BackendStory {
  story_id: string
  author_user_id: string
  territory_id: string | null
  title: string
  content: string
  tags: string[]
  status: 'pending' | 'approved' | 'rejected'
  cultural_sensitivity_flag: 'general' | 'sacred' | 'elders_only'
  is_public: boolean
  submitted_at: string
  view_count: number
  author_name?: string
  author_nation?: string
  territory_name?: string
}

export interface BackendEvent {
  event_id: string
  host_user_id: string
  territory_id: string | null
  title: string
  description: string
  event_date: string
  event_time: string
  location: string
  latitude: number
  longitude: number
  capacity: number
  registered_count: number
  status: 'pending' | 'approved' | 'rejected'
  is_public: boolean
  host_name?: string
  host_nation?: string
  territory_name?: string
}

export interface BackendTerritory {
  territory_id: string
  name: string
  indigenous_nation: string
  description: string
  cultural_significance: string
  latitude: number
  longitude: number
}

// Stories API
export async function getStories(): Promise<BackendStory[]> {
  const response = await fetch(`${API_BASE_URL}/stories`)
  if (!response.ok) {
    throw new Error(`Failed to fetch stories: ${response.statusText}`)
  }
  const data = await response.json()
  return data.data || []
}

export async function createStory(story: {
  title: string
  content: string
  tags?: string[]
  territory_id?: string
}): Promise<BackendStory> {
  const response = await fetch(`${API_BASE_URL}/stories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      author_user_id: DEFAULT_USER_ID,
      territory_id: story.territory_id || null,
      title: story.title,
      content: story.content,
      tags: story.tags || [],
      cultural_sensitivity_flag: 'general',
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to create story: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data
}

// Events API
export async function getEvents(): Promise<BackendEvent[]> {
  const response = await fetch(`${API_BASE_URL}/events`)
  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.statusText}`)
  }
  const data = await response.json()
  return data.data || []
}

export async function createEvent(event: {
  title: string
  description: string
  event_date: string
  event_time?: string
  location: string
  latitude: number
  longitude: number
  capacity?: number
  territory_id?: string
}): Promise<BackendEvent> {
  const response = await fetch(`${API_BASE_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      host_user_id: DEFAULT_USER_ID,
      territory_id: event.territory_id || null,
      title: event.title,
      description: event.description,
      event_date: event.event_date,
      event_time: event.event_time || '00:00:00',
      location: event.location,
      latitude: event.latitude,
      longitude: event.longitude,
      capacity: event.capacity || 50,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to create event: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data
}

// Territories API
export async function getTerritories(): Promise<BackendTerritory[]> {
  const response = await fetch(`${API_BASE_URL}/territories`)
  if (!response.ok) {
    throw new Error(`Failed to fetch territories: ${response.statusText}`)
  }
  const data = await response.json()
  return data.data || []
}

// Users API
export async function getKnowledgeKeepers() {
  const response = await fetch(`${API_BASE_URL}/knowledge-keepers`)
  if (!response.ok) {
    throw new Error(`Failed to fetch knowledge keepers: ${response.statusText}`)
  }
  const data = await response.json()
  return data.data || []
}

// Helper function to test database connection
export async function testDbConnection() {
  const response = await fetch(`${API_BASE_URL}/test-db`)
  if (!response.ok) {
    throw new Error(`Failed to test database: ${response.statusText}`)
  }
  return response.json()
}
