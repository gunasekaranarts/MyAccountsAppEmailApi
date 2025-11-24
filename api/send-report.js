/**
 * Vercel Serverless Function: Monthly Report Email Sender
 * Endpoint: https://YOUR-VERCEL-URL/api/send-report
 * Handles sending emails with file attachments (PDF, Excel, etc.)
 */
const nodemailer = require('nodemailer');

// 🚨 Brevo Credentials are read securely from Vercel Environment Variables
// Ensure BREVO_LOGIN and BREVO_KEY are configured in Vercel environment settings.
const BREVO_LOGIN = process.env.BREVO_LOGIN;
const BREVO_KEY = process.env.BREVO_KEY;

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com", 
    port: 587,
    secure: false, // Use TLS
    auth: {
        user: BREVO_LOGIN, 
        pass: BREVO_KEY, 
    },
});

module.exports = async (req, res) => {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Only POST requests allowed' });
        return;
    }

    const { to, subject, body, attachments } = req.body;

    // 2. Validate input
    if (!to || !subject || !body) {
        res.status(400).send({ message: 'Missing required fields: to, subject, or body.' });
        return;
    }

    // 3. Transform attachments for Nodemailer
    // The attachments are expected to be an array of objects matching the structure:
    // { filename: string, content: string (base64 data), encoding: 'base64' }
    const mailAttachments = attachments.map(att => ({
        filename: att.filename,
        content: att.content,
        encoding: att.encoding || 'base64' // Default to base64 encoding
    }));

    // 4. Prepare Email Object
    const mailOptions = {
        from: '"My App Monthly Report" <myaccappv1@myapp.com>', 
        to: to,
        subject: subject,
        text: body,
        html: `<p>${body}</p>`,
        attachments: mailAttachments,
    };

    try {
        // 5. Send the email
        await transporter.sendMail(mailOptions);
        // Respond with success
        res.status(200).json({ success: true, message: 'Report email sent successfully.' });
    } catch (error) {
        console.error("Error sending report email:", error);
        res.status(500).json({ success: false, message: 'Unable to send report email. Check Vercel logs.' });
    }
};