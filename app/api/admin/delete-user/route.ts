import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "userId requerido" }, { status: 400 })
    }

    // Verify requesting user is admin
    console.log("[Admin Delete] Verificando permisos del solicitante...")
    const supabase = await createServerClient()
    const { data: { user: requestingUser } } = await supabase.auth.getUser()

    if (!requestingUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar que sea el admin autorizado por email
    if (requestingUser.email !== "agrilpasv@gmail.com") {
      return NextResponse.json({ error: "Acceso denegado: solo Administrador Principal" }, { status: 403 })
    }

    // Use service role admin client
    console.log(`[Admin Delete] Inicializando admin client para borrar usuario: ${userId}`)
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Delete profile from users table
    console.log(`[Admin Delete] Borrando perfil de BD...`)
    await adminClient.from("users").delete().eq("id", userId)

    // Delete from auth.users
    console.log(`[Admin Delete] Borrando usuario de Auth (${userId})...`)
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId)

    if (authError) {
      console.error("[Admin] Error deleting auth user:", authError)
      return NextResponse.json({ error: "Error al eliminar usuario: " + authError.message }, { status: 500 })
    }

    console.log("[Admin Delete] ÉXITO al borrar usuario.")
    return NextResponse.json({ success: true, message: "Usuario eliminado correctamente" })
  } catch (error: any) {
    console.error("[Admin] Delete user error:", error)
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 })
  }
}
