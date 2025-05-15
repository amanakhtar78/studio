
import Link from 'next/link';
import { SweetRollsLogo } from '@/components/icons/sweet-rolls-logo';

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 py-6 text-xs text-muted-foreground"> {/* Reduced padding and font size */}
      <div className="container max-w-screen-2xl px-2 md:px-4"> {/* Reduced padding */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> {/* Reduced gap */}
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-1.5">
              <SweetRollsLogo />
              <span className="font-bold text-base text-foreground">Zahra Sweet Rolls</span> {/* Reduced font size */}
            </Link>
            <p>&copy; {new Date().getFullYear()} Zahra Sweet Rolls. All rights reserved.</p>
            <p>Deliciously baked, just for you.</p>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-1.5">Quick Links</h3> {/* Reduced font size and margin */}
            <ul className="space-y-0.5"> {/* Reduced spacing */}
              <li><Link href="/#sweet-rolls" className="hover:text-primary">Sweet Rolls</Link></li>
              <li><Link href="/#cakes" className="hover:text-primary">Cakes</Link></li>
              <li><Link href="/#cookies" className="hover:text-primary">Cookies</Link></li>
              <li><Link href="/#beverages" className="hover:text-primary">Beverages</Link></li>
              <li><Link href="/track-order" className="hover:text-primary">Track My Order</Link></li>
              <li><Link href="/admin/login" className="hover:text-primary">Admin Login</Link></li> {/* Added Admin Login link */}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-1.5">Contact Us</h3> {/* Reduced font size and margin */}
            <p>123 Bakery Street, Nairobi, Kenya</p>
            <p>Email: info@zahrasweetrolls.com</p>
            <p>Phone: +254 700 000 000</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
