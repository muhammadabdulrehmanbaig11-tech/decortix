import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Decortix — Premium Websites & Apps",
    template: "%s — Decortix",
  },
  description:
    "Decortix builds exceptional websites and applications that drive growth. Premium design, cutting-edge technology, and end-to-end delivery.",
  keywords: ["website development", "app development", "web design", "software company"],
  authors: [{ name: "Decortix" }],
  openGraph: {
    title: "Decortix — Premium Websites & Apps",
    description: "We build exceptional websites and applications.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Bebas Neue for hero headlines, Inter for body copy */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
