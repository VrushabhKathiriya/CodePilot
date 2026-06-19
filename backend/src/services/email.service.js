import nodemailer from "nodemailer";

let transporter;

const createTransporter = async () => {
    if (transporter) {
        return transporter;
    }

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    await transporter.verify();

    console.log("Brevo SMTP Connected Successfully");

    return transporter;
};

export const sendOtpEmail = async (email, otp) => {
    const mailer = await createTransporter();

    await mailer.sendMail({
        from: `"CodePilot" <${process.env.MAIL_FROM}>`,
        to: email,
        subject: "CodePilot Email Verification",
        html: `
            <div style="font-family:Arial">
                <h2>Verify Your Email</h2>
                <p>Your OTP is:</p>
                <h1>${otp}</h1>
                <p>This OTP expires in 10 minutes.</p>
            </div>
        `
    });
};