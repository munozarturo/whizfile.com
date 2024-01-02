import "./globals.css";

import {
    MobileNavbarBottom,
    MobileNavbarTop,
} from "@/components/mobile-navbar";

import { Inter } from "next/font/google";
import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Providers from "@/components/providers";

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
        <html lang="en" className="w-screen h-screen overflow-hidden">
            <body
                className={`w-screen h-screen flex flex-col ${inter.className} bg-white sm:bg-tile-3 bg-repeat bg-origin-content bg-size-tile`}
            >
                <Providers>
                    <MobileNavbarTop className="flex sm:hidden"></MobileNavbarTop>
                    <Navbar className="hidden sm:flex" />
                    {children}
                    <MobileNavbarBottom className="flex sm:hidden"></MobileNavbarBottom>
                </Providers>
            </body>
        </html>
    );
}
