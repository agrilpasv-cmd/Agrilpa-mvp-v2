const { Resend } = require('resend');

const resend = new Resend('re_ZLUrzp8a_3asKYWQTc1dqTuF7cSmugixr');

async function test() {
  const { data, error } = await resend.emails.send({
    from: 'no-reply@agrilpa.com',
    to: 'diego.castro.c@hotmail.com',
    subject: 'Test email to random address',
    html: '<p>Test</p>'
  });
  console.log('Result for random email:', { data, error });
}

test();
