
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
    <Card className="text-center shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col"> {/* Reduced shadow */}
      <CardHeader className="pb-3 p-4"> {/* Reduced padding */}
        <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3"> {/* Reduced size and margin */}
          <IconComponent className="w-6 h-6 text-primary" /> {/* Reduced icon size */}
        </div>
        <CardTitle className="text-lg font-semibold text-foreground">{item.title}</CardTitle> {/* Reduced font size */}
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0"> {/* Reduced padding */}
        <p className="text-muted-foreground text-xs">{item.description}</p> {/* Reduced font size */}
      </CardContent>
    </Card>
  );
}

export function WhyChooseUs() {
  return (
    <section className="py-4 md:py-6"> {/* Reduced padding */}
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-6 md:mb-8 text-center"> {/* Reduced font size and margin */}
        Why Choose Zahra Sweet Rolls?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5"> {/* Reduced gap */}
        {highlightItems.map((item) => (
          <HighlightCard key={item.title} item={item} />
        ))}
      </div>
    </section>
  );
}
