"use client";

import { Icons } from "@/components/icons";
import Image from "next/image";
import Link from "next/link";
import { NavLink } from "./ui/nav-link";
import React from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const MobileNavbarTop = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const pathname = usePathname();

    return (
        <div className={cn("w-full h-16", className)}>
            <nav className="w-full h-full flex flex-row bg-primary justify-start items-center shadow-2xl rounded-b-2xl px-6">
                <Link href="./">
                    <span>
                        <Image
                            src="/brand/logo_raw.svg"
                            width={(154.67 * 3) / 4}
                            height={(48 * 3) / 4}
                            alt={"Logo"}
                            priority
                        ></Image>
                    </span>
                </Link>
            </nav>
        </div>
    );
});
MobileNavbarTop.displayName = "NavbarMobileTop";

const MobileNavbarBottom = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const pathname = usePathname();

    return (
        <div className={cn("w-full h-16", className)}>
            <nav className="w-full h-full flex flex-row bg-primary justify-center items-center shadow-2xl rounded-t-2xl">
                <div className="flex flex-row w-3/4 justify-around">
                    <NavLink
                        active={pathname.startsWith("/send")}
                        href={"/send"}
                        text={"send"}
                        icon={<Icons.upload />}
                    ></NavLink>
                    <NavLink
                        active={pathname.startsWith("/receive")}
                        href={"/receive"}
                        text={"receive"}
                        icon={<Icons.upload />}
                    ></NavLink>
                </div>
            </nav>
        </div>
    );
});
MobileNavbarBottom.displayName = "NavbarMobileBottom";

export { MobileNavbarTop, MobileNavbarBottom };
