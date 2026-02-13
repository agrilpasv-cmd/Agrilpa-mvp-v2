import { Resend } from 'resend'

const getResendClient = () => {
    if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY is not defined")
        throw new Error("RESEND_API_KEY no está configurada en las variables de entorno (.env.local)")
    }
    return new Resend(process.env.RESEND_API_KEY)
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Agrilpa <onboarding@resend.dev>'

// Colors from the requested "Minimalist Black, White, Dark Green" theme
const THEME = {
    primary: '#1a4d2e', // Dark Green
    secondary: '#f3f4f6', // Light Gray/White
    text: '#111827', // Almost Black
    accent: '#4ade80', // Lighter Green for highlights
    border: '#e5e7eb'
}

/**
 * Helper to generate consistent minimalist email HTML
 */
const getMinimalistTemplate = (title: string, content: string, cta?: { text: string, url: string }) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid ${THEME.border}; border-radius: 8px; overflow: hidden; margin-top: 20px; margin-bottom: 20px;">
        <!-- Minimalist Header -->
        <div style="background-color: #000000; padding: 40px 20px; text-align: center; border-bottom: 4px solid ${THEME.primary};">
            <img src="https://agrilpa-mvp-v2.vercel.app/logo-email.png" alt="Agrilpa" height="120" style="display: block; margin: 0 auto; max-width: 400px;" />
        </div>
        
        <!-- Content -->
        <div style="padding: 40px;">
            <h2 style="color: ${THEME.text}; margin-top: 0; margin-bottom: 20px; font-size: 20px; font-weight: 600;">${title}</h2>
            
            <div style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                ${content}
            </div>

            ${cta ? `
            <div style="margin-top: 30px; margin-bottom: 10px;">
                <a href="${cta.url}" style="display: inline-block; background-color: ${THEME.primary}; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; font-size: 16px;">${cta.text}</a>
            </div>
            ` : ''}
        </div>

        <!-- Minimalist Footer -->
        <div style="background-color: ${THEME.secondary}; padding: 20px 40px; border-top: 1px solid ${THEME.border}; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">© ${new Date().getFullYear()} Agrilpa. Comercio Justo y Sostenible.</p>
        </div>
    </div>
