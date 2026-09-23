"use client"

import { useEffect } from "react"
import { smartCapitalize } from "@/lib/text-format"

const EXCLUDED_TYPES = new Set([
  "password",
  "email",
  "number",
  "url",
  "file",
  "checkbox",
  "radio",
  "hidden",
  "color",
  "range",
  "date",
  "time",
  "datetime-local",
])

const EXCLUDED_NAMES_OR_FIELDS = [
  "password",
  "pwd",
  "email",
  "mail",
  "phone",
  "tel",
  "countrycode",
  "price",
  "quantity",
  "amount",
  "budget",
  "minorder",
  "website",
  "url",
  "link",
  "token",
  "code",
  "id",
  "slug",
  "postal",
  "zip",
  "otp",
]

function isFieldExcluded(el: HTMLInputElement | HTMLTextAreaElement): boolean {
  if (el.dataset.noAutoCaps === "true") return true
  if (el.readOnly || el.disabled) return true

  const type = (el.getAttribute("type") || "text").toLowerCase()
  if (EXCLUDED_TYPES.has(type)) return true

  const inputMode = (el.getAttribute("inputmode") || "").toLowerCase()
  if (inputMode === "numeric" || inputMode === "decimal" || inputMode === "email" || inputMode === "url") {
    return true
  }

  const name = (el.name || "").toLowerCase()
  const id = (el.id || "").toLowerCase()
  const autocomplete = (el.getAttribute("autocomplete") || "").toLowerCase()

  if (autocomplete === "email" || autocomplete.includes("password") || autocomplete === "tel") {
    return true
  }

  if (EXCLUDED_NAMES_OR_FIELDS.some((excluded) => name.includes(excluded) || id.includes(excluded))) {
    return true
  }

  return false
}

export function AutoCapitalizeProvider() {
  useEffect(() => {
    const handleInput = (e: Event) => {
      const customEvent = e as any
      if (customEvent._isAutoCapped) return

      const target = e.target as HTMLElement | null
      if (!target) return

      const isInput = target instanceof HTMLInputElement
      const isTextArea = target instanceof HTMLTextAreaElement

      if (!isInput && !isTextArea) return

      const formElement = target as HTMLInputElement | HTMLTextAreaElement

      if (isFieldExcluded(formElement)) return

      const currentVal = formElement.value
      if (!currentVal) return

      const formatted = smartCapitalize(currentVal)
      if (formatted === currentVal) return

      // Save cursor position
      const start = formElement.selectionStart
      const end = formElement.selectionEnd

      // Use native property setter so React's internal valueTracker updates correctly
      const proto = isInput
        ? window.HTMLInputElement.prototype
        : window.HTMLTextAreaElement.prototype
      const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set

      if (nativeSetter) {
        nativeSetter.call(formElement, formatted)
      } else {
        formElement.value = formatted
      }

      // Restore cursor position
      if (start !== null && end !== null) {
        try {
          formElement.setSelectionRange(start, end)
        } catch (_) {}
      }

      // Dispatch synthetic input event for React state handlers
      const nextEvent = new Event("input", { bubbles: true })
      ;(nextEvent as any)._isAutoCapped = true
      formElement.dispatchEvent(nextEvent)
    }

    document.addEventListener("input", handleInput, { capture: true })

    return () => {
      document.removeEventListener("input", handleInput, { capture: true })
    }
  }, [])

  return null
}
