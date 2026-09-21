import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/design/ui";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function OdometerDigit({ char }: { char: string }) {
  const isDigit = !isNaN(parseInt(char, 10));

  if (!isDigit) {
    return <span className="inline-block">{char}</span>;
  }

  const num = parseInt(char, 10);

  return (
    <span className="relative inline-flex h-[1.15em] w-[0.62em] overflow-hidden leading-none align-baseline">
      <motion.span
        className="absolute inset-x-0 flex flex-col items-center"
        initial={{ y: `-${num * 10}%` }}
        animate={{ y: `-${num * 10}%` }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 26,
          mass: 0.8,
        }}
      >
        {DIGITS.map((d) => (
          <span key={d} className="flex h-[1.15em] items-center justify-center">
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export function OdometerTicker({
  value,
  prefix = "",
  suffix = "",
  className,
}: {
  value: string | number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const safeVal =
    value === undefined || value === null || (typeof value === "number" && isNaN(value))
      ? "0"
      : value;
  const formattedStr = `${prefix}${safeVal}${suffix}`;

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono font-bold tracking-tight tabular select-none",
        className
      )}
    >
      {formattedStr.split("").map((ch, idx) => (
        <OdometerDigit key={idx} char={ch} />
      ))}
    </span>
  );
}
