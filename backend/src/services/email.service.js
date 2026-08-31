// Uses Brevo HTTP API (port 443) — works on Render free tier unlike SMTP (port 465/587)
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

// OTP EMAIL TEMPLATE
const buildOtpEmailHtml = (otp, purpose) => {
    const purposeLabels = {
        REGISTER:       { heading: "Verify Your Email",    action: "Complete your registration" },
        PASSWORD_RESET: { heading: "Reset Your Password",  action: "Reset your password" },
        EMAIL_CHANGE:   { heading: "Confirm Email Change", action: "Confirm your new email address" },
    };

    const label = purposeLabels[purpose] || purposeLabels.REGISTER;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CodePilot — ${label.heading}</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding:40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:520px;margin:0 auto;background:#1e293b;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">🚀 CodePilot</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">AI-Powered Competitive Programming Platform</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 12px;color:#f1f5f9;font-size:22px;font-weight:600;">${label.heading}</h2>
              <p style="margin:0 0 28px;color:#94a3b8;font-size:15px;line-height:1.6;">
                ${label.action}. Use the OTP below — it's valid for <strong style="color:#e2e8f0;">10 minutes</strong>.
              </p>
              <div style="background:#0f172a;border:2px solid #6366f1;border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;">
                <p style="margin:0 0 8px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Your OTP Code</p>
                <div style="font-size:42px;font-weight:700;color:#6366f1;letter-spacing:12px;font-family:monospace;">${otp}</div>
              </div>
              <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
                ⚠️ Never share this code with anyone. CodePilot will never ask for your OTP.<br/>
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #334155;text-align:center;">
              <p style="margin:0;color:#475569;font-size:12px;">© ${new Date().getFullYear()} CodePilot. Built for competitive programmers.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const sendOtpEmail = async (email, otp, purpose = "REGISTER") => {
    const subjectMap = {
        REGISTER:       "CodePilot — Verify Your Email",
        PASSWORD_RESET: "CodePilot — Reset Your Password",
        EMAIL_CHANGE:   "CodePilot — Confirm Email Change",
    };

    try {
        const response = await fetch(BREVO_API_URL, {
            method: "POST",
            headers: {
                "accept":       "application/json",
                "api-key":      process.env.BREVO_API_KEY,
                "content-type": "application/json",
            },
            body: JSON.stringify({
                sender:      { name: "CodePilot", email: process.env.MAIL_FROM },
                to:          [{ email }],
                subject:     subjectMap[purpose] || "CodePilot — OTP Code",
                htmlContent: buildOtpEmailHtml(otp, purpose),
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("[email] Brevo API error:", errorData);
            throw new Error(errorData.message || "Failed to send email via Brevo API");
        }

        const data = await response.json();
        console.log(`[email] OTP sent to ${email} — messageId: ${data.messageId}`);

    } catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.log(`\n[DEV MODE] Email failed. OTP for ${email} is: ${otp}\n`);
            return; // Gracefully continue in dev
        }
        throw error;
    }
};