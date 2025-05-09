import { TrackOrderStatus } from '@/components/track-order-status';
import { sampleOrder, orderStatusSteps } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Track Your Order - Zahra Sweet Rolls',
  description: 'Check the status of your order from Zahra Sweet Rolls.',
};

export default function TrackOrderPage() {
  return (
    <div className="container max-w-screen-2xl px-4 md:px-6 py-8 md:py-12">
      <div className="flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-8 text-center">
          Your Order Status
        </h1>
        <TrackOrderStatus order={sampleOrder} allSteps={orderStatusSteps} />
        <Button asChild variant="link" className="mt-8 text-primary">
          <Link href="/">Back to Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
