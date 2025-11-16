import { useState, useEffect } from 'react'
import { WorldMap } from './components/world-map'
import { InfoModal } from './components/info-modal'
import { StoryForm } from './components/story-form'
import { EventForm } from './components/event-form'
import { ContactForm } from './components/contact-form'
import { CultureCompassHeader } from './components/culture-compass-header'
import { HeroSection } from './components/hero-section'
import { Button } from './components/ui/button'
import { Toaster } from './components/ui/toaster'
import { BookOpen, Calendar, Users, Loader2 } from 'lucide-react'
import { getStories, getEvents, createStory, createEvent, type BackendStory, type BackendEvent } from './lib/api'
import { useToast } from './hooks/use-toast'

export interface Story {
  id: string
  firstName: string
  lastName: string
  location: string
  latitude: number
  longitude: number
  title: string
  shortDescription: string
  story: string
  videoUrl?: string
  createdAt: Date
}

export interface Event {
  id: string
  eventName: string
  hostName: string
  eventDate: string
  eventLocation: string
  latitude: number
  longitude: number
  shortDescription: string
  eventUrl: string
  createdAt: Date
}

export interface Person {
  id: string
  firstName: string
  lastName: string
  pronouns: string
  heritageLocation: string
  latitude: number
  longitude: number
  userDescription: string
  contactInfo?: string
  createdAt: Date
}

