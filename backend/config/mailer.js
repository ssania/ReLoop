const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendBuyerNomination({ buyerEmail, buyerName, sellerName, listingTitle, listingPrice }) {
  await transporter.sendMail({
    from: `"ReLoop" <${process.env.MAIL_USER}>`,
    to: buyerEmail,
    subject: `${sellerName} marked you as the buyer for "${listingTitle}"`,
    text: `Hi ${buyerName},\n\n${sellerName} has marked you as the buyer for "${listingTitle}" ($${listingPrice}).\n\nOpen ReLoop and go to your Profile → Pending tab to confirm or reject this.\n\n— ReLoop`,
  });
}

async function sendSellerConfirmation({ sellerEmail, sellerName, buyerName, listingTitle, confirmed }) {
  await transporter.sendMail({
    from: `"ReLoop" <${process.env.MAIL_USER}>`,
    to: sellerEmail,
    subject: `${buyerName} ${confirmed ? 'confirmed' : 'rejected'} the purchase of "${listingTitle}"`,
    text: `Hi ${sellerName},\n\n${buyerName} has ${confirmed ? 'confirmed' : 'rejected'} the purchase of "${listingTitle}".\n\n${confirmed ? 'The listing has been marked as Sold.' : 'The listing has been reverted to Available.'}\n\n— ReLoop`,
  });
}

module.exports = { sendBuyerNomination, sendSellerConfirmation };
