import { cn } from "@/lib/utils";
import { Button } from "./button";
import { ButtonProps } from "@/app/components/ui/button";

type ActionVariant = "edit" | "delete" | "download" | "play" | "cart" | "wishlist";

interface ActionButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: ActionVariant;
}

export function ActionButton({ 
  variant = "edit", 
  className, 
  ...props 
}: ActionButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn(
        "transition-colors duration-200",
        "bg-[hsl(var(--background))] text-white border",
        {
          "border-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]":
            variant === "edit" || variant === "download" || variant === "play" || variant === "cart" || variant === "wishlist",
          "border-destructive hover:bg-destructive hover:text-destructive-foreground":
            variant === "delete",
        },
        className
      )}
      {...props}
    />
  );
} 