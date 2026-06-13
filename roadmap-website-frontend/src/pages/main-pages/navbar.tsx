import React, { useState, useEffect } from 'react';
import ProfileDropdown from '@/components/ProfileDropdown';
import { useAuth } from '@/contexts/authContext';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BookOpen, TrendingUp, Map, Sun, Moon } from 'lucide-react';
import appLogo from '@/assets/app_logo.svg';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

interface NavItem {
  id: number;
  name: string;
  icon: React.ReactNode;
  path: string;
}

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const navItems: NavItem[] = [
    { id: 1, name: 'Roadmaps',  icon: <Map className="w-4 h-4" />,      path: '/roadmaps' },
    { id: 2, name: 'Resources', icon: <BookOpen className="w-4 h-4" />,  path: '/resources' },
    { id: 3, name: 'Progress',  icon: <TrendingUp className="w-4 h-4" />, path: '/progress' },
  ];

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <nav
      className={`sticky top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-background/90 backdrop-blur-xl border-b border-border shadow-sm'
          : 'bg-background/60 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 via-rose-500 to-violet-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow duration-300">
              <img src={appLogo} alt="Tutoreez Logo" className="w-full h-full object-contain p-1" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground" style={{ fontFamily: 'Syne, sans-serif' }}>
              Tutor<span className="text-gradient-brand">eez</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-orange-400 bg-gradient-to-r from-orange-500/15 via-rose-500/10 to-transparent border border-orange-500/20'
                      : 'text-foreground/60 hover:text-foreground hover:bg-foreground/[0.06]'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-foreground/[0.06] transition-all duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'dark'
                  ? <Sun className="w-4 h-4" />
                  : <Moon className="w-4 h-4" />
                }
              </button>
            )}

            {isAuthenticated ? (
              <ProfileDropdown />
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors duration-200">
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-orange-500 via-rose-500 to-violet-600 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 hover:opacity-90 transition-all duration-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-1">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-t border-border bg-background/95 backdrop-blur-xl"
          >
            <div className="max-w-7xl mx-auto px-5 py-4 flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'text-orange-400 bg-gradient-to-r from-orange-500/15 via-rose-500/10 to-transparent border border-orange-500/20'
                        : 'text-foreground/65 hover:text-foreground hover:bg-foreground/[0.06]'
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                );
              })}
              <div className="pt-3 mt-2 border-t border-border flex flex-col gap-2">
                {isAuthenticated ? (
                  <ProfileDropdown />
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-foreground/60 text-center rounded-xl hover:bg-foreground/[0.06]">
                      Sign in
                    </Link>
                    <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-sm font-semibold text-center rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-violet-600 text-white">
                      Get Started Free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
