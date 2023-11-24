import { cn } from "@/lib/utils";
import * as React from "react";
import { Icons } from "../icons";
import { useState } from "react";

const TransferLink = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement> & {
        copyText: string;
        displayText: string;
        tooltipText: string;
    }
>(({ className, tooltipText, copyText, displayText, ...props }, ref) => {
    const [isTooltipVisible, setIsTooltipVisible] = useState<boolean>(false);
    const [tooltipContent, setTooltipContent] = useState<string>(tooltipText);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(copyText);
        setIsTooltipVisible(true);
        setTooltipContent("copied");
        setTimeout(() => {
            setTooltipContent(tooltipText);
        }, 2000);
    };

    return (
        <span
            onClick={copyToClipboard}
            onMouseEnter={() => setIsTooltipVisible(true)}
            onMouseLeave={() => setIsTooltipVisible(false)}
            className={cn(
                "relative cursor-pointer flex items-center gap-2",
                className
            )}
        >
            {displayText}
            <Icons.copy fill="#6F6F6F" />
            {isTooltipVisible && (
                <span className="absolute bottom-full mb-2 w-auto p-2 bg-black text-white text-sm rounded-md shadow-lg z-10 -translate-x-1/2 left-1/2">
                    {tooltipContent}
                </span>
            )}
        </span>
    );
});
TransferLink.displayName = "TransferLink";

export { TransferLink };
