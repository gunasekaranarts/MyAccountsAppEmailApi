/**
 * Vercel Serverless Function: Secure Password Reset Email Sender
 * Endpoint: https://YOUR-VERCEL-URL/api/send-email
 * Uses Nodemailer and Brevo credentials stored securely in Vercel Environment Variables.
 */
const nodemailer = require('nodemailer');

// 🚨 Brevo Credentials are read securely from Vercel Environment Variables
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
    // 1. Only allow POST requests (required for security and sending data)
    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Only POST requests allowed' });
        return;
    }

    const { email, password } = req.body;

    // 2. Validate input
    if (!email || !password) {
        res.status(400).send({ message: 'Missing required fields: email and password.' });
        return;
    }

    // 3. Prepare Email Object
    const mailOptions = {
        from: '"My Accounts App Password" <myaccappv1@myapp.com>', 
        to: email,
        subject: "Your Passwordd",
        html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <p>Hello,</p>
                <p>Your login password for the my Accounts App is:</p>
                <h2 style="color: #4A90E2; background: #f0f0f0; padding: 10px; border-radius: 4px; display: inline-block;">${password}</h2>
                <p>Please log in immediately with this password and navigate to your account settings to change new password.</p>
                <p>If you did not request this, please ignore this email.</p>
                <p>Thanks,<br>The My Accounts App Team</p>
            </div>
        `,
    };

    try {
        // 4. Send the email
        await transporter.sendMail(mailOptions);
        // Respond with success
        res.status(200).json({ success: true, message: 'Email sent successfully.' });
    } catch (error) {
        console.error("Error sending email:", error);
        // Respond with error
        res.status(500).json({ success: false, message: 'Unable to send email. Check Vercel logs.' });
    }
};