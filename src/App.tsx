import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { MotionConfig, motion } from 'motion/react';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ChatLauncher } from './components/chat/ChatLauncher';
import { MuQoreChatModal } from './components/chat/MuQoreChatModal';
import { HomePage } from './pages/HomePage';

// Secondary routes are split out so the home page loads first
const ServicesOverviewPage = lazy(() => import('./pages/ServicesOverviewPage').then((m) => ({ default: m.ServicesOverviewPage })));
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage').then((m) => ({ default: m.ServiceDetailPage })));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage').then((m) => ({ default: m.PortfolioPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const GetAQuotePage = lazy(() => import('./pages/GetAQuotePage').then((m) => ({ default: m.GetAQuotePage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

/** Scrolls to top on navigation and moves focus to <main> for screen readers. */
function RouteEffects({ mainRef }: { mainRef: React.RefObject<HTMLElement | null> }) {
  const { pathname } = useLocation();
  const first = useRef(true);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (first.current) {
      first.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname, mainRef]);

  return null;
}

function PageFallback() {
  return (
    <div className="container-x flex min-h-[60vh] items-center justify-center" role="status" aria-label="Loading page">
      <div className="h-1 w-40 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full w-1/2 animate-[shimmer_1.2s_linear_infinite] rounded-full bg-[linear-gradient(90deg,transparent,var(--accent),transparent)] bg-[length:200%_100%]" />
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    // Keyed fade only on enter: no exit delay before the next page appears
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Suspense fallback={<PageFallback />}>
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesOverviewPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/get-a-quote" element={<GetAQuotePage />} />
          {/* Legacy AI Lab gracefully redirected to Home */}
          <Route path="/ai-lab" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </motion.div>
  );
}

export default function App() {
  const mainRef = useRef<HTMLElement>(null);

  return (
    <ThemeProvider>
      <ChatProvider>
        <MotionConfig reducedMotion="user">
          <BrowserRouter>
            <RouteEffects mainRef={mainRef} />
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-fg focus:shadow-lg"
            >
              Skip to content
            </a>
            <div className="flex min-h-dvh flex-col bg-bg text-fg">
              <Header />
              <main id="main" ref={mainRef} tabIndex={-1} className="flex-1 outline-none">
                <AnimatedRoutes />
              </main>
              <Footer />
              <ChatLauncher />
              <MuQoreChatModal />
            </div>
          </BrowserRouter>
        </MotionConfig>
      </ChatProvider>
    </ThemeProvider>
  );
}
