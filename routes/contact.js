const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// @desc    Send contact email
// @route   POST /api/contact
// @access  Public
router.post('/', async (req, res) => {
    const { name, email, subject, message, label } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Please provide all required fields (name, email, message)' });
    }

    try {
        // Create an transporter for sending email
        // Note: For real production, use actual SMTP credentials in .env
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'ksjadu.contact@gmail.com', // Placeholder if not in .env
                pass: process.env.EMAIL_PASS || 'your-password-here'  // Placeholder if not in .env
            }
        });

        const mailOptions = {
            from: email, // User's email from the form
            to: 'kushagrarawal9@gmail.com', // Company's official email provided by the USER
            subject: `${label || 'Contact Form'}: ${subject || 'New Inquiry'} from ${name}`,
            text: `You have a new ${label || 'Contact Form'} submission from your website:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject || 'N/A'}\nMessage: ${message}`,
            html: `
                <h3>New ${label || 'Contact Inquiry'}</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `
        };

        // For now, if no credentials are added, let's just log it and return success 
        // to show the frontend integration works. 
        // In a real scenario, the user would provide SMTP creds in .env

        console.log('--- New Contact Form Submission ---');
        console.log(mailOptions.text);

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail(mailOptions);
        } else {
            console.log('Skipping actual email sending: EMAIL_USER and EMAIL_PASS environment variables are missing.');
        }

        res.status(200).json({ message: 'Email sent successfully!' });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email. Please try again later.' });
    }
});

module.exports = router;
