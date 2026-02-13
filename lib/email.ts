import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'Agrilpa <onboarding@resend.dev>'

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
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: sellerEmail,
            subject: `🛒 Nueva compra: ${productName}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                    <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 32px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">🎉 ¡Nueva Compra Recibida!</h1>
                    </div>
                    <div style="padding: 32px;">
                        <p style="font-size: 16px; color: #374151;">Hola <strong>${sellerName}</strong>,</p>
                        <p style="font-size: 16px; color: #374151;">Tienes una nueva orden de compra en Agrilpa:</p>
                        
                        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; margin: 24px 0;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Producto</td>
                                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #111827;">${productName}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Comprador</td>
                                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #111827;">${buyerName}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Cantidad</td>
                                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #111827;">${quantity} kg</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; border-top: 1px solid #d1fae5; color: #6b7280; font-size: 14px;">Total</td>
                                    <td style="padding: 8px 0; border-top: 1px solid #d1fae5; text-align: right; font-weight: bold; color: #16a34a; font-size: 20px;">$${price.toFixed(2)} USD</td>
                                </tr>
                            </table>
                        </div>

                        <p style="font-size: 14px; color: #6b7280;">Ingresa a tu panel de vendedor en Agrilpa para gestionar este pedido.</p>
                    </div>
                    <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; font-size: 12px; color: #9ca3af;">© ${new Date().getFullYear()} Agrilpa - Comercio Agrícola de El Salvador</p>
                    </div>
                </div>
            `,
        })

        if (error) {
            console.error('[Email] Error sending purchase notification:', error)
            return { success: false, error }
        }
        console.log('[Email] Purchase notification sent to:', sellerEmail)
        return { success: true, data }
    } catch (err) {
        console.error('[Email] Failed to send purchase notification:', err)
        return { success: false, error: err }
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
    const emoji = isAccepted ? '✅' : '❌'
    const statusText = isAccepted ? 'Aceptada' : 'Rechazada'
    const statusColor = isAccepted ? '#16a34a' : '#dc2626'
    const bgColor = isAccepted ? '#f0fdf4' : '#fef2f2'
    const borderColor = isAccepted ? '#bbf7d0' : '#fecaca'
    const message = isAccepted
        ? 'Tu cotización ha sido aceptada por el vendedor. Se ha creado una orden de compra automáticamente.'
        : 'Lamentablemente, el vendedor ha rechazado tu cotización. Te invitamos a explorar más productos en Agrilpa.'

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: buyerEmail,
            subject: `${emoji} Cotización ${statusText}: ${productName}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                    <div style="background: linear-gradient(135deg, ${statusColor}, ${isAccepted ? '#15803d' : '#b91c1c'}); padding: 32px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">${emoji} Cotización ${statusText}</h1>
                    </div>
                    <div style="padding: 32px;">
                        <p style="font-size: 16px; color: #374151;">Hola <strong>${buyerName}</strong>,</p>
                        
                        <div style="background-color: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 12px; padding: 24px; margin: 24px 0;">
                            <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Producto</p>
                            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #111827;">${productName}</p>
                            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid ${borderColor};">
                                <span style="display: inline-block; background-color: ${statusColor}; color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: bold;">
                                    ${statusText}
                                </span>
                            </div>
                        </div>

                        <p style="font-size: 16px; color: #374151;">${message}</p>
                    </div>
                    <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; font-size: 12px; color: #9ca3af;">© ${new Date().getFullYear()} Agrilpa - Comercio Agrícola de El Salvador</p>
                    </div>
                </div>
            `,
        })

        if (error) {
            console.error('[Email] Error sending quotation status email:', error)
            return { success: false, error }
        }
        console.log('[Email] Quotation status email sent to:', buyerEmail)
        return { success: true, data }
    } catch (err) {
        console.error('[Email] Failed to send quotation status email:', err)
        return { success: false, error: err }
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
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: recipientEmail,
            subject,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                    <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 32px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">📬 Agrilpa</h1>
                    </div>
                    <div style="padding: 32px;">
                        <p style="font-size: 16px; color: #374151;">Hola <strong>${recipientName}</strong>,</p>
                        <div style="font-size: 16px; color: #374151; line-height: 1.6;">
                            ${htmlContent}
                        </div>
                    </div>
                    <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; font-size: 12px; color: #9ca3af;">© ${new Date().getFullYear()} Agrilpa - Comercio Agrícola de El Salvador</p>
                    </div>
                </div>
            `,
        })

        if (error) {
            console.error('[Email] Error sending newsletter:', error)
            return { success: false, error }
        }
        return { success: true, data }
    } catch (err) {
        console.error('[Email] Failed to send newsletter:', err)
        return { success: false, error: err }
    }
}
