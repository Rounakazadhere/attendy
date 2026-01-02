import dotenv from 'dotenv';
dotenv.config();
import sendEmail from './utils/sendEmail.js';

const testEmail = async () => {
    console.log("--- DIAGNOSTIC START ---");
    console.log("1. Checking Environment Variables...");
    console.log("EMAIL_USER:", process.env.EMAIL_USER ? "Loaded" : "MISSING");
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded" : "MISSING");

    console.log("2. Attempting to Send Email...");
    try {
        await sendEmail({
            email: process.env.EMAIL_USER, // Send to self
            subject: "Diagnostic Test",
            message: "If you receive this, the code is working perfectly."
        });
        console.log("--- DIAGNOSTIC SUCCESS: Email Sent! ---");
    } catch (error) {
        console.error("--- DIAGNOSTIC FAILED ---");
        console.error(error);
    }
};

testEmail();
