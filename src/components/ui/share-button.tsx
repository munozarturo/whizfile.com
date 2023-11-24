import * as React from "react";
import { HTMLAttributes } from "react";

const ShareButton = React.forwardRef<
    HTMLButtonElement,
    HTMLAttributes<HTMLButtonElement> & {
        title: string;
        text: string;
        url: string;
    }
>(({ className, title, text, url, ...props }, ref) => {
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: text,
                    url: url,
                });
                console.log("Content shared successfully");
            } catch (error) {
                console.error("Error sharing content:", error);
            }
        } else {
            console.log("Web Share API is not supported in your browser.");
        }
    };

    return <button {...props}>Share</button>;
});
ShareButton.displayName = "ShareButton";

export { ShareButton };
