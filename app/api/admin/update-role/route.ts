import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const { userId, newRole } = await request.json()

    // Verificar que el usuario actual sea admin
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Verificar que el usuario actual es admin
    const { data: currentUser } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "No tienes permisos de administrador" }, { status: 403 })
    }

    // Usar admin client para actualizar el rol
    const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { error } = await adminClient.from("users").update({ role: newRole }).eq("id", userId)

    if (error) {
      console.error("[v0] Error updating role:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in update-role API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
