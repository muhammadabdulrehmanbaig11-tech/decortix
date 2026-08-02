import type { Metadata } from 'next';
import ServicesClient from './ServicesClient';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Explore Decortix\'s premium website building and app development services. Custom solutions for startups to enterprises.',
};

export default function ServicesPage() {
  return <ServicesClient />;
}
