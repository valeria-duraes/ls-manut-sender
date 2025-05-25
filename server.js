const { Pool } = require('pg')
const { sendEmail } = require('./send')
require('dotenv').config()

const pool = new Pool({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   ssl: {
//     rejectUnauthorized: false // ou true se tiver o certificado
//   }
    connectionString: process.env.CONNECTION_URL
})

async function processQueue() {
  const client = await pool.connect()

  try {
    const { rows: mensagens } = await client.query(
      `SELECT * FROM notification_queue WHERE status = 1 AND type = 1 ORDER BY created_at`
    )

    for (const msg of mensagens) {
      const sent = await sendEmail({
        to: msg.destination_email,
        subject: msg.subject,
        html: msg.html,
      })

      if (sent) {
        await client.query(
          `UPDATE notification_queue SET status = 2, "updated_at" = NOW() WHERE id = $1`,
          [msg.id]
        )
      } else {
        await client.query(
          `UPDATE message_queue SET status = 3 WHERE id = $1`,
          [msg.id]
        )
      }
    }

    console.log('✅ Fila processada')
  } catch (err) {
    console.error('Erro ao processar a fila:', err.message)
  } finally {
    client.release()
  }
}

processQueue()