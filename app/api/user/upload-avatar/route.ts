import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get("avatar") as File | null

        if (!file) {
            return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 })
        }

        // Validate type and size (max 2MB)
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: "Tipo de archivo no permitido. Usa JPG, PNG o WebP." }, { status: 400 })
        }
        if (file.size > 2 * 1024 * 1024) {
            return NextResponse.json({ error: "La imagen no debe superar 2 MB." }, { status: 400 })
        }

        const adminClient = createAdminClient()
        const ext = file.type.split("/")[1]
        const filePath = `avatars/${user.id}.${ext}`

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Ensure the 'avatars' bucket exists (create if not)
        const { data: buckets } = await adminClient.storage.listBuckets()
        const bucketExists = buckets?.some((b: any) => b.name === "avatars")
        if (!bucketExists) {
            const { error: createError } = await adminClient.storage.createBucket("avatars", {
                public: true,
                fileSizeLimit: 2097152, // 2MB
                allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
            })
            if (createError) {
                console.error("[Avatar Upload] Could not create bucket:", createError)
                return NextResponse.json({ error: "No se pudo inicializar el almacenamiento: " + createError.message }, { status: 500 })
            }
        }

        // Upload
        const { error: uploadError } = await adminClient.storage
            .from("avatars")
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: true,
            })

        if (uploadError) {
            console.error("[Avatar Upload] Storage error:", uploadError)
            return NextResponse.json({ error: "Error al subir la imagen: " + uploadError.message }, { status: 500 })
        }

        // Get public URL
        const { data: urlData } = adminClient.storage
            .from("avatars")
            .getPublicUrl(filePath)

        const avatarUrl = urlData.publicUrl + `?t=${Date.now()}`

        // Save to users table
        const { error: updateError } = await adminClient
            .from("users")
            .update({ avatar_url: urlData.publicUrl, updated_at: new Date().toISOString() })
            .eq("id", user.id)

        if (updateError) {
            console.error("[Avatar Upload] DB update error:", updateError.message, updateError.details, updateError.hint)
            // Still return the URL so the UI can show it — user needs to add the column via SQL
            return NextResponse.json({
                success: true,
                avatarUrl,
                dbWarning: "La imagen se subió correctamente. Para guardarla permanentemente, ejecuta en Supabase SQL Editor: ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;"
            })
        }

        return NextResponse.json({ success: true, avatarUrl })
    } catch (error: any) {
        console.error("[Avatar Upload] Unexpected error:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
