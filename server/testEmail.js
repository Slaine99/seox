// Simple email test script
require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

async function testEmail() {
  console.log('Testing email system...');
  
  try {
    // Test with a simple email
    const result = await sendEmail(
      'test@example.com',
      'Test Email from SEO-X',
      {
        name: 'Test User',
        message: 'This is a test email'
      },
      'verifyEmail.handlebars' // Use existing template for testing
    );
    
    console.log('✅ Email test successful!');
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    // Check common issues
    if (error.message.includes('ENOTFOUND')) {
      console.log('📧 Check your SMTP host configuration (HOST env variable)');
    }
    if (error.message.includes('authentication failed') || error.message.includes('Invalid login')) {
      console.log('🔐 Check your SMTP credentials (SMTP_USER, SMTP_PASS env variables)');
    }
    if (error.message.includes('ENOENT') && error.message.includes('template')) {
      console.log('📄 Check if email template exists in template/ folder');
    }
  }
}

// Display current SMTP configuration (without showing sensitive data)
console.log('Current SMTP Configuration:');
console.log('HOST:', process.env.HOST || 'NOT SET');
console.log('PORT: 2525');
console.log('SMTP_USER:', process.env.SMTP_USER ? '***SET***' : 'NOT SET');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***SET***' : 'NOT SET');
console.log('SMTP_USER_EMAIL:', process.env.SMTP_USER_EMAIL || 'NOT SET');
console.log('CLIENT_URL:', process.env.CLIENT_URL || 'NOT SET');
console.log('---');

testEmail();
