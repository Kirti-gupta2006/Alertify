import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        "severity-high": "border-severity-high/30 bg-severity-high/20 text-severity-high",
        "severity-medium": "border-severity-medium/30 bg-severity-medium/20 text-severity-medium",
        "severity-low": "border-severity-low/30 bg-severity-low/20 text-severity-low",
        unverified: "border-status-unverified/30 bg-status-unverified/20 text-status-unverified",
        verified: "border-status-verified/30 bg-status-verified/20 text-status-verified",
        resolved: "border-status-resolved/30 bg-status-resolved/20 text-status-resolved",
        "in-progress": "border-status-in-progress/30 bg-status-in-progress/20 text-status-in-progress",
        acknowledged: "border-primary/30 bg-primary/20 text-primary",
        accident: "border-incident-accident/30 bg-incident-accident/20 text-incident-accident",
        medical: "border-incident-medical/30 bg-incident-medical/20 text-incident-medical",
        fire: "border-incident-fire/30 bg-incident-fire/20 text-incident-fire",
        infrastructure: "border-incident-infrastructure/30 bg-incident-infrastructure/20 text-incident-infrastructure",
        crime: "border-incident-crime/30 bg-incident-crime/20 text-incident-crime",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
