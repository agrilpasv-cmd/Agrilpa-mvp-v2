import { NextResponse } from "next/server"
import { sendNewsletterEmail } from "@/lib/email"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json({ error: "RESEND_API_KEY is missing in server environment" }, { status: 500 })
        }

        const result = await sendNewsletterEmail({
            recipientEmail: email,
            recipientName: "Usuario de Prueba",
            subject: "✨ Prueba del Nuevo Diseño Agrilpa",
            htmlContent: `
                <p>¡Hola!</p>
                <p>Este es un correo de prueba para verificar que el <strong>nuevo diseño minimalista</strong> está funcionando correctamente.</p>
                <p>Deberías ver:</p>
                <ul>
                    <li>El logo de Agrilpa en la cabecera (sobre fondo verde oscuro).</li>
                    <li>Este texto en un contenedor limpio.</li>
                    <li>Un pie de página sencillo.</li>
                </ul>
                <p>Si ves esto bien, ¡todo está listo!</p>
            `
        })

        if (!result.success) {
            console.error("Resend API Error:", result.error)
            return NextResponse.json({ error: "Failed to send email", details: result.error }, { status: 500 })
        }

        return NextResponse.json({ success: true, data: result.data })

    } catch (error: any) {
        console.error("Test email internal error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
