import { Clock } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export const PlaceholderPage = ({ title }: PlaceholderPageProps) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="rounded-2xl border bg-card p-12 shadow-sm max-w-md">
      <Clock className="mx-auto mb-4 h-10 w-10 text-primary" />
      <h1 className="font-['Playfair_Display'] text-3xl font-bold text-foreground">
        {title}
      </h1>
      <span className="mt-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
        Coming Soon
      </span>
      <p className="mt-4 text-muted-foreground">
        This feature is currently under development and will be available shortly.
      </p>
    </div>
  </div>
);
