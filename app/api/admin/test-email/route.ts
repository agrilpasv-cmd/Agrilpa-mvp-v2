import { NextResponse } from "next/server"
import { Resend } from "resend"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json({ error: "RESEND_API_KEY is missing in server environment" }, { status: 500 })
        }

        const resend = new Resend(process.env.RESEND_API_KEY)
        const FROM_EMAIL = 'Agrilpa <onboarding@resend.dev>'

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: email, // This must be the verified email if domain is not verified
            subject: '🧪 Test Email from Agrilpa',
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h1>It Works! 🚀</h1>
                    <p>This is a test email from your Agrilpa local environment.</p>
                    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>API Key Status:</strong> Configured ✅</p>
                </div>
            `,
        })

        if (error) {
            console.error("Resend API Error:", error)
            return NextResponse.json({ error: error.message, details: error }, { status: 500 })
        }

        return NextResponse.json({ success: true, data })

    } catch (error: any) {
        console.error("Test email internal error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
