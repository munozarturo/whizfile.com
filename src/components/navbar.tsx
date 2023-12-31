"use client";

import { Icons } from "@/components/icons";
import Image from "next/image";
import Link from "next/link";
import { NavLink } from "./ui/nav-link";
import React from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const Navbar = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const pathname = usePathname();

    return (
        <div
            ref={ref}
            className={cn(className, "w-full h-18 px-4 pt-4")}
            {...props}
        >
            <nav className="w-full h-16 flex flex-row bg-primary px-24 justify-start items-center space-x-12 shadow-2xl rounded-xl">
                <Link href="./">
                    <span>
                        <Image
                            src="/brand/logo_raw.svg"
                            width={154.67}
                            height={48}
                            alt={"Logo"}
                            priority
                        ></Image>
                    </span>
                </Link>

                <div className="flex flex-row w-full space-x-6 justify-end">
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
Navbar.displayName = "Navbar";

export default Navbar;
