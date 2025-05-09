import Link from 'next/link';
import { SweetRollsLogo } from '@/components/icons/sweet-rolls-logo';

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 py-8 text-sm text-muted-foreground">
      <div className="container max-w-screen-2xl px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-2">
              <SweetRollsLogo />
              <span className="font-bold text-lg text-foreground">Zahra Sweet Rolls</span>
            </Link>
            <p>&copy; {new Date().getFullYear()} Zahra Sweet Rolls. All rights reserved.</p>
            <p>Deliciously baked, just for you.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Quick Links</h3>
            <ul className="space-y-1">
              <li><Link href="/#sweet-rolls" className="hover:text-primary">Sweet Rolls</Link></li>
              <li><Link href="/#cakes" className="hover:text-primary">Cakes</Link></li>
              <li><Link href="/#cookies" className="hover:text-primary">Cookies</Link></li>
              <li><Link href="/#beverages" className="hover:text-primary">Beverages</Link></li>
              <li><Link href="/track-order" className="hover:text-primary">Track My Order</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Contact Us</h3>
            <p>123 Bakery Street, Nairobi, Kenya</p>
            <p>Email: info@zahrasweetrolls.com</p>
            <p>Phone: +254 700 000 000</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
