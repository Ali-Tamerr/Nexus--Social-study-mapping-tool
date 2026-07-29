import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { siteMetadata as metadata, jsonLdData } from "./siteMetadata";

export { metadata };

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
