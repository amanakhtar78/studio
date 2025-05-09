
'use client';

import { Sparkles, Clock3, Users, UtensilsCrossed } from 'lucide-react';
import type { HighlightItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const highlightItems: HighlightItem[] = [
  {
    icon: Sparkles,
    title: 'Impeccable Cleanliness',
    description: 'We uphold the highest hygiene standards in our kitchen and dining spaces, ensuring a safe and pleasant experience.',
  },
  {
    icon: Clock3,
    title: 'Swift & Reliable Delivery',
    description: 'Your favorite treats, delivered fresh and fast to your doorstep, typically within 30-45 minutes.',
  },
  {
    icon: Users,
    title: 'Warm Dine-In Ambiance',
    description: 'Enjoy our comfortable setting with friendly service – ideal for gatherings with family and friends.',
  },
];

interface HighlightCardProps {
  item: HighlightItem;
}

function HighlightCard({ item }: HighlightCardProps) {
  const IconComponent = item.icon;
  return (
    <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <IconComponent className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-xl font-semibold text-foreground">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm">{item.description}</p>
      </CardContent>
    </Card>
  );
}

export function WhyChooseUs() {
  return (
    <section className="py-8 md:py-12">
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-10 md:mb-12 text-center">
        Why Choose Zahra Sweet Rolls?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {highlightItems.map((item) => (
          <HighlightCard key={item.title} item={item} />
        ))}
      </div>
    </section>
  );
}
