import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Send a transfer",
  description: "Send a transfer.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`w-screen h-screen flex flex-col ${inter.className} bg-tile-10 bg-repeat bg-origin-content bg-size-tile`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
