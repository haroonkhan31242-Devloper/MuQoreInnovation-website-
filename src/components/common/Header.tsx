import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ChevronDown, Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { servicesData } from '../../data/servicesData';
import { ServiceIcon } from '../ui/ServiceIcon';
import { EASE_OUT } from '../ui/Reveal';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/services', label: 'Services', dropdown: true },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock page scroll and support Escape while the mobile menu is open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  // Close the desktop dropdown on outside click or Escape
  useEffect(() => {
    if (!servicesOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setServicesOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setServicesOpen(false);
        dropdownRef.current?.querySelector<HTMLButtonElement>('button[aria-haspopup]')?.focus();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [servicesOpen]);

  const openWithHover = () => {
    window.clearTimeout(closeTimer.current);
    setServicesOpen(true);
  };
  const closeWithHover = () => {
    closeTimer.current = window.setTimeout(() => setServicesOpen(false), 140);
  };

  const isActive = (to: string, end?: boolean) =>
    end ? location.pathname === to : location.pathname === to || location.pathname.startsWith(`${to}/`);

  const navItemClass = (active: boolean) =>
    `relative inline-flex h-10 items-center gap-1 rounded-lg px-3.5 text-[0.9375rem] font-medium transition-colors ${
      active ? 'text-fg' : 'text-fg-muted hover:text-fg'
    }`;

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled || mobileOpen
          ? 'border-b border-line bg-bg/85 shadow-[0_8px_30px_-20px_rgba(0,0,0,0.4)] backdrop-blur-xl'
          : 'border-b border-transparent bg-bg/40 backdrop-blur-md'
      }`}
    >
      <div className="container-x">
        <div className="flex h-[4.5rem] items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 rounded-xl" aria-label="MuQore Innovation, home">
            {/* Supplied company logo, cropped to the mark itself (1085×1018) */}
            <img
              src="/assets/brand/logo-mark.jpg"
              alt=""
              width={1085}
              height={1018}
              decoding="async"
              fetchPriority="high"
              className="block h-[42px] w-auto shrink-0 rounded-lg object-contain ring-1 ring-line"
            />
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl font-bold tracking-tight text-fg">
                MuQore<span className="text-accent-ink">.</span>
              </span>
              <span className="mt-1 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-fg-subtle">
                Innovation
              </span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-0.5">
              {NAV.map((item) => {
                const active = isActive(item.to, item.end);
                if (item.dropdown) {
                  return (
                    <li key={item.to}>
                      <div
                        ref={dropdownRef}
                        className="relative"
                        onPointerEnter={(e) => e.pointerType === 'mouse' && openWithHover()}
                        onPointerLeave={(e) => e.pointerType === 'mouse' && closeWithHover()}
                      >
                        <button
                          type="button"
                          className={navItemClass(active)}
                          aria-haspopup="true"
                          aria-expanded={servicesOpen}
                          aria-controls="services-menu"
                          onClick={() => setServicesOpen((v) => !v)}
                        >
                          {item.label}
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-300 ${servicesOpen ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                          />
                          {active && <ActivePill />}
                        </button>

                        <AnimatePresence>
                          {servicesOpen && (
                            <motion.div
                              id="services-menu"
                              initial={{ opacity: 0, y: 8, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 4, scale: 0.98, transition: { duration: 0.15 } }}
                              transition={{ duration: 0.28, ease: EASE_OUT }}
                              className="absolute left-1/2 top-full z-50 mt-3 w-[min(42rem,90vw)] -translate-x-1/2 origin-top"
                            >
                              <div className="overflow-hidden rounded-2xl border border-line bg-bg-elevated p-2 shadow-2xl">
                                <ul className="grid grid-cols-2 gap-1">
                                  {servicesData.map((svc) => (
                                    <li key={svc.id}>
                                      <Link
                                        to={`/services/${svc.slug}`}
                                        className="group flex gap-3 rounded-xl p-3 transition-colors hover:bg-surface-2"
                                      >
                                        <span className="icon-tile h-9 w-9 shrink-0 rounded-lg">
                                          <ServiceIcon name={svc.iconName} className="h-[18px] w-[18px]" />
                                        </span>
                                        <span className="min-w-0">
                                          <span className="block text-sm font-semibold text-fg group-hover:text-accent-ink">
                                            {svc.title}
                                          </span>
                                          <span className="mt-0.5 line-clamp-1 block text-[0.8125rem] text-fg-subtle">
                                            {svc.shortDescription}
                                          </span>
                                        </span>
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                                <div className="mt-1 flex items-center justify-between rounded-xl bg-surface-2 px-4 py-3">
                                  <span className="text-sm text-fg-muted">Not sure which service fits?</span>
                                  <Link to="/services" className="link-accent text-sm">
                                    Compare all services <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                  </Link>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </li>
                  );
                }
                return (
                  <li key={item.to}>
                    <NavLink to={item.to} end={item.end} className={navItemClass(active)}>
                      {item.label}
                      {active && <ActivePill />}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="icon-btn h-10 w-10"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ opacity: 0, rotate: -45 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 45 }}
                  transition={{ duration: 0.2 }}
                  className="flex"
                >
                  {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" aria-hidden="true" /> : <Moon className="h-[18px] w-[18px]" aria-hidden="true" />}
                </motion.span>
              </AnimatePresence>
            </button>
            <Link to="/get-a-quote" className="btn btn-primary btn-sm hidden sm:inline-flex">
              Get a Quote
              <ArrowRight className="icon-nudge h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="icon-btn h-10 w-10 lg:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu: portalled because the header's backdrop-filter would
          otherwise become the containing block for this fixed panel */}
      {createPortal(
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-x-0 bottom-0 top-[4.5rem] z-40 overflow-y-auto overscroll-contain border-t border-line bg-bg lg:hidden"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
          >
            <nav aria-label="Mobile" className="container-x flex min-h-full flex-col py-6">
              <ul className="space-y-1">
                {NAV.map((item) => {
                  const active = isActive(item.to, item.end);
                  if (item.dropdown) {
                    return (
                      <li key={item.to}>
                        <div className="flex items-center">
                          <Link
                            to={item.to}
                            className={`flex-1 rounded-xl px-4 py-3.5 text-lg font-semibold ${active ? 'text-accent-ink' : 'text-fg'}`}
                          >
                            {item.label}
                          </Link>
                          <button
                            type="button"
                            className="icon-btn h-11 w-11 border-transparent bg-transparent"
                            aria-expanded={mobileServicesOpen}
                            aria-controls="mobile-services"
                            aria-label={`${mobileServicesOpen ? 'Hide' : 'Show'} individual services`}
                            onClick={() => setMobileServicesOpen((v) => !v)}
                          >
                            <ChevronDown
                              className={`h-5 w-5 transition-transform duration-300 ${mobileServicesOpen ? 'rotate-180' : ''}`}
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                        <div
                          id="mobile-services"
                          className="grid transition-[grid-template-rows] duration-300"
                          style={{ gridTemplateRows: mobileServicesOpen ? '1fr' : '0fr' }}
                        >
                          <ul className="overflow-hidden" inert={!mobileServicesOpen}>
                            {servicesData.map((s) => (
                              <li key={s.id}>
                                <Link
                                  to={`/services/${s.slug}`}
                                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-[0.9375rem] text-fg-muted hover:bg-surface-2 hover:text-fg"
                                >
                                  <ServiceIcon name={s.iconName} className="h-4 w-4 text-accent-ink" />
                                  {s.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </li>
                    );
                  }
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        aria-current={active ? 'page' : undefined}
                        className={`block rounded-xl px-4 py-3.5 text-lg font-semibold ${active ? 'text-accent-ink' : 'text-fg'}`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-auto space-y-3 pt-8">
                <Link to="/get-a-quote" className="btn btn-primary w-full">
                  Get a Quote
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>,
        document.body
      )}
    </header>
  );
};

/** Underline that glides between nav items via a shared layoutId. */
const ActivePill: React.FC = () => (
  <motion.span
    layoutId="nav-active"
    className="absolute inset-x-3 -bottom-[1px] h-[2px] rounded-full bg-accent"
    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
    aria-hidden="true"
  />
);