</body>
</html>
`

/**
 * Notify seller when someone purchases their product
 */
export async function sendPurchaseNotification({
    sellerEmail,
    sellerName,
    buyerName,
    productName,
    quantity,
    price,
}: {
    sellerEmail: string
    sellerName: string
    buyerName: string
    productName: string
    quantity: number
    price: number
}) {
    try {
        const resend = getResendClient()

        const content = `
            <p>Hola <strong>${sellerName}</strong>,</p>
            <p style="font-size: 18px; color: ${THEME.primary}; font-weight: 500;">Tienes una nueva notificación de una compra.</p>
            <p>Un comprador ha adquirido tu producto:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 15px;">
                <tr style="border-bottom: 1px solid ${THEME.border};">
                    <td style="padding: 12px 0; color: #6b7280;">Producto</td>
                    <td style="padding: 12px 0; text-align: right; font-weight: 600; color: ${THEME.text};">${productName}</td>
                </tr>
                <tr style="border-bottom: 1px solid ${THEME.border};">
                    <td style="padding: 12px 0; color: #6b7280;">Comprador</td>
                    <td style="padding: 12px 0; text-align: right; font-weight: 600; color: ${THEME.text};">${buyerName}</td>
                </tr>
                <tr style="border-bottom: 1px solid ${THEME.border};">
                    <td style="padding: 12px 0; color: #6b7280;">Cantidad</td>
                    <td style="padding: 12px 0; text-align: right; font-weight: 600; color: ${THEME.text};">${quantity} kg</td>
                </tr>
                <tr>
                    <td style="padding: 12px 0; color: #6b7280;">Total</td>
                    <td style="padding: 12px 0; text-align: right; font-weight: 700; color: ${THEME.primary}; font-size: 18px;">$${price.toFixed(2)} USD</td>
                </tr>
            </table>
            
            <p>Por favor ingresa a la plataforma para gestionar el envío.</p>
        `

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: sellerEmail,
            subject: `¡Felicidades! Nueva Venta de ${productName}`,
            html: getMinimalistTemplate('¡Nueva Venta Confirmada!', content, { text: 'Gestionar Orden', url: 'https://agrilpa.com/admin/sales' }),
        })

        if (error) {
            console.error('[Email] Error sending purchase notification:', error)
            return { success: false, error }
        }
        return { success: true, data }
    } catch (err: any) {
        console.error('[Email] Failed to send purchase notification:', err)
        return { success: false, error: { message: err.message } }
    }
}

/**
 * Notify buyer when their quotation status changes (accepted/rejected)
 */
export async function sendQuotationStatusEmail({
    buyerEmail,
    buyerName,
    productName,
    status,
}: {
    buyerEmail: string
    buyerName: string
    productName: string
    status: 'accepted' | 'rejected'
}) {
    const isAccepted = status === 'accepted'
    const statusText = isAccepted ? 'Aprobada' : 'Rechazada'
    const message = isAccepted
        ? `El vendedor aceptó tu cotización de <strong>${productName}</strong>. Ahora puedes proceder con la compra.`
        : `El vendedor rechazó tu cotización de <strong>${productName}</strong>.`

    try {
        const resend = getResendClient()

        const content = `
            <p>Hola <strong>${buyerName}</strong>,</p>
            <p>Tu cotización para <strong>${productName}</strong> ha sido <strong>${statusText}</strong>.</p>
            <p>${message}</p>
        `

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: buyerEmail,
            subject: `Tu Cotización fue ${statusText}: ${productName}`,
            html: getMinimalistTemplate(
                `Estado de tu Cotización`,
                content,
                isAccepted ? { text: 'Ver Orden', url: 'https://agrilpa.com/admin/purchases' } : undefined
            ),
        })

        if (error) {
            console.error('[Email] Error sending quotation status email:', error)
            return { success: false, error }
        }
        return { success: true, data }
    } catch (err: any) {
        console.error('[Email] Failed to send quotation status email:', err)
        return { success: false, error: { message: err.message } }
    }
}

/**
 * Notify seller when they receive a new quotation
 */
export async function sendNewQuotationNotification({
    sellerEmail,
    sellerName,
    buyerName,
    productName,
    quantity,
    targetPrice,
    location,
}: {
    sellerEmail: string
    sellerName: string
    buyerName: string
    productName: string
    quantity: number
    targetPrice?: number
    location: string
}) {
    try {
        const resend = getResendClient()

        const content = `
            <p>Hola <strong>${sellerName}</strong>,</p>
            <p style="font-size: 18px; color: ${THEME.primary}; font-weight: 500;">Tienes una nueva cotización pendiente.</p>
            <p>Un comprador está interesado en tu producto:</p>
            
            <div style="background-color: ${THEME.secondary}; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>Producto:</strong> ${productName}</p>
                <p style="margin: 0 0 10px 0;"><strong>Comprador:</strong> ${buyerName}</p>
                <p style="margin: 0 0 10px 0;"><strong>Cantidad:</strong> ${quantity} kg</p>
                ${targetPrice ? `<p style="margin: 0 0 10px 0;"><strong>Oferta:</strong> $${targetPrice.toFixed(2)} USD</p>` : ''}
                <p style="margin: 0;"><strong>Destino:</strong> ${location}</p>
            </div>
        `

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: sellerEmail,
            subject: `¡Nueva Cotización Pendiente! - ${productName}`,
            html: getMinimalistTemplate('¡Tienes una Cotización Pendiente!', content, { text: 'Responder Oferta', url: 'https://agrilpa.com/admin/quotations' }),
        })

        if (error) {
            console.error('[Email] Error sending quotation notification:', error)
            return { success: false, error }
        }
        return { success: true, data }
    } catch (err: any) {
        console.error('[Email] Failed to send quotation notification:', err)
        return { success: false, error: { message: err.message } }
    }
}

/**
 * Send newsletter email to a single recipient
 */
export async function sendNewsletterEmail({
    recipientEmail,
    recipientName,
    subject,
    htmlContent,
}: {
    recipientEmail: string
    recipientName: string
    subject: string
    htmlContent: string
}) {
    try {
        const resend = getResendClient()

        const content = `
            <p>Hola <strong>${recipientName}</strong>,</p>
            <div style="margin-top: 20px;">
                ${htmlContent}
            </div>
        `

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: recipientEmail,
            subject,
            html: getMinimalistTemplate(subject, content),
        })

        if (error) {
            console.error('[Email] Error sending newsletter:', error)
            return { success: false, error }
        }
        return { success: true, data }
    } catch (err: any) {
        console.error('[Email] Failed to send newsletter:', err)
        return { success: false, error: { message: err.message } }
    }
}
