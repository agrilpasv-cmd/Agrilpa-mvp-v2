import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMinOrder(minOrder: string | undefined | null): string {
  if (!minOrder) return "—";
  let trimmed = minOrder.trim();
  
  // If it's a pure number (or number with decimals), append " kg" as default
  if (/^\d+([.,]\d+)?$/.test(trimmed)) {
    return `${trimmed} kg`;
  }
  
  // Replace long unit names with their abbreviations
  trimmed = trimmed.replace(/\bLibras\b/gi, "lb");
  trimmed = trimmed.replace(/\bKilogramos\b/gi, "kg");
  trimmed = trimmed.replace(/\bQuintales\b/gi, "qq");
  trimmed = trimmed.replace(/\bContenedor\(es\)\b/gi, "Contenedor");
  
  return trimmed;
}
