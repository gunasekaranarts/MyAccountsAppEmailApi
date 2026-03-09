/**
 * Vercel Serverless Function: Monthly Report Email Sender
 * Endpoint: https://YOUR-VERCEL-URL/api/send-report
 * Handles sending emails with file attachments (PDF, Excel, etc.)
 */

const nodemailer = require('nodemailer');

// Brevo credentials from Vercel environment variables
const BREVO_LOGIN = process.env.BREVO_LOGIN;
const BREVO_KEY = process.env.BREVO_KEY;

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: BREVO_LOGIN,
        pass: BREVO_KEY,
    },
});

module.exports = async (req, res) => {

    // 1️⃣ Allow only POST
    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Only POST requests allowed' });
        return;
    }

    const { to, subject, body, attachments, appName } = req.body;

    // 2️⃣ Validate input
    if (!to || !subject || !body) {
        res.status(400).send({ message: 'Missing required fields: to, subject, or body.' });
        return;
    }

    // ✅ Default sender name (for My Accounts App)
    const senderName = appName || "My App Monthly Report";

    // 3️⃣ Transform attachments safely
    const mailAttachments = (attachments || []).map(att => ({
        filename: att.filename,
        content: att.content,
        encoding: att.encoding || 'base64'
    }));

    // 4️⃣ Prepare email
    const mailOptions = {
        from: `"${senderName}" <myaccappv1@myapp.com>`,
        to: to,
        subject: subject,
        text: body,
        html: `<p>${body}</p>`,
        attachments: mailAttachments,
    };

    try {
        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: 'Report email sent successfully.'
        });

    } catch (error) {
        console.error("Error sending report email:", error);

        res.status(500).json({
            success: false,
            message: 'Unable to send report email. Check Vercel logs.'
        });
    }
};
