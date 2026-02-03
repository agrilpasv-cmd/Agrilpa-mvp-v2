import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createAdminClient()

    // Obtener todos los usuarios con emails no confirmados
    const { data: users, error: fetchError } = await supabase.auth.admin.listUsers()

    if (fetchError) {
      console.error("[v0] Error fetching users:", fetchError)
      return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 })
    }

    // Confirmar cada usuario que no tenga el email confirmado
    const confirmPromises = users.users
      .filter((user) => !user.email_confirmed_at)
      .map((user) =>
        supabase.auth.admin.updateUserById(user.id, {
          email_confirm: true,
        }),
      )

    await Promise.all(confirmPromises)

    return NextResponse.json({
      success: true,
      message: `Se confirmaron ${confirmPromises.length} usuarios`,
      count: confirmPromises.length,
    })
  } catch (error) {
    console.error("[v0] Error confirming emails:", error)
    return NextResponse.json({ error: "Error al confirmar emails" }, { status: 500 })
  }
}
