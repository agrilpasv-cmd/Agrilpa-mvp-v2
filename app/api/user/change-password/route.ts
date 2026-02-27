import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const { currentPassword, newPassword } = await request.json()

        if (!currentPassword) {
            return NextResponse.json({ error: "La contraseña actual es requerida" }, { status: 400 })
        }
        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json({ error: "La nueva contraseña debe tener al menos 6 caracteres" }, { status: 400 })
        }

        // Verify current password by re-authenticating
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password: currentPassword,
        })

        if (signInError) {
            return NextResponse.json({ error: "La contraseña actual es incorrecta", field: "current" }, { status: 400 })
        }

        const { error } = await supabase.auth.updateUser({ password: newPassword })

        if (error) {
            console.error("[ChangePassword] Error:", error)
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("[ChangePassword] Unexpected error:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
