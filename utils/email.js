const emailjs = require('@emailjs/nodejs')
require('dotenv').config()

async function sendWelcomeEmail(toEmail, username) {
  try {
    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      {
        username: username,
        email: toEmail
      },
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY
      }
    )
    console.log('Email sent to', toEmail)
  } catch (err) {
    console.log('Email failed:', err)
  }
}

module.exports = { sendWelcomeEmail }