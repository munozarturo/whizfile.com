import * as React from "react";

import { cn } from "@/lib/utils";

const Tooltip = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement> & {
        tooltipText: string;
    }
>(({ className, tooltipText, children, ...props }, ref) => {
    const [isTooltipVisible, setIsTooltipVisible] =
        React.useState<boolean>(false);

    const showTooltip = () => setIsTooltipVisible(true);
    const hideTooltip = () => setIsTooltipVisible(false);

    return (
        <span
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
            tabIndex={0}
            className={cn(
                "relative cursor-pointer flex items-center gap-2",
                className
            )}
            {...props}
            ref={ref}
        >
            {children}
            {isTooltipVisible && (
                <span className="absolute bottom-full mb-2 w-auto p-2 bg-black text-white text-sm rounded-md shadow-lg z-10 -translate-x-1/2 left-1/2">
                    {tooltipText}
                </span>
            )}
        </span>
    );
});
Tooltip.displayName = "Tooltip";

export { Tooltip };
