const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../lib/email.ts');
let content = fs.readFileSync(filePath, 'utf8');

const newFunction = `
/**
 * Notify user about a new chat message
 */
export async function sendChatNotificationEmail({
    recipientEmail,
    recipientName,
    senderName,
    productName,
}: {
    recipientEmail: string
    recipientName: string
    senderName: string
    productName: string
}) {
    try {
        const resend = getResendClient()

        const content = \`
            <p>Hola <strong>\${recipientName}</strong>,</p>
            <p style="font-size: 18px; color: \${THEME.primary}; font-weight: 500;">Tienes un nuevo mensaje pendiente.</p>
            
            <p><strong>\${senderName}</strong> te ha enviado un mensaje y está esperando tu respuesta respecto al producto <strong>\${productName}</strong>.</p>
            
            <div style="background-color: \${THEME.secondary}; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid \${THEME.border};">
                <p style="margin: 0; color: \${THEME.text};">Entra a tu panel para continuar la negociación de forma segura.</p>
            </div>
        \`

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: recipientEmail,
            subject: \`💬 Nuevo mensaje de \${senderName} sobre \${productName}\`,
            html: getMinimalistTemplate('¡Tienes un nuevo mensaje!', content, { text: 'Ver Mensajes', url: 'https://agrilpa.com/dashboard/mensajes' }),
        })

        if (error) {
            console.error('[Email] Error sending chat notification:', error)
            return { success: false, error }
        }
        return { success: true, data }
    } catch (err: any) {
        console.error('[Email] Failed to send chat notification:', err)
        return { success: false, error: { message: err.message } }
    }
}
`;

content += newFunction;
fs.writeFileSync(filePath, content, 'utf8');
console.log('Added sendChatNotificationEmail to lib/email.ts');
