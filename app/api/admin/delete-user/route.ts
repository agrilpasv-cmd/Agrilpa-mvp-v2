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

    // Initialize admin client to verify role
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

    // Verify req user profile
    const { data: adminProfile } = await adminClient.from("users").select("role").eq("id", requestingUser.id).single()

    if (adminProfile?.role !== "admin" && requestingUser.email !== "agrilpasv@gmail.com") {
      return NextResponse.json({ error: "Acceso denegado: requieres permisos de Administrador" }, { status: 403 })
    }

    // 1. Delete user dependencies manually to prevent foreign key errors
    await adminClient.from("user_activities").delete().eq("user_id", userId)
    await adminClient.from("user_products").delete().eq("user_id", userId)
    await adminClient.from("quotations").delete().or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    await adminClient.from("account_deletion_reports").delete().eq("user_id", userId)

    // 2. Delete profile from users table
    console.log(`[Admin Delete] Borrando perfil de BD...`)
    const { error: profileError } = await adminClient.from("users").delete().eq("id", userId)
    
    if (profileError) {
      console.error("[Admin] Error deleting user profile:", profileError)
      return NextResponse.json({ error: "No se pudo eliminar el perfil de la base de datos: " + profileError.message }, { status: 500 })
    }

    // 3. Delete from auth.users
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
