import { useCountUp } from "@/hooks/useCountUp";

interface AnimatedStatProps {
  value?: string;
  numericValue: number;
  prefix?: string;
  suffix?: string;
  label: string;
  divisor?: number;
}

export const AnimatedStat = ({ numericValue, prefix = "", suffix = "", label, divisor }: AnimatedStatProps) => {
  const { count, ref } = useCountUp(numericValue, 2000);
  const display = divisor ? (count / divisor).toFixed(1) : count.toLocaleString();

  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
        {prefix}{display}{suffix}
      </div>
      <div className="mt-1 text-xs text-primary-foreground/50 md:text-sm">{label}</div>
    </div>
  );
};
