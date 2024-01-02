import * as React from "react";

import { HTMLAttributes } from "react";
import Link from "next/link";

const NavLink = React.forwardRef<
    HTMLLinkElement,
    HTMLAttributes<HTMLLinkElement> & {
        active: boolean;
        href: string;
        text: string;
        icon: React.ReactNode;
    }
>(({ className, active, href, text, icon, ...props }, ref) => {
    return (
        <Link
            href={href}
            className="group transition duration-300 text-center text-white text-lg font-bold italic"
        >
            <div className="flex justify-start items-center gap-1">
                {icon}
                <span className="relative">
                    {text}
                    <span
                        className={`block transition-all duration-500 h-0.5 bg-secondary ${
                            active
                                ? "max-w-full"
                                : "max-w-0 group-hover:max-w-full"
                        }`}
                    ></span>
                </span>
            </div>
        </Link>
    );
});
NavLink.displayName = "NavLink";

export { NavLink };
