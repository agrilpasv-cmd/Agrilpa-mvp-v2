export const SPANISH_LOWERCASE_WORDS = new Set([
  "de",
  "del",
  "la",
  "las",
  "el",
  "los",
  "en",
  "y",
  "e",
  "o",
  "u",
  "a",
  "al",
  "con",
  "por",
  "para",
  "sin",
  "sobre",
  "un",
  "una",
  "unos",
  "unas",
])

/**
 * Automatically formats text so that words start with an uppercase letter,
 * except Spanish lowercase conjunctions/prepositions/articles (like "de", "del", "la", "en", "y", "con"),
 * unless they appear at the beginning of the text or sentence.
 *
 * Example:
 * "arroz de carmona" -> "Arroz de Carmona"
 * "cafe con leche de especialidad" -> "Cafe con Leche de Especialidad"
 * "el salvador" -> "El Salvador"
 */
export function smartCapitalize(str: string): string {
  if (!str || typeof str !== "string") return str

  return str.replace(/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+/g, (match: string, offset: number) => {
    const lower = match.toLowerCase()

    // Check if this word is at the start of string or preceded only by whitespace or sentence punctuation (. ! ? : \n)
    const textBefore = str.slice(0, typeof offset === "number" ? offset : 0)
    const isStartOfSentence =
      !offset ||
      offset === 0 ||
      /^[\s\n\r]*$/.test(textBefore) ||
      /[.!?:\n]\s*$/.test(textBefore)

    if (!isStartOfSentence && SPANISH_LOWERCASE_WORDS.has(lower)) {
      return lower
    }

    // Capitalize first letter and keep the rest
    return match.charAt(0).toLocaleUpperCase("es-ES") + match.slice(1)
  })
}
