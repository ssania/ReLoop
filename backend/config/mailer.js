// ── Mailer — all outbound emails go through this module ──────────────────────
// Uses Resend (resend.com) instead of nodemailer/Gmail.
// If RESEND_API_KEY is not set, all functions are no-ops so dev works without email.

const { Resend } = require('resend');

const mailConfigured = !!process.env.RESEND_API_KEY;
const resend = mailConfigured ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = 'ReLoop UMass <noreply@reloopumass.site>';

// ── Email verification ────────────────────────────────────────────────────────
async function sendVerificationEmail(email, token) {
  if (!mailConfigured) return;
  const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await resend.emails.send({
    from:    FROM,
    to:      email,
    subject: 'Verify your ReLoop UMass account',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#c96a2e">ReLoop UMass 🔁</h2>
        <p>Click the button below to verify your UMass email and activate your account.</p>
        <a href="${link}"
           style="display:inline-block;background:#18181b;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Verify my email →
        </a>
        <p style="color:#888;font-size:12px">This link expires in 24 hours.</p>
      </div>
    `,
  });
}

// ── Buyer nomination ──────────────────────────────────────────────────────────
async function sendBuyerNomination({ buyerEmail, buyerName, sellerName, listingTitle, listingPrice }) {
  if (!mailConfigured) return;
  await resend.emails.send({
    from:    FROM,
    to:      buyerEmail,
    subject: `${sellerName} marked you as the buyer for "${listingTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#c96a2e">ReLoop UMass 🔁</h2>
        <p>Hi ${buyerName},</p>
        <p><strong>${sellerName}</strong> has nominated you as the buyer for <strong>"${listingTitle}"</strong> ($${listingPrice}).</p>
        <p>Open ReLoop and go to your <strong>Profile → Awaiting Confirmation</strong> tab to confirm or reject this.</p>
        <p style="color:#888;font-size:12px">— ReLoop UMass</p>
      </div>
    `,
  });
}

// ── Seller confirmation/rejection notification ────────────────────────────────
async function sendSellerConfirmation({ sellerEmail, sellerName, buyerName, listingTitle, confirmed }) {
  if (!mailConfigured) return;
  await resend.emails.send({
    from:    FROM,
    to:      sellerEmail,
    subject: `${buyerName} ${confirmed ? 'confirmed' : 'rejected'} the purchase of "${listingTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#c96a2e">ReLoop UMass 🔁</h2>
        <p>Hi ${sellerName},</p>
        <p><strong>${buyerName}</strong> has <strong>${confirmed ? 'confirmed' : 'rejected'}</strong> the purchase of <strong>"${listingTitle}"</strong>.</p>
        <p>${confirmed ? 'The listing has been marked as <strong>Sold</strong>.' : 'The listing has been reverted to <strong>Available</strong>.'}</p>
        <p style="color:#888;font-size:12px">— ReLoop UMass</p>
      </div>
    `,
  });
}

module.exports = { sendVerificationEmail, sendBuyerNomination, sendSellerConfirmation };
