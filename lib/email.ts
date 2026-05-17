// PLACE AT: lib/email.ts
// Uses Resend — free tier is 3,000 emails/month, no SMTP setup needed.
// Install: npm install resend
// Get API key: https://resend.com → Dashboard → API Keys
// Add to .env: RESEND_API_KEY=re_xxxxx
//              EMAIL_FROM=noreply@yourdomain.com

const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const FROM           = process.env.EMAIL_FROM ?? "ECOSWAP <noreply@ecoswaech.ng>";
const APP_URL        = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Email send failed:", err);
    throw new Error("Email delivery failed");
  }
}

// ─── Email verification ────────────────────────────────────────────────────────

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${APP_URL}/verify-email?token=${token}`;
  await sendEmail(
    email,
    "Verify your ECOSWAP email address",
    `
    <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px">
      <div style="background:#7b2ff2;padding:24px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">ECOSWAP</h1>
        <p style="color:#e0d7ff;margin:8px 0 0;font-size:13px">Africa's EV Marketplace</p>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:32px">
        <h2 style="color:#111827;font-size:20px;margin:0 0 12px">Verify your email</h2>
        <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px">
          Click the button below to verify your email address and activate your ECOSWAP account.
          This link expires in <strong>24 hours</strong>.
        </p>
        <a href="${url}"
          style="display:inline-block;background:#7b2ff2;color:#fff;padding:14px 32px;border-radius:50px;font-size:15px;font-weight:600;text-decoration:none">
          Verify Email Address
        </a>
        <p style="color:#9ca3af;font-size:12px;margin:24px 0 0;line-height:1.5">
          If you didn't create an ECOSWAP account, you can safely ignore this email.<br/>
          Or copy this link: <a href="${url}" style="color:#7b2ff2">${url}</a>
        </p>
      </div>
    </div>
    `
  );
}

// ─── Password reset ────────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${APP_URL}/reset-password?token=${token}`;
  await sendEmail(
    email,
    "Reset your ECOSWAP password",
    `
    <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px">
      <div style="background:#220a77;padding:24px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">ECOSWAP</h1>
        <p style="color:#c4b8e8;margin:8px 0 0;font-size:13px">Password Reset Request</p>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:32px">
        <h2 style="color:#111827;font-size:20px;margin:0 0 12px">Reset your password</h2>
        <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px">
          We received a request to reset your password. Click below to set a new one.
          This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${url}"
          style="display:inline-block;background:#220a77;color:#fff;padding:14px 32px;border-radius:50px;font-size:15px;font-weight:600;text-decoration:none">
          Reset Password
        </a>
        <p style="color:#9ca3af;font-size:12px;margin:24px 0 0;line-height:1.5">
          If you didn't request a password reset, ignore this email — your password won't change.<br/>
          Link expires: ${new Date(Date.now() + 3600_000).toUTCString()}
        </p>
      </div>
    </div>
    `
  );
}