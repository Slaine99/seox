// Test script for client invitation system
require('dotenv').config();
const mongoose = require('mongoose');
const { sendClientInvitation } = require('./utils/clientInvitation');

// Mock SEO account data
const mockSeoAccount = {
  _id: new mongoose.Types.ObjectId(),
  accountName: 'Test Company SEO',
  domain: 'testcompany.com',
  niche: 'Technology',
  contactEmail: 'test@example.com'
};

async function testClientInvitation() {
  try {
    console.log('Testing client invitation system...');
    console.log('Mock SEO Account:', mockSeoAccount);
    
    // Test the invitation function
    const result = await sendClientInvitation('test@example.com', mockSeoAccount);
    
    if (result) {
      console.log('✅ Client invitation sent successfully!');
    } else {
      console.log('❌ Client invitation failed');
    }
  } catch (error) {
    console.error('❌ Error testing client invitation:', error);
  }
}

// Run the test
console.log('Starting test...');
testClientInvitation();
