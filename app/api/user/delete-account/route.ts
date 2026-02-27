import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function DELETE(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const { password, reason, customReason } = await request.json().catch(() => ({}))

        // Verify password before deletion
        if (!password) {
            return NextResponse.json({ error: "Se requiere tu contraseña para eliminar la cuenta", field: "password" }, { status: 400 })
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password,
        })

        if (signInError) {
            return NextResponse.json({ error: "Contraseña incorrecta", field: "password" }, { status: 400 })
        }

        console.log(`[DeleteAccount] User ${user.email} deleting. Reason: ${reason}. Custom: ${customReason || "—"}`)

        const adminClient = createAdminClient()

        // 1. Log deletion reason (non-fatal — don't block deletion if this fails)
        const { error: reportError } = await adminClient.from("account_deletion_reports").insert({
            user_id: user.id,
            user_email: user.email,
            reason: reason || "No especificado",
            custom_reason: customReason || null,
        })
        if (reportError) {
            console.error("[DeleteAccount] Warning: could not save deletion report:", reportError.message)
        }

        // 2. Delete user profile from public users table
        const { error: profileError } = await adminClient.from("users").delete().eq("id", user.id)
        if (profileError) {
            console.error("[DeleteAccount] Warning: could not delete user profile:", profileError.message)
        }

        // 3. Delete the auth user permanently
        const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)

        if (deleteError) {
            console.error("[DeleteAccount] Error deleting auth user:", deleteError)
            return NextResponse.json({ error: deleteError.message }, { status: 500 })
        }

        console.log(`[DeleteAccount] Successfully deleted user ${user.email}`)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("[DeleteAccount] Unexpected error:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
