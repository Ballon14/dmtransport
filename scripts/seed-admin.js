import connectDB from '../lib/mongodb.js';
import User from '../lib/models/User.js';

const adminEmails = [
  'iqbal140605@gmail.com',
  'dmtransportpwr@gmail.com',
];

async function seedAdmins() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    for (const email of adminEmails) {
      // Check if user exists
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        // Update to admin
        await User.updateOne({ email }, { $set: { role: 'admin' } });
        console.log(`✅ Updated ${email} to admin`);
      } else {
        // Create new admin user
        await User.create({
          clerkId: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          email: email,
          name: email.split('@')[0],
          role: 'admin',
        });
        console.log(`✅ Created admin user: ${email}`);
      }
    }

    console.log('\n🎉 Done! Admin users created/updated.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedAdmins();
