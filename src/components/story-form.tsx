'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'

interface StoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (story: {
    firstName: string
    lastName: string
    location: string
    latitude: number
    longitude: number
    title: string
    shortDescription: string
    story: string
    videoUrl?: string
  }) => void
}

export function StoryForm({ open, onOpenChange, onSubmit }: StoryFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    location: '',
    latitude: 0,
    longitude: 0,
    title: '',
    shortDescription: '',
    story: '',
    videoUrl: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[v0] Story form submitted:', formData)
    if (onSubmit) {
      onSubmit({
        ...formData,
        videoUrl: formData.videoUrl || undefined,
      })
    }
    onOpenChange(false)
    setFormData({
      firstName: '',
      lastName: '',
      location: '',
      latitude: 0,
      longitude: 0,
      title: '',
      shortDescription: '',
      story: '',
      videoUrl: '',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="text-2xl font-bold">Share Your Cultural Story</DialogTitle>
          <DialogDescription>
            Share your indigenous culture and experiences with the world
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 overflow-auto">
          <div className="py-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location of Story Origin *</Label>
              <Input
                id="location"
                placeholder="e.g., Vancouver, Canada or Navajo Nation"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.0001"
                  placeholder="e.g., 49.2827"
                  required
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.0001"
                  placeholder="e.g., -123.1207"
                  required
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title of Story *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description (50 characters max) *</Label>
              <Input
                id="shortDescription"
                maxLength={50}
                required
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {formData.shortDescription.length}/50 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="story">Your Story (max 500 words)</Label>
              <Textarea
                id="story"
                rows={8}
                placeholder="Share your cultural story, traditions, or experiences..."
                value={formData.story}
                onChange={(e) => setFormData({ ...formData, story: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {formData.story.split(/\s+/).filter(Boolean).length}/500 words
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoUrl">Or provide a Video URL (optional)</Label>
              <Input
                id="videoUrl"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                YouTube, Vimeo, or other video platform links
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t border-border shrink-0 bg-background">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-3">
              <Button type="submit" className="flex-1">
                Submit Story
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
