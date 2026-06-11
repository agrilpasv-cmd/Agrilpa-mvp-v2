"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import ReactCountryFlag from "react-country-flag"

function FlagImg({ code, size = 18 }: { code: string; size?: number }) {
  return (
    <ReactCountryFlag
      countryCode={code}
      svg
      style={{ width: Math.round(size * 1.5), height: size, borderRadius: 2, objectFit: "cover" }}
      aria-label={code}
    />
  )
}

export const CURRENCIES = [
  { value: "US$", code: "US", label: "US$ (USD)" },
  { value: "€", code: "EU", label: "€ (EUR)" },
  { value: "£", code: "GB", label: "£ (GBP)" },
  { value: "¥", code: "JP", label: "¥ (JPY)" },
  { value: "Can$", code: "CA", label: "Can$ (CAD)" },
  { value: "Mex$", code: "MX", label: "Mex$ (MXN)" },
  { value: "CHF", code: "CH", label: "CHF (CHF)" },
  { value: "CNY ¥", code: "CN", label: "¥ (CNY)" }
]

interface CurrencyPickerProps {
  value: string
  onChange: (val: string) => void
  disabled?: boolean
  className?: string
}

export function CurrencyPicker({ value, onChange, disabled = false, className = "" }: CurrencyPickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = CURRENCIES.find(c => c.value === value) || CURRENCIES[0]

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={containerRef} className={`relative min-w-[140px] ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(p => !p)}
        className={`w-full h-10 flex items-center justify-between gap-2 px-3 border rounded-md text-left transition bg-background focus:outline-none focus:ring-2 focus:ring-primary ${
          open ? "border-primary ring-2 ring-primary" : "border-border hover:border-gray-400"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className="flex items-center gap-2">
          <FlagImg code={selected.code} size={14} />
          <span className="text-sm text-foreground">{selected.label}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-background border border-border rounded-md shadow-lg overflow-hidden py-1">
          {CURRENCIES.map(curr => (
            <button
              key={curr.value}
              type="button"
              onClick={() => {
                onChange(curr.value)
                setOpen(false)
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted transition-colors text-sm ${
                curr.value === value ? "bg-primary/10 font-medium text-primary" : ""
              }`}
            >
              <FlagImg code={curr.code} size={14} />
              <span className="flex-1 text-foreground">{curr.label}</span>
              {curr.value === value && <span className="text-primary text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
