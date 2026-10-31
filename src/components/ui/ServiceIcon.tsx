import React from 'react';
import { Globe, Monitor, Smartphone, Cpu, Sparkles, Code, Server, RefreshCw, Zap, type LucideProps } from 'lucide-react';

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  Globe,
  Monitor,
  Smartphone,
  Cpu,
  Sparkles,
  Code,
  Server,
  RefreshCw,
};

/** Maps a service's `iconName` from servicesData to its Lucide icon. */
export const ServiceIcon: React.FC<{ name: string } & LucideProps> = ({ name, ...props }) => {
  const Icon = ICONS[name] ?? Zap;
  return <Icon aria-hidden="true" {...props} />;
};
