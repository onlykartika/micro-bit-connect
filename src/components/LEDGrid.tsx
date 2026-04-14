import React from "react";

interface LEDGridProps {
  pattern: boolean[][];
  size?: number;
}

const PATTERNS: Record<string, boolean[][]> = {
  heart: [
    [false, true, false, true, false],
    [true, true, true, true, true],
    [true, true, true, true, true],
    [false, true, true, true, false],
    [false, false, true, false, false],
  ],
  happy: [
    [false, false, false, false, false],
    [false, true, false, true, false],
    [false, false, false, false, false],
    [true, false, false, false, true],
    [false, true, true, true, false],
  ],
  yes: [
    [false, false, false, false, false],
    [false, false, false, false, true],
    [false, false, false, true, false],
    [true, false, true, false, false],
    [false, true, false, false, false],
  ],
  no: [
    [true, false, false, false, true],
    [false, true, false, true, false],
    [false, false, true, false, false],
    [false, true, false, true, false],
    [true, false, false, false, true],
  ],
  clear: Array(5).fill(Array(5).fill(false)),
};

export const getPattern = (name: string): boolean[][] => {
  return PATTERNS[name.toLowerCase()] || PATTERNS.clear;
};

export const PATTERN_NAMES = Object.keys(PATTERNS).filter((k) => k !== "clear");

const LEDGrid: React.FC<LEDGridProps> = ({ pattern, size = 280 }) => {
  const cellSize = size / 5;
  const dotSize = cellSize * 0.6;

  return (
    <div
      className="rounded-2xl bg-card border border-border p-6 inline-block"
      style={{ boxShadow: "var(--glow-primary)" }}
    >
      <div
        className="grid grid-cols-5 gap-2 rounded-xl bg-muted p-4"
        style={{ width: size + 48, height: size + 48 }}
      >
        {pattern.flat().map((on, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${on ? "animate-led-on" : ""}`}
            style={{
              width: dotSize,
              height: dotSize,
              backgroundColor: on
                ? "hsl(var(--primary))"
                : "hsl(var(--muted-foreground) / 0.15)",
              boxShadow: on ? "var(--glow-primary)" : "none",
              margin: "auto",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LEDGrid;
