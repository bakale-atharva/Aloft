import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aloft",
  description: "Search, book, and manage flights.",
};

// Runs before first paint so the theme class is in place and there is no flash
// of the wrong palette. Defaults to the OS preference until the user chooses.
const themeInit = `try{var t=localStorage.getItem('aloft-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-full bg-canvas">
        <ClerkProvider
          appearance={{
            // Clerk derives shades from these in JS, so they must be static
            // strings — they cannot reference CSS custom properties.
            variables: {
              colorPrimary: "#7c3aed",
              colorForeground: "#171340",
              colorBackground: "#ffffff",
              borderRadius: "0.75rem",
              fontFamily: "var(--font-geist-sans)",
            },
            elements: {
              formButtonPrimary:
                "bg-gradient-brand text-white shadow-cta hover:brightness-110",
              card: "shadow-float rounded-card border border-border",
              userButtonAvatarBox: "size-9 ring-2 ring-accent-200",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
