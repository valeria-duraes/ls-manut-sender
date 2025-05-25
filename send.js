const axios = require('axios')
require('dotenv').config()

async function sendEmail({ to, subject, html }) {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: 'LS Manutenções', email: 'valleriaduraes@gmail.com' }, // use o e-mail autorizado pela Brevo
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    )

    console.log(`✔️ Email enviado para ${to}`)
    return true
  } catch (error) {
    console.error(
      `❌ Erro ao enviar para ${to}:`,
      error.response?.data || error.message
    )
    return false
  }
}

module.exports = { sendEmail }