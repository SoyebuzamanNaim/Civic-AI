import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/shared/presentation/i18n/i18nContext";

export const metadata: Metadata = {
  title: "CivicPulse AI | Next-Gen Infrastructure Platform",
  description: "AI-powered civic infrastructure reporting, severity assessment, and case management.",
  manifest: "/manifest.webmanifest",
  themeColor: "#0f766e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0f766e" />
      </head>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>{children}</LanguageProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