function App() {
  const { toast } = useToast()
  const [selectedPeople, setSelectedPeople] = useState<string | null>(null)
  const [storyFormOpen, setStoryFormOpen] = useState(false)
  const [eventFormOpen, setEventFormOpen] = useState(false)
  const [contactFormOpen, setContactFormOpen] = useState(false)
  const [stories, setStories] = useState<Story[]>([])
  const [showStoryPins, setShowStoryPins] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [showEventPins, setShowEventPins] = useState(false)
  const [people, setPeople] = useState<Person[]>([])
  const [showPeoplePins, setShowPeoplePins] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Fetch data from backend on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [backendStories, backendEvents] = await Promise.all([
          getStories(),
          getEvents(),
        ])

        // Transform backend stories to frontend format
        const transformedStories: Story[] = backendStories.map((s: BackendStory) => ({
          id: s.story_id,
          firstName: s.author_name?.split(' ')[0] || 'Anonymous',
          lastName: s.author_name?.split(' ').slice(1).join(' ') || '',
          location: s.territory_name || 'Unknown Location',
          latitude: 49.2827,
          longitude: -123.1207,
          title: s.title,
          shortDescription: s.tags?.join(', ') || '',
          story: s.content,
          videoUrl: undefined,
          createdAt: new Date(s.submitted_at),
        }))

        // Transform backend events to frontend format
        const transformedEvents: Event[] = backendEvents.map((e: BackendEvent) => ({
          id: e.event_id,
          eventName: e.title,
          hostName: e.host_name || 'Unknown Host',
          eventDate: e.event_date,
          eventLocation: e.location,
          latitude: e.latitude,
          longitude: e.longitude,
          shortDescription: e.description,
          eventUrl: '',
          createdAt: new Date(e.event_date),
        }))

        setStories(transformedStories)
        setEvents(transformedEvents)

        toast({
          title: "Data loaded",
          description: `Loaded ${transformedStories.length} stories and ${transformedEvents.length} events`,
        })
      } catch (error) {
        console.error('Failed to load data:', error)
        toast({
          title: "Error",
          description: "Failed to load data from backend",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const handleAddStory = async (story: Omit<Story, 'id' | 'createdAt'>) => {
    try {
      setSubmitting(true)
      const newStory = await createStory({
        title: story.title,
        content: story.story,
        tags: story.shortDescription ? [story.shortDescription] : [],
      })

      const transformedStory: Story = {
        id: newStory.story_id,
        firstName: story.firstName,
        lastName: story.lastName,
        location: story.location,
        latitude: story.latitude,
        longitude: story.longitude,
        title: newStory.title,
        shortDescription: newStory.tags?.join(', ') || '',
        story: newStory.content,
        videoUrl: story.videoUrl,
        createdAt: new Date(newStory.submitted_at),
      }

      setStories([...stories, transformedStory])
      toast({
        title: "Story submitted!",
        description: "Your story has been submitted for review",
      })
    } catch (error) {
      console.error('Failed to create story:', error)
      toast({
        title: "Error",
        description: "Failed to submit story",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddEvent = async (event: Omit<Event, 'id' | 'createdAt'>) => {
    try {
      setSubmitting(true)
      const newEvent = await createEvent({
        title: event.eventName,
        description: event.shortDescription,
        event_date: event.eventDate,
        event_time: '00:00:00',
        location: event.eventLocation,
        latitude: event.latitude,
        longitude: event.longitude,
        capacity: 50,
      })

      const transformedEvent: Event = {
        id: newEvent.event_id,
        eventName: newEvent.title,
        hostName: event.hostName,
        eventDate: newEvent.event_date,
        eventLocation: newEvent.location,
        latitude: newEvent.latitude,
        longitude: newEvent.longitude,
        shortDescription: newEvent.description,
        eventUrl: event.eventUrl,
        createdAt: new Date(newEvent.event_date),
      }

      setEvents([...events, transformedEvent])
      toast({
        title: "Event submitted!",
        description: "Your event has been submitted for review",
      })
    } catch (error) {
      console.error('Failed to create event:', error)
      toast({
        title: "Error",
        description: "Failed to submit event",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddPerson = (person: Omit<Person, 'id' | 'createdAt'>) => {
    const newPerson: Person = {
      ...person,
      id: `person-${Date.now()}`,
      createdAt: new Date(),
    }
    setPeople([...people, newPerson])
    console.log('[v0] New person added:', newPerson)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading stories and events...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <CultureCompassHeader />
      <HeroSection />

      <header className="bg-gradient-to-b from-background/95 to-background/0 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            WorldMap
          </h1>
          <div className="flex gap-4">
            <Button
              onClick={() => setStoryFormOpen(true)}
              variant="default"
              size="default"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Stories
            </Button>
            <Button
              onClick={() => setEventFormOpen(true)}
              variant="default"
              size="default"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Events
            </Button>
            <Button
              onClick={() => setContactFormOpen(true)}
              variant="default"
              size="default"
            >
              <Users className="mr-2 h-4 w-4" />
              People
            </Button>
          </div>
        </div>
      </header>

      <div style={{ marginTop: '32px' }}>
        <WorldMap
          onSelectPeople={setSelectedPeople}
          onOpenStoryForm={() => setStoryFormOpen(true)}
          onOpenEventForm={() => setEventFormOpen(true)}
          onOpenContactForm={() => setContactFormOpen(true)}
          stories={stories}
          showStoryPins={showStoryPins}
          onToggleStoryPins={() => setShowStoryPins(!showStoryPins)}
          events={events}
          showEventPins={showEventPins}
          onToggleEventPins={() => setShowEventPins(!showEventPins)}
          people={people}
          showPeoplePins={showPeoplePins}
          onTogglePeoplePins={() => setShowPeoplePins(!showPeoplePins)}
        />
      </div>

      <InfoModal
        peopleId={selectedPeople}
        open={!!selectedPeople}
        onOpenChange={(open) => !open && setSelectedPeople(null)}
      />

      <StoryForm
        open={storyFormOpen}
        onOpenChange={setStoryFormOpen}
        onSubmit={handleAddStory}
      />
      <EventForm
        open={eventFormOpen}
        onOpenChange={setEventFormOpen}
        onSubmit={handleAddEvent}
      />
      <ContactForm
        open={contactFormOpen}
        onOpenChange={setContactFormOpen}
        onSubmit={handleAddPerson}
      />
      <Toaster />
    </main>
  )
}

export default App
