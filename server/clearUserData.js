// clearUserData.js
const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = 'mongodb+srv://phillipandrewespina:Firiyuu77@cluster0.gvlsxm5.mongodb.net';
const DB_NAME = 'sage'; // Update if needed

async function clearUserData(emailOrAll) {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);

    if (emailOrAll.toLowerCase() === 'all') {
      // Clear data for ALL users
      console.log('Clearing data for ALL users...');
      
      // 1. Get all users first
      const allUsers = await db.collection('users').find({}).toArray();
      console.log(`Found ${allUsers.length} users total`);
      
      // 2. Clear all user-related data (collections that reference userId)
      const deleteResults = await Promise.all([
        db.collection('children').deleteMany({}),
        db.collection('policies').deleteMany({}),
        db.collection('projections').deleteMany({}),
        db.collection('cashvalues').deleteMany({}),
        db.collection('clients').deleteMany({}),
        db.collection('agent_client_relationships').deleteMany({}),
        db.collection('client_referrals').deleteMany({}),
        db.collection('policy_cash_values').deleteMany({}),
      ]);
      // Remove all agents explicitly
      const agentsDeleteResult = await db.collection('agents').deleteMany({});
      
      console.log('Deleted records:');
      console.log(`- Children: ${deleteResults[0].deletedCount}`);
      console.log(`- Policies: ${deleteResults[1].deletedCount}`);
      console.log(`- Projections: ${deleteResults[2].deletedCount}`);
      console.log(`- Cash Values: ${deleteResults[3].deletedCount}`);
      console.log(`- Clients: ${deleteResults[4].deletedCount}`);
      console.log(`- Agent Client Relationships: ${deleteResults[5].deletedCount}`);
      console.log(`- Client Referrals: ${deleteResults[6].deletedCount}`);
      console.log(`- Policy Cash Values: ${deleteResults[7].deletedCount}`);
      console.log(`- Agents: ${agentsDeleteResult.deletedCount}`);
      
      // 3. Clear profile fields for all users while keeping login credentials
      const updateResult = await db.collection('users').updateMany(
        {}, // Update all users
        {
          $unset: {
            profile: "",
            settings: "",
            firstName: "",
            lastName: "",
            phoneNumber: "",
            workNumber: "",
            businessName: "",
            businessAddress: "",
            businessCity: "",
            businessState: "",
            businessZip: "",
            licenseNumber: "",
            agentId: "",
            createdAt: "",
            updatedAt: "",
            // Add other fields to clear except login fields (email, password, etc.)
          }
        }
      );
      
      console.log(`Updated ${updateResult.modifiedCount} user profiles`);
      console.log('Cleared data for ALL users while preserving login credentials');
      
    } else {
      // Clear data for a specific user
      const user = await db.collection('users').findOne({ email: emailOrAll });
      if (!user) {
        console.log(`User not found: ${emailOrAll}`);
        return;
      }
      const userId = user._id;

      // 2. Remove all data except login info for specific user
      const deleteResults = await Promise.all([
        db.collection('children').deleteMany({ userId }),
        db.collection('policies').deleteMany({ userId }),
        db.collection('projections').deleteMany({ userId }),
        db.collection('cashvalues').deleteMany({ userId }),
        db.collection('clients').deleteMany({ userId }),
        db.collection('agent_client_relationships').deleteMany({ userId }),
        db.collection('client_referrals').deleteMany({ userId }),
        db.collection('policy_cash_values').deleteMany({ userId })
      ]);
      // Remove agent record for this user (by userId or email)
      const agentDeleteResult = await db.collection('agents').deleteMany({ $or: [ { userId: userId }, { email: user.email } ] });
      console.log(`- Agents: ${agentDeleteResult.deletedCount}`);
      
      console.log(`Deleted records for ${emailOrAll}:`);
      console.log(`- Children: ${deleteResults[0].deletedCount}`);
      console.log(`- Policies: ${deleteResults[1].deletedCount}`);
      console.log(`- Projections: ${deleteResults[2].deletedCount}`);
      console.log(`- Cash Values: ${deleteResults[3].deletedCount}`);
      console.log(`- Clients: ${deleteResults[4].deletedCount}`);
      console.log(`- Agent Client Relationships: ${deleteResults[5].deletedCount}`);
      console.log(`- Client Referrals: ${deleteResults[6].deletedCount}`);
      console.log(`- Policy Cash Values: ${deleteResults[7].deletedCount}`);

      // 3. Clear profile fields in the user document except login
      await db.collection('users').updateOne(
        { _id: userId },
        {
          $unset: {
            profile: "",
            settings: "",
            firstName: "",
            lastName: "",
            phoneNumber: "",
            workNumber: "",
            businessName: "",
            businessAddress: "",
            businessCity: "",
            businessState: "",
            businessZip: "",
            licenseNumber: "",
            agentId: "",
            createdAt: "",
            updatedAt: "",
            // Add other fields to clear except login fields
          }
        }
      );

      console.log(`Cleared data for user: ${emailOrAll}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

// Usage: node clearUserData.js user@example.com OR node clearUserData.js all
if (require.main === module) {
  const emailOrAll = process.argv[2];
  if (!emailOrAll) {
    console.error('Usage: node clearUserData.js user@example.com OR node clearUserData.js all');
    process.exit(1);
  }
  clearUserData(emailOrAll);
}