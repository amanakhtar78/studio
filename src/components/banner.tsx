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
      <div className="relative w-full h-64 md:h-96 bg-muted/50 animate-pulse flex items-center justify-center">
        <p className="text-muted-foreground">Loading banner...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden shadow-lg rounded-lg">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image) => (
          <div key={image.id} className="relative w-full flex-shrink-0 h-64 md:h-80 lg:h-96">
            <Image
              src={image.src}
              alt={image.alt}
              layout="fill"
              objectFit="cover"
              priority={image.id === images[0].id}
              data-ai-hint={image.dataAiHint}
              className="rounded-lg"
            />
             <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-4">
              <h2 className="text-2xl md:text-4xl font-bold text-white text-center shadow-md">{image.alt}</h2>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute top-1/2 left-2 md:left-4 transform -translate-y-1/2 rounded-full bg-background/70 hover:bg-background text-foreground"
        onClick={goToPrevious}
        aria-label="Previous image"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute top-1/2 right-2 md:right-4 transform -translate-y-1/2 rounded-full bg-background/70 hover:bg-background text-foreground"
        onClick={goToNext}
        aria-label="Next image"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              currentIndex === index ? 'bg-primary p-1' : 'bg-primary/50'
            )}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
