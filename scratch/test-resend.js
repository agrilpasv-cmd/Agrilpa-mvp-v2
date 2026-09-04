require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  try {
    console.log("Intentando enviar correo con Resend...");
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: 'test@example.com', // Dummy email, should throw domain unverified if so, or free tier restriction
      subject: 'Test Resend',
      html: '<p>Test</p>'
    });

    if (error) {
      console.error("Resend API Error:", error);
    } else {
      console.log("Resend Success:", data);
    }
  } catch (err) {
    console.error("Catch Error:", err);
  }
}

testEmail();
