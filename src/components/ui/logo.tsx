import elizaBlack from "@/images/eliza-black.png";
import elizaWhite from "@/images/eliza-white.png";
import Image from "next/image";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function Logo({ width = 120, height = 32, className = "" }: LogoProps) {
  return (
    <div className={className}>
      <Image
        src={elizaWhite}
        alt="Eliza Logo"
        className="hidden dark:block"
        width={width}
        height={height}
        priority
      />
      <Image
        src={elizaBlack}
        alt="Eliza Logo"
        className="block dark:hidden"
        width={width}
        height={height}
        priority
      />
    </div>
  );
}
