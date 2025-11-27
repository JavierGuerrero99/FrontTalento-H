import { ArrowLeft } from "lucide-react";
import { type ComponentProps } from "react";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";

export type BackButtonProps = {
  label?: string;
} & ComponentProps<typeof Button>;

export function BackButton({
  label = "Volver",
  className,
  onClick,
  variant = "ghost",
  size = "sm",
  ...rest
}: BackButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onClick}
      className={cn("gap-2 text-muted-foreground hover:text-foreground", className)}
      {...rest}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}
