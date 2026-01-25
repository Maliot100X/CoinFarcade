import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

type Props = {
  title: string;
  onClick: () => void;
  widthFull?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-black text-white hover:bg-gray-800",
        outline: "border border-gray-300 bg-white text-black hover:bg-gray-50",
        ghost: "hover:bg-gray-100 text-black",
        link: "underline-offset-4 hover:underline text-gray-600 hover:text-black",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  title: string;
  onClick: () => void;
  widthFull?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      title,
      onClick,
      widthFull = false,
      disabled,
      loading,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        onClick={onClick}
        disabled={disabled ?? loading}
        className={cn(
          buttonVariants({ variant, size }),
          className,
          widthFull ? "w-full" : ""
        )}
        ref={ref}
        {...props}
      >
        {loading ? "Loading..." : title}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
