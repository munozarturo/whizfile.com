import * as React from "react";

import { VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva("sm:rounded-2xl sm:shadow-2xl bg-secondary", {
    variants: {
        width: {
            default: "w-full sm:w-5/6 md:w-5/6 lg:w-4/5 xl:w-3/5",
            fit: "w-fit",
        },
        height: {
            default: "h-full sm:h-5/6 md:h-5/6 lg:h-4/5 xl:h-3/4",
            fit: "h-fit",
        },
    },
    defaultVariants: {
        width: "default",
        height: "default",
    },
});

interface CardProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, width, height, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(cardVariants({ width, height }), className)}
            {...props}
        />
    )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement> & { as?: "h1" | "h2" | "h3" }
>(({ className, as: Comp = "h3", ...props }, ref) => (
    <Comp
        ref={ref}
        className={cn(
            "text-3xl italic font-extrabold leading-none tracking-tight",
            className
        )}
        {...props}
    />
));
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
    />
));
CardFooter.displayName = "CardFooter";

export { Card, cardVariants, CardHeader, CardTitle, CardContent, CardFooter };
