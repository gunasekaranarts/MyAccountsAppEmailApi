/**
 * Vercel Serverless Function: Secure Email Sender
 * Endpoint: https://YOUR-VERCEL-URL/api/send-email
 */

const nodemailer = require('nodemailer');

// Gmail credentials from Vercel environment variables
const GMAIL_LOGIN = process.env.GMAIL_LOGIN;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: GMAIL_LOGIN,
        pass: GMAIL_APP_PASSWORD,
    },
});

module.exports = async (req, res) => {

    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Only POST requests allowed' });
        return;
    }

    const { email, subject, body, appName } = req.body;

    // Validate required fields
    if (!email || !body || !subject) {
        res.status(400).send({ message: 'Missing required fields: email, subject, or body.' });
        return;
    }

    // ✅ Default app name if not provided
    const senderName = appName || "My Accounts App";

    const mailOptions = {
        from: `"${senderName}" <${GMAIL_LOGIN}>`,
        to: email,
        subject: subject,
        html: body,
    };

    try {
        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: "Email sent successfully."
        });

    } catch (error) {
        console.error("Error sending email:", error);

        res.status(500).json({
            success: false,
            message: "Unable to send email. Check Vercel logs."
        });
    }
};
