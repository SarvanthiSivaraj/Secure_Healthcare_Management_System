require('dotenv').config();
const nodemailer = require('nodemailer');
console.log('Nodemailer type:', typeof nodemailer);
console.log('Nodemailer keys:', Object.keys(nodemailer));

async function testEmail() {
    console.log('Testing Email Configuration...');
    console.log(`Host: ${process.env.EMAIL_HOST}`);
    console.log(`Port: ${process.env.EMAIL_PORT}`);
    console.log(`User: ${process.env.EMAIL_USER}`);
    console.log(`Secure: ${process.env.EMAIL_SECURE}`);

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('✅ Connection Successful!');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Test Email from Healthcare System',
            text: 'If you see this, email configuration is working!'
        });

        console.log('✅ Email sent:', info.messageId);
    } catch (err) {
        console.error('❌ Email Failed:', err);
    }
}

testEmail();
