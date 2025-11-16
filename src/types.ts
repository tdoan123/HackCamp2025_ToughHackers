export interface Person {
  id: string
  createdAt: Date
  firstName: string
  lastName: string
  pronouns: string
  heritageLocation: string
  latitude: number
  longitude: number
  userDescription: string
  contactInfo?: string
}

export interface Event {
  id: string
  createdAt: Date
  eventName: string
  hostName: string
  eventDate: string
  eventLocation: string
  latitude: number
  longitude: number
  shortDescription: string
  eventUrl: string
}

export interface Story {
  id: string
  createdAt: Date
  firstName: string
  lastName: string
  location: string
  latitude: number
  longitude: number
  title: string
  shortDescription: string
  story: string
  videoUrl?: string
}
