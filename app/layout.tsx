import type { Metadata } from "next";
// FIXED: Changed the font from the non-existent 'Geist' to the standard 'Inter' font.
import { Inter } from "next/font/google";
import "./globals.css";
import { WhopIframeSdkProvider } from "@whop/react";

// Initialize the Inter font with the 'latin' subset.
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Coin Flip Royale",
  description: "High-stakes coin flip tournaments on Whop.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* FIXED: Apply the correct font class name to the body tag. */}
      <body className={inter.className}>
        <WhopIframeSdkProvider>{children}</WhopIframeSdkProvider>
      </body>
    </html>
  );
}
