const sendEmail = require('./sendEmail');
const crypto = require('crypto');
const { Token } = require('../models/tokenModel');

const sendClientInvitation = async (contactEmail, seoAccount) => {
  try {
    console.log('Sending client invitation for SEO account:', seoAccount.accountName);
    console.log('Contact email:', contactEmail);
    
    if (!contactEmail) {
      console.log('No contact email provided for SEO account:', seoAccount.accountName);
      return false;
    }

    // Generate a secure invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    
    // Create a token record for the invitation
    const tokenRecord = new Token({
      userId: null, // Will be set when user registers
      token: invitationToken,
      type: 'client_invitation',
      seoAccountId: seoAccount._id,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    await tokenRecord.save();
    console.log('Invitation token created:', invitationToken);

    // Create registration link
    const clientURL = process.env.CLIENT_URL || "http://localhost:5174";
    const registrationLink = `${clientURL}/client/register/${invitationToken}`;
    console.log('Registration link:', registrationLink);

    // Prepare email payload
    const emailPayload = {
      inviterName: 'SEO Team',
      inviterCompany: 'SEO Agency',
      accountName: seoAccount.accountName,
      domain: seoAccount.domain,
      niche: seoAccount.niche,
      registrationLink: registrationLink,
      contactEmail: contactEmail
    };

    console.log('Email payload:', emailPayload);

    // Send the invitation email
    await sendEmail(
      contactEmail,
      `🚀 You're invited to access your SEO dashboard for ${seoAccount.domain}`,
      emailPayload,
      'clientInvite.handlebars'
    );

    console.log('Client invitation sent successfully to:', contactEmail);
    return true;
  } catch (error) {
    console.error('Error sending client invitation:', error);
    throw error;
  }
};

module.exports = {
  sendClientInvitation
};
