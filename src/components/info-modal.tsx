'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { PlayCircle, ImageIcon, Music, BookOpen } from 'lucide-react'

interface InfoModalProps {
  peopleId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const peopleData: Record<string, {
  name: string
  region: string
  description: string
  population: string
  language: string
  videoUrl: string
  images: string[]
  audioDescription: string
  story: string
}> = {
  ainu: {
    name: 'Ainu People',
    region: 'Hokkaido, Japan',
    description: 'The Ainu are the indigenous people of Japan with their own unique language, culture, and traditions. They cherish a deep connection with nature and maintain a rich oral literature and artistic heritage.',
    population: 'Approx. 25,000',
    language: 'Ainu language',
    videoUrl: 'https://www.youtube.com/embed/example',
    images: [
      '/ainu-traditional-clothing-ceremony.jpg',
      '/ainu-wooden-carving-art.jpg',
    ],
    audioDescription: 'Traditional Ainu music "Upopo" recording available.',
    story: 'The Ainu people have lived in harmony with the land of Hokkaido for thousands of years. Their culture is rooted in deep respect for nature, known for traditional ceremonies like the bear-sending ritual "Iyomante" and beautiful embroidery and wood carving crafts.',
  },
  maori: {
    name: 'Māori People',
    region: 'New Zealand',
    description: 'The Māori are the indigenous people of New Zealand. They are known for their distinctive tattoos "Tā moko" and war dance "Haka."',
    population: 'Approx. 775,000',
    language: 'Māori language',
    videoUrl: 'https://www.youtube.com/embed/example',
    images: [
      '/maori-haka-performance-warriors.jpg',
      '/maori-traditional-meeting-house.jpg',
    ],
    audioDescription: 'Traditional Māori song "Waiata" audio.',
    story: 'The Māori people arrived in New Zealand from Polynesia over 1,000 years ago. They built a powerful tribal society with rich mythology and legends. Facial tattoos "Tā moko" are an important cultural practice expressing personal identity and lineage.',
  },
  navajo: {
    name: 'Navajo Nation',
    region: 'Southwestern United States',
    description: 'The Navajo are the largest Native American tribe in North America. They are famous for their beautiful weaving, silverwork, and sand painting, continuing to preserve their unique language and culture.',
    population: 'Approx. 300,000',
    language: 'Navajo language',
    videoUrl: 'https://www.youtube.com/embed/example',
    images: [
      '/navajo-traditional-weaving-colorful-textiles.jpg',
      '/navajo-monument-valley-landscape.jpg',
    ],
    audioDescription: 'Traditional Navajo songs and drum recordings.',
    story: 'The Navajo people live on vast lands spanning Arizona, New Mexico, and Utah. Their culture emphasizes harmony with nature and is known for beautiful hand-woven rugs and intricate silverwork. During World War II, the Navajo language code contributed to Allied victory.',
  },
  sami: {
    name: 'Sámi People',
    region: 'Northern Europe (Norway, Sweden, Finland, Russia)',
    description: 'The Sámi are the only indigenous people of Europe living in the Arctic region. They are known for reindeer herding and distinctive joik music.',
    population: 'Approx. 80,000-100,000',
    language: 'Sámi languages (multiple dialects)',
    videoUrl: 'https://www.youtube.com/embed/example',
    images: [
      '/sami-people-traditional-clothing-colorful.jpg',
      '/sami-reindeer-herding-northern-lights.jpg',
    ],
    audioDescription: 'Traditional joik (Sámi song) recording.',
    story: 'The Sámi people have lived in the harsh Arctic environment for thousands of years. Reindeer herding is at the heart of their culture and an important part of their traditional lifestyle. Colorful traditional clothing "Gákti" and the unique singing form "joik" are symbols of their rich cultural heritage.',
  },
  aboriginal: {
    name: 'Aboriginal Australians',
    region: 'Australia',
    description: 'Indigenous people of Australia, considered to have the world\'s oldest continuous culture. Famous for Dreamtime mythology and dot paintings.',
    population: 'Approx. 798,000',
    language: 'Over 250 indigenous languages',
    videoUrl: 'https://www.youtube.com/embed/example',
    images: [
      '/aboriginal-dot-painting-art-colorful.jpg',
      '/aboriginal-didgeridoo-player-ceremony.jpg',
    ],
    audioDescription: 'Traditional didgeridoo performance.',
    story: 'Aboriginal people have lived on the Australian continent for over 65,000 years, maintaining the world\'s oldest continuous culture. Their spirituality centers on "Dreamtime" creation mythology, expressing deep connections with the land. Dot paintings and rock art are part of their rich artistic tradition.',
  },
  inuit: {
    name: 'Inuit',
    region: 'Arctic Region (Canada, Greenland, Alaska)',
    description: 'The Inuit are indigenous people living in the freezing environment of the Arctic region. They are known for their hunting techniques, igloos, and unique art.',
    population: 'Approx. 168,000',
    language: 'Inuktitut language',
    videoUrl: 'https://www.youtube.com/embed/example',
    images: [
      '/inuit-people-traditional-parka-arctic.jpg',
      '/inuit-soapstone-carving-sculpture.jpg',
    ],
    audioDescription: 'Inuit throat singing recording.',
    story: 'The Inuit people have survived for thousands of years in one of Earth\'s harshest environments. Their traditional knowledge and techniques enable survival in extreme cold climates. Stone carving art, especially soapstone sculpture, is highly valued worldwide.',
  },
  maya: {
    name: 'Maya People',
    region: 'Mexico, Guatemala, Belize, Honduras',
    description: 'Descendants of the Maya civilization, possessing advanced knowledge of astronomy, mathematics, and architecture. They continue to maintain traditional lifestyles today.',
    population: 'Approx. 7 million',
    language: 'Mayan languages (over 30 languages)',
    videoUrl: 'https://www.youtube.com/embed/example',
    images: [
      '/maya-traditional-clothing-ceremony-colorful.jpg',
      '/maya-pyramid-temple-ancient-architecture.jpg',
    ],
    audioDescription: 'Traditional Maya music and instrument recordings.',
    story: 'The Maya people built one of the most advanced civilizations in the ancient world. They are known for complex calendar systems, hieroglyphic writing, and magnificent stone architecture. Modern Maya continue to preserve ancestral culture through traditional agricultural techniques, weaving, and ceremonies.',
  },
  masai: {
    name: 'Maasai People',
    region: 'Kenya, Tanzania',
    description: 'The Maasai are semi-nomadic people of East Africa, known for their vibrant red clothing and traditional jumping dance.',
    population: 'Approx. 900,000',
    language: 'Maa language',
    videoUrl: 'https://www.youtube.com/embed/example',
    images: [
      '/placeholder.svg?height=400&width=600',
      '/placeholder.svg?height=400&width=600',
    ],
    audioDescription: 'Traditional Maasai songs and dance music.',
    story: 'The Maasai people have lived a cattle-centered lifestyle on the East African grasslands for centuries. Their culture emphasizes courage and warrior spirit, famous for vibrant red cloth "Shuka" and intricate beadwork. The traditional jumping dance "Adumu" is an important part of their cultural identity.',
  },
  karen: {
    name: 'Karen People',
    region: 'Thailand, Myanmar',
    description: 'The Karen are ethnic people living in the mountainous regions of Southeast Asia with their own language, culture, and traditions. Also known as long-neck people.',
    population: 'Approx. 7 million',
    language: 'Karen languages',
    videoUrl: 'https://www.youtube.com/embed/example',
    images: [
      '/placeholder.svg?height=400&width=600',
      '/placeholder.svg?height=400&width=600',
    ],
    audioDescription: 'Traditional Karen music and instrument recordings.',
    story: 'The Karen people continue to preserve traditional agricultural and weaving techniques in the mountainous regions of Thailand and Myanmar. Their culture is known for rich oral traditions and intricate hand-woven fabrics. Some Karen women practice the traditional custom of wearing brass neck rings.',
  },
  quechua: {
    name: 'Quechua People',
    region: 'Peru, Bolivia, Ecuador (Andes Mountains)',
    description: 'Descendants of the Inca Empire, known for highland agricultural techniques and beautiful textiles. They maintain their unique language and culture.',
    population: 'Approx. 10 million',
    language: 'Quechua language',
    videoUrl: 'https://www.youtube.com/embed/example',
    images: [
      '/placeholder.svg?height=400&width=600',
      '/placeholder.svg?height=400&width=600',
    ],
    audioDescription: 'Traditional Andean flute music (quena and zampoña).',
    story: 'The Quechua people are descendants of the civilization that once built the vast Inca Empire. They developed innovative agricultural techniques using terraced fields in the high-altitude Andes Mountains. Colorful textiles, traditional music, and ancient wisdom remain central to their culture.',
  },
}

export function InfoModal({ peopleId, open, onOpenChange }: InfoModalProps) {
  if (!peopleId || !peopleData[peopleId]) {
    return null
  }

  const data = peopleData[peopleId]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border bg-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl font-bold text-pretty">
                {data.name}
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                {data.region}
              </DialogDescription>
            </div>
            <div className="flex flex-col gap-2">
              <Badge variant="secondary" className="whitespace-nowrap">
                Population: {data.population}
              </Badge>
              <Badge variant="outline" className="whitespace-nowrap">
                {data.language}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1">
          <div className="border-b border-border bg-muted/30 px-6">
            <TabsList className="bg-transparent h-auto p-0 gap-4">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="video"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Video
              </TabsTrigger>
              <TabsTrigger
                value="photos"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Photos
              </TabsTrigger>
              <TabsTrigger
                value="audio"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3"
              >
                <Music className="h-4 w-4 mr-2" />
                Audio
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[500px]">
            <TabsContent value="overview" className="p-6 mt-0 space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-foreground">
                  About the Culture
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {data.description}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3 text-foreground">
                  History and Story
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {data.story}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Estimated Population
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {data.population}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Language
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {data.language}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="video" className="p-6 mt-0">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <PlayCircle className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-semibold text-foreground mb-2">
                      Cultural Introduction Video: {data.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      In the actual project, a video would be embedded here
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                This video introduces the traditional lifestyle, ceremonies, art, and modern challenges of the {data.name}.
              </p>
            </TabsContent>

            <TabsContent value="photos" className="p-6 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.images.map((img, index) => (
                  <div
                    key={index}
                    className="aspect-[4/3] bg-muted rounded-lg overflow-hidden"
                  >
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`${data.name} - Photo ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Photo collection capturing traditional culture, ceremonies, and daily life of the {data.name}.
              </p>
            </TabsContent>

            <TabsContent value="audio" className="p-6 mt-0">
              <div className="bg-muted rounded-lg p-8 text-center space-y-4">
                <Music className="h-16 w-16 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-semibold text-foreground mb-2">
                    Traditional Music and Audio Stories
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {data.audioDescription}
                  </p>
                </div>
                <div className="bg-background rounded-lg p-4 max-w-md mx-auto">
                  <div className="flex items-center gap-3">
                    <button className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
                      <PlayCircle className="h-5 w-5" />
                    </button>
                    <div className="flex-1 h-1 bg-border rounded-full">
                      <div className="h-full w-1/3 bg-primary rounded-full" />
                    </div>
                    <span className="text-xs text-muted-foreground">2:45</span>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Listen to traditional music, songs, and oral stories told by elders of the {data.name}.
              </p>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
