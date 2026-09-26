import * as React from "react";
import { cn } from "@/lib/utils";

export type CardVariant = "elevated" | "outlined" | "ghost";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "elevated", ...props }, ref) => {
    const variantClasses: Record<CardVariant, string> = {
      elevated: "rounded-xl border bg-card text-card-foreground shadow-sm",
      outlined: "rounded-xl border bg-card text-card-foreground",
      ghost: "rounded-xl bg-card text-card-foreground",
    };

    return (
      <div
        className={cn(variantClasses[variant], className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      className={cn("flex flex-col space-y-2 p-6", className)}
      ref={ref}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      ref={ref}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn("p-6 pt-0", className)} ref={ref} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn("flex items-center p-6 pt-0", className)} ref={ref} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
