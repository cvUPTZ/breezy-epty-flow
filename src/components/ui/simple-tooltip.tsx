import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SimpleTooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export function SimpleTooltip({ content, children, className }: SimpleTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-2 py-1 text-xs text-white bg-black rounded shadow-lg",
            "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
            "whitespace-nowrap",
            className
          )}
        >
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black" />
        </div>
      )}
    </div>
  );
}