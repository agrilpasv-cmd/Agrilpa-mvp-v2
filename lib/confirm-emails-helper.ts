// Helper para confirmar emails desde el cliente si es necesario
export async function confirmAllEmails() {
  try {
    const response = await fetch("/api/auth/confirm-all-emails", {
      method: "POST",
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error confirmando emails:", error)
    return { success: false, error: "Error de red" }
  }
}
