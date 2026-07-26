import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: false,
});

const ka1 = localFont({
  src: "../fonts/ka1.ttf",
  variable: "--font-ka1",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes('localhost')
    ? new URL(process.env.NEXTAUTH_URL)
    : process.env.VERCEL_URL
      ? new URL(`https://${process.env.VERCEL_URL}`)
      : new URL('https://nexus-ssmt.vercel.app'),
  title: {
    default: "Nexus - Social Study Mapping Tool (SSMT)",
    template: "%s | Nexus SSMT",
  },
  description: "Nexus is an interactive Social Study Mapping platform built with Next.js 16 and D3-force to visualize complex relationships, notes, and knowledge graphs.",
  keywords: [
    "Nexus",
    "Nexus SSMT",
    "Social Study Mapping Tool",
    "Social Study Mapping",
    "knowledge graph",
    "note-taking",
    "second brain",
    "study mapping software",
    "concept map generator",
    "visual note taking",
    "interactive graph visualization"
  ],
  authors: [{ name: "Ali Tamer", url: "https://github.com/Ali-Tamerr" }],
  creator: "Ali Tamer",
  publisher: "Nexus",
  manifest: "/manifest.json",
  themeColor: "#09090b",
  alternates: {
    canonical: "./",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nexus SSMT",
  },
  openGraph: {
    title: "Nexus - Social Study Mapping Tool (SSMT)",
    description: "Build, link, and explore interconnected knowledge graphs. Visual, interactive, and designed for deep study exploration.",
    url: "./",
    siteName: "Nexus Social Study Mapping Tool",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexus - Social Study Mapping Tool",
    description: "Build, link, and explore interconnected knowledge graphs.",
  },
  icons: {
    apple: "/icons/icon-192x192.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://nexus-ssmt.vercel.app/#webapp",
      "name": "Nexus - Social Study Mapping Tool",
      "alternateName": ["Nexus SSMT", "Nexus Study Mapping"],
      "url": "https://nexus-ssmt.vercel.app",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "All",
      "description": "Nexus is an interactive Social Study Mapping platform that connects notes, ideas, and study data into dynamic, visual knowledge graphs.",
      "author": {
        "@type": "Person",
        "name": "Ali Tamer",
        "url": "https://github.com/Ali-Tamerr"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://nexus-ssmt.vercel.app/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Nexus Social Study Mapping Tool?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nexus is a visual Social Study Mapping platform built with Next.js 16 and D3-force that turns fragmented notes and ideas into interactive, linked knowledge graphs."
          }
        },
        {
          "@type": "Question",
          "name": "Is Nexus free to use?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Nexus features a 100% free Local Workspace mode with offline storage and zero login requirements, as well as cloud-synced collaboration."
          }
        },
        {
          "@type": "Question",
          "name": "How does Social Study Mapping work in Nexus?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "In Nexus, users create visual nodes representing study concepts and draw connections, groups, and shapes to map out complex relationships intuitively."
          }
        }
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body className={`${inter.variable} ${ka1.variable} antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      registration.update();
                      console.log('Service Worker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('Service Worker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
