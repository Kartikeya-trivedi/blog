import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

export function Navbar() {
  const location = useLocation();
  
  const navLinks = [
    { name: 'Journal', path: '/' },
    { name: 'Archive', path: '/archive' },
    { name: 'About', path: '/about' },
    { name: 'Portfolio', path: '/portfolio' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full max-w-full min-w-0 overflow-x-hidden border-b border-outline-variant bg-background">
      <div className="flex w-full items-center justify-center px-margin-page py-5 md:justify-between">
        {/* Logo — centered on mobile (in-flow), left on desktop */}
        <Link
          to="/"
          className="font-serif text-headline-md text-tertiary tracking-tight uppercase whitespace-nowrap"
        >
          The Editorial
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path === '/' && location.pathname.startsWith('/article'));
            return (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "text-label-caps transition-all duration-200 hover:text-tertiary",
                  isActive ? "text-tertiary border-b border-tertiary pb-1" : "text-secondary"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="mt-section-gap w-full max-w-full min-w-0 overflow-x-hidden border-t border-outline-variant bg-background">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-page py-16 max-w-container-max mx-auto gap-8">
        <div className="font-serif text-headline-sm text-tertiary">The Editorial.</div>
        <div className="flex gap-8">
          <Link to="/" className="text-secondary text-label-caps hover:text-tertiary underline decoration-1 underline-offset-4 transition-all tracking-widest">Journal</Link>
          <Link to="#" className="text-secondary text-label-caps hover:text-tertiary underline decoration-1 underline-offset-4 transition-all tracking-widest">Contact</Link>
          <Link to="#" className="text-secondary text-label-caps hover:text-tertiary underline decoration-1 underline-offset-4 transition-all tracking-widest">Terms</Link>
          <Link to="#" className="text-secondary text-label-caps hover:text-tertiary underline decoration-1 underline-offset-4 transition-all tracking-widest">Privacy</Link>
        </div>
        <div className="text-body-md text-secondary">
          © 2024 Kartikeya Trivedi. लखनऊ to the world.
        </div>
      </div>
    </footer>
  );
}
