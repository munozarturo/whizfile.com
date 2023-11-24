"use client";

import Link from "next/link";
import Image from "next/image";
import { Icons } from "@/components/icons";
import { NavLink } from "./ui/nav-link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="w-full h-16 flex flex-row bg-primary px-24 justify-start items-center space-x-12 shadow-2xl">
            <Link href="./">
                <span>
                    <Image
                        src="/brand/logo_raw.svg"
                        width={154.67}
                        height={48}
                        alt={"Logo"}
                    ></Image>
                </span>
            </Link>

            <div className="flex flex-row space-x-6">
                {/* <Link
          href="/guide"
          className="group transition duration-300 text-center text-white text-lg font-bold italic"
        >
          guide
          <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-white"></span>
        </Link>

        <Link
          href="/about"
          className="group transition duration-300 text-center text-white text-lg font-bold italic"
        >
          about
          <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-white"></span>
        </Link> */}
            </div>
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
    );
}
