import type { Metadata } from "next";
import { Inter, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Protein Explorer",
  description: "Search proteins via UniProt and save favorites.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://rest.uniprot.org" />
        {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN && (
          <link
            rel="preconnect"
            href={`https://${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}`}
          />
        )}
        {/* Static FILL 0/1 instances only (the only two the app ever renders,
            see globals.css), and `text=` subsets to just the icon ligatures
            actually used -- the previous request pulled the full 100..700
            weight range plus every glyph in the font (1.1MB); this one is a
            few KB. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:FILL,wght,GRAD,opsz@0,400,0,24;1,400,0,24&text=arrow_downwardbiotechcheckclosedatabaseerrorhistorylockloginlogoutmenunotificationspersonrefreshsearchstardatasetforumgradesettingssmart_toy&display=swap"
          rel="stylesheet"
        />
        {children}
      </body>
    </html>
  );
}
