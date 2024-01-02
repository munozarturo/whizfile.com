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
                className={`w-screen h-screen flex flex-col ${inter.className} bg-secondary sm:bg-tile-3 bg-repeat bg-origin-content bg-size-tile`}
            >
                <Providers>
                    <Navbar className="hidden sm:flex" />

                    <MobileNavbarTop className="fixed top-0 left-0 right-0 z-10 flex sm:hidden" />

                    <div className="flex-grow overflow-auto pt-[4rem] pb-[4rem] sm:pt-0 sm:pb-0">
                        {children}
                    </div>

                    <MobileNavbarBottom className="fixed bottom-0 left-0 right-0 z-10 flex sm:hidden" />
                </Providers>
            </body>
        </html>
    );
}
