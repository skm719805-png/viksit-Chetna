import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",
  port: 465,
  secure: true,
  auth: {
    user: "no-reply@viksitchetna.in",
    pass: process.env.ZOHO_SMTP_PASSWORD,
  },
});

const FROM = '"Viksit Chetna" <no-reply@viksitchetna.in>';
const ADMIN = "admin@viksitchetna.in";

export async function sendMail(to: string | string[], subject: string, html: string) {
  try {
    await transporter.sendMail({ from: FROM, to, subject, html });
  } catch (e) {
    console.error("Mail error:", e);
  }
}

export async function notifyAdmin(subject: string, html: string) {
  await sendMail(ADMIN, subject, html);
}

function base(content: string) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:24px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:22px">Viksit Chetna</h1>
      <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px">Intellectual Club</p>
    </div>
    <div style="padding:28px">${content}</div>
    <div style="background:#f9fafb;padding:16px;text-align:center;font-size:12px;color:#6b7280">
      viksitchetna.in &nbsp;|&nbsp; support@viksitchetna.in
    </div>
  </div>`;
}

// ── Member emails ──────────────────────────────────────────────
export async function emailMemberRegistered(name: string, email: string) {
  await sendMail(email, "Membership Application Received – Viksit Chetna", base(`
    <h2 style="color:#6366f1">Hello ${name}! 👋</h2>
    <p>Thank you for applying to join <strong>Viksit Chetna</strong>. Your application has been received and is under review.</p>
    <p>You will receive an email once your membership is approved along with your digital ID card.</p>
    <p style="color:#6b7280;font-size:13px">For queries, write to <a href="mailto:support@viksitchetna.in">support@viksitchetna.in</a></p>
  `));
  await notifyAdmin("🆕 New Membership Application", base(`
    <h2 style="color:#6366f1">New Member Application</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p>Login to the admin panel to review and approve.</p>
  `));
}

export async function emailMemberApproved(name: string, email: string, memberId: string, memberDbId: string) {
  await sendMail(email, "🎉 Membership Approved – Viksit Chetna", base(`
    <h2 style="color:#6366f1">Congratulations, ${name}! 🎉</h2>
    <p>Your membership has been <strong style="color:#16a34a">approved</strong>!</p>
    <p style="font-size:18px;font-weight:bold;color:#6366f1">Member ID: ${memberId}</p>
    <p>You can now view and print your digital ID card:</p>
    <a href="https://viksitchetna.in/membership/id-card?id=${memberDbId}" 
       style="display:inline-block;background:#6366f1;color:#fff;padding:12px 28px;border-radius:999px;text-decoration:none;font-weight:bold;margin-top:8px">
      🪪 View Digital ID Card
    </a>
    <p style="margin-top:20px;color:#6b7280;font-size:13px">An OTP will be required to print your ID card for security.</p>
  `));
}

export async function emailMemberRejected(name: string, email: string) {
  await sendMail(email, "Membership Application Update – Viksit Chetna", base(`
    <h2 style="color:#6366f1">Hello ${name},</h2>
    <p>We regret to inform you that your membership application could not be approved at this time.</p>
    <p>For more information, please contact us at <a href="mailto:support@viksitchetna.in">support@viksitchetna.in</a></p>
  `));
}

export async function emailIdCardOtp(name: string, email: string, otp: string) {
  await sendMail(email, "Your ID Card OTP – Viksit Chetna", base(`
    <h2 style="color:#6366f1">Hello ${name},</h2>
    <p>Your OTP to print your digital ID card is:</p>
    <div style="font-size:36px;font-weight:bold;color:#6366f1;letter-spacing:8px;text-align:center;padding:20px;background:#f5f3ff;border-radius:12px;margin:16px 0">${otp}</div>
    <p style="color:#6b7280;font-size:13px">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
  `));
}

// ── Volunteer emails ───────────────────────────────────────────
export async function emailVolunteerRegistered(name: string, email: string, campaignTitle: string) {
  await sendMail(email, "Volunteer Application Received – Viksit Chetna", base(`
    <h2 style="color:#6366f1">Hello ${name}! 👋</h2>
    <p>Thank you for volunteering for <strong>${campaignTitle}</strong>. Your application is under review.</p>
    <p>You will be notified once approved. Upon completion, you will receive a certificate.</p>
    <p style="color:#6b7280;font-size:13px">Questions? <a href="mailto:support@viksitchetna.in">support@viksitchetna.in</a></p>
  `));
  await notifyAdmin(`🙋 New Volunteer: ${campaignTitle}`, base(`
    <h2 style="color:#6366f1">New Volunteer Application</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Campaign:</strong> ${campaignTitle}</p>
  `));
}

export async function emailVolunteerApproved(name: string, email: string, campaignTitle: string) {
  await sendMail(email, "✅ Volunteer Application Approved – Viksit Chetna", base(`
    <h2 style="color:#6366f1">Great news, ${name}! ✅</h2>
    <p>Your volunteer application for <strong>${campaignTitle}</strong> has been <strong style="color:#16a34a">approved</strong>!</p>
    <p>You will receive your certificate once the campaign is completed.</p>
  `));
}

export async function emailCertificateReady(name: string, email: string, campaignTitle: string, volunteerDbId: string) {
  await sendMail(email, "🏆 Your Certificate is Ready – Viksit Chetna", base(`
    <h2 style="color:#6366f1">Congratulations, ${name}! 🏆</h2>
    <p>Your volunteer certificate for <strong>${campaignTitle}</strong> is ready!</p>
    <a href="https://viksitchetna.in/volunteer/certificate?id=${volunteerDbId}"
       style="display:inline-block;background:#6366f1;color:#fff;padding:12px 28px;border-radius:999px;text-decoration:none;font-weight:bold;margin-top:8px">
      📜 View Certificate
    </a>
    <p style="margin-top:20px;color:#6b7280;font-size:13px">An OTP will be required to print your certificate.</p>
  `));
}

export async function emailCertificateOtp(name: string, email: string, otp: string) {
  await sendMail(email, "Your Certificate OTP – Viksit Chetna", base(`
    <h2 style="color:#6366f1">Hello ${name},</h2>
    <p>Your OTP to print your volunteer certificate is:</p>
    <div style="font-size:36px;font-weight:bold;color:#6366f1;letter-spacing:8px;text-align:center;padding:20px;background:#f5f3ff;border-radius:12px;margin:16px 0">${otp}</div>
    <p style="color:#6b7280;font-size:13px">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
  `));
}

// ── Campaign participation ─────────────────────────────────────
export async function emailCampaignParticipation(name: string, email: string, campaignTitle: string) {
  await sendMail(email, `✅ Registered for ${campaignTitle} – Viksit Chetna`, base(`
    <h2 style="color:#6366f1">Hello ${name}! 🎯</h2>
    <p>You have successfully registered for <strong>${campaignTitle}</strong>.</p>
    <p>We will keep you updated on the campaign progress.</p>
    <p style="color:#6b7280;font-size:13px">Questions? <a href="mailto:support@viksitchetna.in">support@viksitchetna.in</a></p>
  `));
  await notifyAdmin(`🎯 New Participation: ${campaignTitle}`, base(`
    <h2 style="color:#6366f1">New Campaign Participation</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Campaign:</strong> ${campaignTitle}</p>
  `));
}
