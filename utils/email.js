const nodemailer = require('nodemailer');

const sendMail = async (to, message)=>{
    try {
        // console.log("sending email")
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Using Gmail service
            auth: {
                user: process.env.EMAIL, // Your Gmail
                pass: process.env.mailAppPassword, // Your App Password
            },
        });

        const mailOptions = {
            to,
            subject: 'Share Drive No-reply', // Email subject
            html: message, // Email body
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

exports.verificationLink = async (to, userId)=>{
    const messages = [
        "Thanks for registering with us! We're excited to have you here. Explore our platform and let us know if you need any help!",
        "Welcome aboard! We're thrilled to have you join us. Dive in and make the most of everything we offer!",
        "Thanks for signing up! We're here to ensure you have a smooth and rewarding experience. Let’s get started!",
        "We’re so happy to welcome you! Your journey begins now, and we’re here to support you every step of the way.",
        "Congratulations on registering! Explore everything we’ve built for you and let us know how we can make it even better!",
        "Thanks for joining us! Your journey starts here. Discover all our tools and resources, and reach out if you need help."
      ];
    return await sendMail(to, messages[Math.floor(Math.random() * 6) + 1] +`\n verification link: ${process.env.DOMAIN}/api/v1/userAuth/${userId}`);
}

exports.forgetPassword = async (to, token)=>{
    return await sendMail(to, `Reset You password \n Link : ${process.env.DOMAIN}/set-password/${token}`);
}

exports.requestEmail = async (to, car, price,name, phoneNo)=>{
    return await sendMail(to, 
        `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Share Drive</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #06d390;
            color: #ffffff;
            text-align: center;
            padding: 20px;
        }
        .header img {
            max-width: 100px;
            margin-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px;
            color: #010101;
            line-height: 1.6;
        }
        .content h2 {
            color: #06d390;
        }
        .content p {
            margin: 10px 0;
        }
        .content .details {
            background-color: #f9f9f9;
            padding: 15px;
            border: 1px solid #06d390;
            border-radius: 5px;
        }
        .content .details p {
            margin: 5px 0;
        }
        .footer {
            text-align: center;
            background-color: #010101;
            color: #ffffff;
            font-size: 14px;
            padding: 15px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <img src="${process.env.DOMAIN}/images/logo.png" alt="Share Drive Logo">
            <h1>Thank You for Reaching Out</h1>
        </div>

        <!-- Content -->
        <div class="content">
            <h2>Dear ${to},</h2>
            <p>Thank you for reaching out to us with your car request. We have received the following details:</p>

            <div class="details">
                <p><strong>Requested Car:</strong> ${car}</p>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${to}</p>
                <p><strong>Phone Number:</strong> ${phoneNo}</p>
                <p><strong>Price:</strong> ₹${price}</p>
            </div>

            <p>Our team will review your request and contact you shortly to discuss further details. If you have any additional questions or need immediate assistance, please don't hesitate to reply to this email or call us directly.</p>

            <p>Thank you for choosing us!</p>
            <p>Best regards,</p>
            <p><strong>Team Share Drive</strong></p>
        </div>

        <!-- Footer -->
        <div class="footer">
            &copy; 2024 Share Drive. All rights reserved.
        </div>
    </div>
</body>
</html>
`
    )
}