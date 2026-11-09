
import sgMail from "@sendgrid/mail";
import logger from "../config/logger.js";
import { config } from "../config/index.js";

sgMail.setApiKey(config.SENDGRID_API_KEY);

class EmailService {
    constructor() {
        this.from = config.MAIL_SEND;
        this.maxRetries = 3;
    }

    // ========================================
    // COMMON EMAIL SENDER WITH RETRY
    // ========================================

    async sendWithRetry(msg, retries = 0) {
        try {
            await sgMail.send(msg);

            logger.info(`Email sent successfully to ${msg.to}`, {
                subject: msg.subject,
                attempt: retries + 1,
            });

            return { success: true };

        } catch (error) {
            logger.error(
                `Email sending failed (${retries + 1}/${this.maxRetries})`,
                {
                    to: msg.to,
                    error: error.message,
                    code: error.code,
                }
            );

            if (retries < this.maxRetries - 1) {
                const delay = Math.pow(2, retries) * 1000;

                await new Promise((resolve) =>
                    setTimeout(resolve, delay)
                );

                return this.sendWithRetry(msg, retries + 1);
            }

            throw error;
        }
    }

    // ========================================
    // OTP EMAIL
    // ========================================

    async sendOtpEmail(email, otp, ttlMinutes) {
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
        </head>

        <body style="
            margin: 0;
            padding: 0;
            background-color: #f4f4f7;
            font-family: Arial, sans-serif;
        ">

            <div style="
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            ">

                <div style="
                    background-color: #1e40af;
                    padding: 30px;
                    text-align: center;
                    color: #ffffff;
                ">
                    <h1 style="margin: 0;">IRCTC</h1>
                    <p style="margin-bottom: 0;">
                        Email Verification
                    </p>
                </div>

                <div style="padding: 35px;">

                    <h2 style="color: #222222;">
                        Verify Your Email
                    </h2>

                    <p style="
                        color: #555555;
                        line-height: 1.6;
                    ">
                        Hello,
                        <br><br>
                        Thank you for registering with IRCTC.
                        Use the OTP below to verify your email address.
                    </p>

                    <div style="
                        margin: 30px 0;
                        padding: 20px;
                        background-color: #eff6ff;
                        border-radius: 8px;
                        text-align: center;
                    ">
                        <h1 style="
                            margin: 0;
                            color: #1e40af;
                            letter-spacing: 10px;
                            font-size: 32px;
                        ">
                            ${otp}
                        </h1>
                    </div>

                    <p style="
                        color: #555555;
                        text-align: center;
                    ">
                        This OTP expires in
                        <strong>${ttlMinutes} minutes</strong>.
                    </p>

                    <p style="
                        color: #777777;
                        font-size: 13px;
                        line-height: 1.6;
                    ">
                        If you did not request this verification,
                        please ignore this email.
                        Never share your OTP with anyone.
                    </p>

                </div>

                <div style="
                    padding: 20px;
                    background-color: #f8fafc;
                    text-align: center;
                    color: #888888;
                    font-size: 12px;
                ">
                    © ${new Date().getFullYear()} IRCTC.
                    All rights reserved.
                </div>

            </div>

        </body>
        </html>
        `;

        const msg = {
            to: email,
            from: this.from,
            subject: "IRCTC - Email Verification OTP",
            html,
        };

        return this.sendWithRetry(msg);
    }

    // ========================================
    // WELCOME EMAIL
    // ========================================

    async sendWelcomeEmail(email, firstName) {
        const safeName = String(firstName ?? "User")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to IRCTC</title>
        </head>

        <body style="
            margin: 0;
            padding: 0;
            background-color: #f4f4f7;
            font-family: Arial, sans-serif;
        ">

            <div style="
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            ">

                <div style="
                    background-color: #15803d;
                    padding: 35px;
                    text-align: center;
                    color: #ffffff;
                ">
                    <h1 style="margin: 0;">
                        Welcome to IRCTC!
                    </h1>
                </div>

                <div style="padding: 35px;">

                    <h2 style="color: #222222;">
                        Hello ${safeName}!
                    </h2>

                    <p style="
                        color: #555555;
                        line-height: 1.8;
                    ">
                        Congratulations!

                        Your email address has been successfully
                        verified and your account has been created.
                    </p>

                    <p style="
                        color: #555555;
                        line-height: 1.8;
                    ">
                        You can now use your account to explore
                        railway services and manage your bookings.
                    </p>

                    <div style="
                        margin-top: 30px;
                        padding: 20px;
                        background-color: #f0fdf4;
                        border-radius: 8px;
                        text-align: center;
                    ">
                        <h3 style="color: #15803d; margin: 0;">
                            Account Verified Successfully
                        </h3>
                    </div>

                    <p style="
                        color: #777777;
                        margin-top: 30px;
                    ">
                        Thank you for joining us!
                        <br>
                        Team IRCTC
                    </p>

                </div>

                <div style="
                    padding: 20px;
                    background-color: #f8fafc;
                    text-align: center;
                    color: #888888;
                    font-size: 12px;
                ">
                    © ${new Date().getFullYear()} IRCTC.
                    All rights reserved.
                </div>

            </div>

        </body>
        </html>
        `;

        const msg = {
            to: email,
            from: this.from,
            subject: "Welcome to IRCTC - Account Verified",
            html,
        };

        return this.sendWithRetry(msg);
    }
}

const emailService = new EmailService();

export default emailService;
