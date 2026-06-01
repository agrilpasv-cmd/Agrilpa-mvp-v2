const { Resend } = require('resend');

const resend = new Resend('re_ZLUrzp8a_3asKYWQTc1dqTuF7cSmugixr');

async function checkStatus() {
  const { data, error } = await resend.emails.get('ebb73f50-3400-405a-b11d-6833f8c30b42');
  console.log('Status for email:', { data, error });
}

checkStatus();
