import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  variant: {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-error-500 text-white hover:bg-error-600",
    outline: "border border-input bg-background hover:bg-muted",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-muted hover:text-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  },
  size: {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-12 rounded-lg px-6",
    icon: "h-10 w-10",
  },
};

export type ButtonVariant = keyof typeof buttonVariants.variant;
export type ButtonSize = keyof typeof buttonVariants.size;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variantClass = buttonVariants.variant[variant];
    const sizeClass = buttonVariants.size[size];

    if (asChild) {
      const { children } = props;
      const child = React.cloneElement(children as React.ReactElement<any>, {
        className: cn(variantClass, sizeClass, baseClasses, className, (children as any).props?.className),
      });
      return child;
    }

    return (
      <button
        className={cn(baseClasses, variantClass, sizeClass, className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
