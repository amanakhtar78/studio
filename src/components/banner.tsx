
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { BannerImage } from '@/types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BannerProps {
  images: BannerImage[];
  autoScrollInterval?: number;
}

export function Banner({ images, autoScrollInterval = 5000 }: BannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images.length]);

  useEffect(() => {
    if (!isMounted || images.length === 0) return;

    const timer = setInterval(() => {
      goToNext();
    }, autoScrollInterval);

    return () => clearInterval(timer);
  }, [autoScrollInterval, goToNext, isMounted, images.length]);

  if (!isMounted || images.length === 0) {
    return (
      <div className="relative w-full h-48 md:h-72 bg-muted/50 animate-pulse flex items-center justify-center rounded-md"> {/* Reduced height */}
        <p className="text-muted-foreground text-sm">Loading banner...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden shadow-md rounded-md"> {/* Reduced shadow and radius to md */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image) => (
          <div key={image.id} className="relative w-full flex-shrink-0 h-48 md:h-64 lg:h-72"> {/* Reduced height */}
            <Image
              src={image.src}
              alt={image.alt}
              layout="fill"
              objectFit="cover"
              priority={image.id === images[0].id}
              data-ai-hint={image.dataAiHint}
              className="rounded-md"
            />
             <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-3">
              <h2 className="text-xl md:text-2xl font-bold text-white text-center shadow-sm">{image.alt}</h2> {/* Reduced font size and shadow */}
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute top-1/2 left-1.5 md:left-3 transform -translate-y-1/2 rounded-full bg-background/60 hover:bg-background h-8 w-8" // Smaller button, adjusted position
        onClick={goToPrevious}
        aria-label="Previous image"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute top-1/2 right-1.5 md:right-3 transform -translate-y-1/2 rounded-full bg-background/60 hover:bg-background h-8 w-8" // Smaller button, adjusted position
        onClick={goToNext}
        aria-label="Next image"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="absolute bottom-2.5 left-1/2 transform -translate-x-1/2 flex space-x-1.5"> {/* Adjusted position and spacing */}
        {images.map((_, index) => (
          <button
            key={index}
            className={cn(
              'w-1.5 h-1.5 rounded-full transition-all duration-300', // Smaller dots
              currentIndex === index ? 'bg-primary p-0.5' : 'bg-primary/50'
            )}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
