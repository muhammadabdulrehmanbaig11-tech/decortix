import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Decortix to start your website or app project. We respond within 24 hours.',
};

export default function ContactPage() {
  return <ContactClient />;
}
