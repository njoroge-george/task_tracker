import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import MuiProvider from "@/providers/MuiProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif"
  ],
});

export const metadata: Metadata = {
  title: {
    default: "TaskFlow™ - AI-Powered Task Management",
    template: "%s | TaskFlow™"
  },
  description: "Smart task management with AI-powered suggestions. Create, organize, and complete your tasks efficiently with intelligent automation.",
  keywords: ["task tracker", "todo app", "task management", "productivity", "AI assistant", "next.js", "project management"],
  authors: [{ name: "Nick" }],
  creator: "Nick",
  icons: {
    icon: '/favicon.svg',
    apple: '/logo-512.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://taskflow.geenjoroge.org", // Replace with your actual domain
    siteName: "TaskFlow™",
    title: "Task Tracker - Manage Your Tasks Efficiently",
    description: "A modern task management application for boosting your productivity",
    images: [
      {
        url: "/og-image.png", // You'll need to create this image
        width: 1200,
        height: 630,
        alt: "Task Tracker Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Task Tracker - Manage Your Tasks Efficiently",
    description: "A modern task management application for boosting your productivity",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Task Tracker",
    "description": "A modern task management application",
    "url": "https://yourdomain.com",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "All",
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="emotion-insertion-point" content="" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MuiProvider>
            {children}
            <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--background)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
            />
          </MuiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}