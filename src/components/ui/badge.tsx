
import React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * @constant badgeVariants
 * @description Defines the variants for the Badge component using `class-variance-authority`.
 * Includes `default`, `secondary`, `destructive`, and `outline` variants.
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * @interface BadgeProps
 * @description Props for the Badge component.
 * @extends React.HTMLAttributes<HTMLDivElement>
 * @extends VariantProps<typeof badgeVariants>
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * @component Badge
 * @description A component for rendering a small badge or tag.
 * It can be customized with different variants for different visual styles.
 * @param {BadgeProps} props The props for the component.
 * @returns {JSX.Element} The rendered Badge component.
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
