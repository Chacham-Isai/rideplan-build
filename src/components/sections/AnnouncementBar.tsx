import { useState } from "react";
import { X } from "lucide-react";

export const AnnouncementBar = () => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="bg-accent text-accent-foreground relative z-50">
      <div className="mx-auto flex max-w-[1200px] items-center justify-center px-4 py-2.5 text-sm font-medium">
        <a href="#cta" className="hover:underline">
          Now serving 1,543+ districts across the Mid-Atlantic &amp; Northeast — Schedule your free route audit →
        </a>
        <button
          onClick={() => setVisible(false)}
          className="absolute right-4 rounded p-1 hover:bg-accent-foreground/10 transition"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
