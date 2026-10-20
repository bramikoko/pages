import type { Metadata, Viewport } from "next";
import { Comfortaa, Space_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const description =
  "Portfolio of bram, a web developer in Banjarmasin, Indonesia. Building with Next.js, Nuxt, and Laravel.";

export const metadata: Metadata = {
  title: "bram / web developer",
  description,
  applicationName: "bram portfolio",
  authors: [{ name: "bram" }],
  keywords: [
    "bram",
    "web developer",
    "Banjarmasin",
    "Next.js",
    "Nuxt",
    "Laravel",
    "Linux",
  ],
  openGraph: {
    title: "bram / web developer",
    description,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "bram / web developer",
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#f2f0e9",
};

const themeScript = `(function(){try{var t=localStorage.getItem("bram-theme");if(t==="dark"){document.documentElement.dataset.theme="dark";}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${comfortaa.variable} ${spaceMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink antialiased">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        {children}
      </body>
    </html>
  );
}
