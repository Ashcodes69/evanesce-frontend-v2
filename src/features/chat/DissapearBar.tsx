"use client";
import clsx from "clsx";
import { useEffect, useState } from "react";

const BASE_SECONDS = 3;
const PER_CHAR_SECONDS = 0.8;
const MIN_SECONDS = 5;
const MAX_SECONDS = 25;

const calculateDisappearDelay = (content: string) => {
  const delay = BASE_SECONDS + content.length * PER_CHAR_SECONDS;
  return Math.max(MIN_SECONDS, Math.min(delay, MAX_SECONDS));
};

export interface DissapearBarProps {
  content: string;
  isSender: boolean;
}

export default function DissapearBar({ content, isSender }: DissapearBarProps) {
  const [started, setStarted] = useState(false);
  const duration = calculateDisappearDelay(content);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setStarted(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <div
      className={clsx(
        "h-full rounded-full",
        isSender ? "bg-white" : "bg-primary",
      )}
      style={{
        width: started ? "0%" : "100%",
        transition: `width ${duration}s linear`,
      }}
    ></div>
  );
}
