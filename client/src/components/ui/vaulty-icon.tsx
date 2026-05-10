import vaultyCoin from "@assets/vaulty-logo-v.png";
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
