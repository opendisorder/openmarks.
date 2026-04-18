"use client";

interface BrandLogoProps {
  firstWord: string;
  secondWord: string;
  textColor?: "white" | "black";
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl md:text-3xl",
};

export default function BrandLogo({
  firstWord,
  secondWord,
  textColor = "white",
  className = "",
  size = "md",
}: BrandLogoProps) {
  const textClass = textColor === "white" ? "text-white" : "text-black";
  return (
    <span className={`inline-flex items-baseline font-bold tracking-tight ${sizeMap[size]} ${className}`}>
      <span className="text-[#e94560]">{firstWord}</span>
      <span className={textClass}>{secondWord}</span>
      <span className="text-[#e94560]">.</span>
    </span>
  );
}
