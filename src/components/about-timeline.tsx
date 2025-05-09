
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
      <div className="flex flex-col items-center mr-6">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
          <IconComponent className="w-6 h-6" />
        </div>
        {!isLast && <div className="w-px h-24 bg-border mt-2"></div>}
      </div>
      <Card className="flex-grow shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-5 md:p-6">
          <div className="flex items-center mb-2">
            <CalendarDays className="w-5 h-5 mr-2 text-muted-foreground" />
            <p className="text-sm font-semibold text-primary">{event.year}</p>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-1">{event.title}</h3>
          <p className="text-muted-foreground text-sm">{event.description}</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function AboutTimeline() {
  return (
    <section className="py-8 md:py-12">
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-10 md:mb-12 text-center">
        Our Journey
      </h2>
      <div className="relative max-w-3xl mx-auto space-y-8">
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
