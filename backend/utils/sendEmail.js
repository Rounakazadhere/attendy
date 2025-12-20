import nodemailer from 'nodemailer';

// Create Transporter
// NOTE: For real email, User must provide EMAIL_USER and EMAIL_PASS in .env
// For now, we will log to console as well for easy testing without creds.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (options) => {
    // 1. Log for Development (So user can see OTP without checking email)
    console.log(`\n📧 [EMAIL MOCK] To: ${options.email} | Subject: ${options.subject}`);
    console.log(`✉️ Message: ${options.message}\n`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log("⚠️ Email credentials missing in .env. Skipping real email send.");
        return;
    }

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${options.email}`);
    } catch (err) {
        console.error("❌ Email send failed:", err.message);
        // Don't crash the server, just log
    }
};

export default sendEmail;
