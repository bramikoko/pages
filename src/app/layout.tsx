import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./sections.css";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "bram — fullstack web dev",
  description: "portfolio of bram (bramikoko) — fullstack web developer from banjarmasin.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={mono.variable} suppressHydrationWarning>
      <body>
        {/* set the saved theme before first paint — no flash of the wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.dataset.theme='light';var l=document.querySelector(\"link[rel~='icon']\");if(l)l.href='/icon-light.svg'}else if(t==='dark'){var l=document.querySelector(\"link[rel~='icon']\");if(l)l.href='/icon-dark.svg'}}catch(e){}",
          }}
        />
        {children}
      </body>
    </html>
  );
}
