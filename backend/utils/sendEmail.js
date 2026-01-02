import nodemailer from 'nodemailer';

// Create Transporter
// NOTE: For real email, User must provide EMAIL_USER and EMAIL_PASS in .env
// For now, we will log to console as well for easy testing without creds.
// Transporter will be created dynamically or re-used if we want to optimize, 
// but for simplicity and safety ensuring envs are loaded, we can create it inside, or 
// use a getter. Given traffic is low, creating inside or lazily is fine.

let transporter;

const createTransporter = () => {
    // Sanitize Credentials (lazy load)
    const emailUser = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : '';
    const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';

    if (!emailUser || !emailPass) return null;

    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });
};

const sendEmail = async (options) => {
    // 1. Log for Development (So user can see OTP without checking email)
    console.log(`\n📧 [EMAIL MOCK] To: ${options.email} | Subject: ${options.subject}`);
    console.log(`✉️ Message: ${options.message}\n`);

    const transporter = createTransporter();

    if (!transporter) {
        console.log("⚠️ Email credentials missing/empty. Skipping real email send.");
        return;
    }

    // Sanitize again for from field
    const emailUser = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : '';

    try {
        const mailOptions = {
            from: emailUser,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${options.email}`);
    } catch (err) {
        console.error("❌ Email send failed:", err.message);
        throw err; // Fail the request so the user knows
    }
};

export default sendEmail;
