import vaultyCoin from "@assets/1934AF6F-6D3D-49A5-A43E-F71984228AEC_1776900057983.png";
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
