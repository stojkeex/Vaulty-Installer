import vaultyCoin from "@assets/IMG_1036_1775418773775.png";
import { cn } from "@/lib/utils";

interface VaultyIconProps {
  className?: string;
  size?: number | string;
}

export function VaultyIcon({ className, size = 16 }: VaultyIconProps) {
  return (
    <img 
      src={vaultyCoin} 
      alt="Vaulty Coin" 
      className={cn("inline-block object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}
