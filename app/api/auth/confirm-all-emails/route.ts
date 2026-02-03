import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const adminClient = createAdminClient()

    // Confirmar todos los emails de usuarios no confirmados
    const { data, error } = await adminClient.rpc("confirm_all_emails")

    if (error) {
      console.error("[v0] Error confirmando emails:", error)

      // Fallback: Obtener usuarios y confirmarlos uno por uno
      const { data: users, error: listError } = await adminClient.auth.admin.listUsers()

      if (listError) {
        return NextResponse.json({ error: "Error obteniendo usuarios" }, { status: 500 })
      }

      let confirmedCount = 0
      for (const user of users.users) {
        if (!user.email_confirmed_at) {
          const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, { email_confirm: true })
          if (!updateError) confirmedCount++
        }
      }

      return NextResponse.json({
        success: true,
        message: `${confirmedCount} emails confirmados mediante fallback`,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Todos los emails han sido confirmados",
    })
  } catch (error) {
    console.error("[v0] Error en confirmación masiva:", error)
    return NextResponse.json({ error: "Error en el proceso de confirmación" }, { status: 500 })
  }
}
