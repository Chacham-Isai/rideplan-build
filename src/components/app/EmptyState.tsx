import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) => (
  <div className="py-16 text-center">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
      <Icon className="h-7 w-7 text-muted-foreground" />
    </div>
    <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">{description}</p>
    {actionLabel && onAction && (
      <Button size="sm" onClick={onAction}>{actionLabel}</Button>
    )}
  </div>
);
