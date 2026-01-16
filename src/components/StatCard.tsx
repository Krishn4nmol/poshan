import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "harvest" | "sky" | "blue" | "purple" | "orange" | "teal";
}

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: StatCardProps) => {
  const variants = {
    default: "bg-card",
    primary: "gradient-hero text-primary-foreground",
    harvest: "gradient-harvest",
    sky: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20",
    blue: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20",
    orange: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20",
    teal: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20",
  };

  const iconVariants = {
    default: "bg-primary/10 text-primary",
    primary: "bg-primary-foreground/20 text-primary-foreground",
    harvest: "bg-foreground/10 text-foreground",
    sky: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    blue: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
    teal: "bg-teal-500/20 text-teal-600 dark:text-teal-400",
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-6 shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1",
        variants[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p
            className={cn(
              "text-sm font-medium",
              variant === "default" ? "text-muted-foreground" : variant === "primary" || variant === "harvest" ? "opacity-80" : "opacity-90"
            )}
          >
            {title}
          </p>
          <p className={cn(
            "text-3xl font-bold font-display",
            variant === "default" ? "" : variant === "primary" || variant === "harvest" ? "" : ""
          )}>{value}</p>
          {subtitle && (
            <p
              className={cn(
                "text-sm",
                variant === "default" ? "text-muted-foreground" : variant === "primary" || variant === "harvest" ? "opacity-70" : "opacity-80"
              )}
            >
              {subtitle}
            </p>
          )}
          {trend && (
            <div
              className={cn(
                "inline-flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-md",
                trend.isPositive 
                  ? "bg-green-500/20 text-green-600 dark:text-green-400" 
                  : "bg-red-500/20 text-red-600 dark:text-red-400"
              )}
            >
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className={cn("rounded-xl p-3", iconVariants[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};
