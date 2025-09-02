import React from 'react';

const THEMES = {
  light: "",
  dark: ".dark",
} as const;

interface ChartStylesProps {
  id: string;
  colorConfig: Array<[string, { color?: string; theme?: Record<string, string> }]>;
}

export const ChartStyles: React.FC<ChartStylesProps> = ({ id, colorConfig }) => {
  const styles: Record<string, Record<string, string>> = {};

  // Generate theme styles safely without dangerouslySetInnerHTML
  Object.entries(THEMES).forEach(([theme, prefix]) => {
    const selector = `${prefix} [data-chart=${id}]`;
    styles[selector] = {};

    colorConfig.forEach(([key, itemConfig]) => {
      const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color;
      if (color) {
        styles[selector][`--color-${key}`] = color;
      }
    });
  });

  // Create style elements safely
  return (
    <>
      {Object.entries(styles).map(([selector, cssVars], index) => (
        <style key={`${id}-${index}`}>
          {`${selector} { ${Object.entries(cssVars).map(([prop, value]) => `${prop}: ${value};`).join(' ')} }`}
        </style>
      ))}
    </>
  );
};