import Dialogs from "@/components/dialogs";
import Providers from "@/lib/providers";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Rize",
  description: "Own your digital identity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "bg-light-bg dark:bg-dark-bg antialiased",
          inter?.className,
          instrument?.variable
        )}
      >
        <Providers>
          <Suspense fallback={null}>
            <Dialogs />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  );
}
