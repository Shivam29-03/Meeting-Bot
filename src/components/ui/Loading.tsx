import { cn } from "@/lib/utils";

type LoadingProps = {
  label?: string;
  fullScreen?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeStyles = {
  sm: "h-5 w-5",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function Loading({
  label = "Loading...",
  fullScreen = false,
  className,
  size = "md",
}: LoadingProps) {
  const content = (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <span
        role="status"
        aria-label={label}
        className={cn(
          "animate-spin rounded-full border-2 border-muted border-t-foreground",
          sizeStyles[size],
        )}
      />
      {label ? <p className="text-sm text-muted-foreground">{label}</p> : null}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center py-24">
        {content}
      </div>
    );
  }

  return content;
}
