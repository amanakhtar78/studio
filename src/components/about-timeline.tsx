
'use client';

import { MapPin, Award, Bike, Star, Rocket, CalendarDays } from 'lucide-react';
import type { TimelineEvent } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const timelineEvents: TimelineEvent[] = [
  {
    year: '2010',
    title: 'Founded',
    description: 'Zahra Sweet Rolls first opened its doors, sharing the joy of baking with the local community.',
    icon: MapPin,
  },
  {
    year: '2012',
    title: 'Won "Best New Diner" Award',
    description: 'Recognized for our unique recipes and commitment to quality by local food critics.',
    icon: Award,
  },
  {
    year: '2015',
    title: 'Launched Online Delivery',
    description: 'Bringing our delicious treats directly to your doorstep with our new online ordering system.',
    icon: Bike,
  },
  {
    year: '2020',
    title: 'Rated 4.8 on FoodieApp',
    description: 'Achieved a high customer satisfaction rating on popular food review platforms.',
    icon: Star,
  },
  {
    year: '2023',
    title: 'Expanded to 5 New Locations',
    description: 'Growing our family and reaching more sweet lovers across the region.',
    icon: Rocket,
  },
];

interface TimelineItemProps {
  event: TimelineEvent;
  isLast: boolean;
}

function TimelineItem({ event, isLast }: TimelineItemProps) {
  const IconComponent = event.icon;
  return (
    <div className="flex items-start">
      <div className="flex flex-col items-center mr-4"> {/* Reduced margin */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md"> {/* Reduced size */}
          <IconComponent className="w-5 h-5" /> {/* Reduced icon size */}
        </div>
        {!isLast && <div className="w-px h-20 bg-border mt-1.5"></div>} {/* Reduced height and margin */}
      </div>
      <Card className="flex-grow shadow-md hover:shadow-lg transition-shadow duration-300"> {/* Reduced shadow */}
        <CardContent className="p-4"> {/* Reduced padding */}
          <div className="flex items-center mb-1.5">
            <CalendarDays className="w-4 h-4 mr-1.5 text-muted-foreground" /> {/* Reduced icon size and margin */}
            <p className="text-xs font-semibold text-primary">{event.year}</p> {/* Reduced font size */}
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">{event.title}</h3> {/* Reduced font size */}
          <p className="text-muted-foreground text-xs">{event.description}</p> {/* Reduced font size */}
        </CardContent>
      </Card>
    </div>
  );
}

export function AboutTimeline() {
  return (
    <section className="py-4 md:py-6"> {/* Reduced padding */}
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-6 md:mb-8 text-center"> {/* Reduced font size and margin */}
        Our Journey
      </h2>
      <div className="relative max-w-2xl mx-auto space-y-6"> {/* Reduced max-width and spacing */}
        {timelineEvents.map((event, index) => (
          <TimelineItem
            key={event.year}
            event={event}
            isLast={index === timelineEvents.length - 1}
          />
        ))}
      </div>
    </section>
  );
}
