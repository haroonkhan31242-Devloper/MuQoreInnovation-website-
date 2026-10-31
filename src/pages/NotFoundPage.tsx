import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Home } from 'lucide-react';
import { usePageMeta } from '../components/ui/usePageMeta';

export const NotFoundPage: React.FC = () => {
  usePageMeta('Page not found');

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid" aria-hidden="true" />
      <div className="container-x relative flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <p className="font-display text-7xl font-bold text-gradient sm:text-8xl">404</p>
        <h1 className="h-section mt-6">This page doesn't exist</h1>
        <p className="lead mt-4 max-w-md">The link may be outdated or mistyped. Here are some good places to continue.</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link to="/" className="btn btn-primary btn-lg">
            <Home className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
          <Link to="/services" className="btn btn-secondary btn-lg">
            Browse services
            <ArrowRight className="icon-nudge h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
};
