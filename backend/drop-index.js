const mongoose = require('mongoose');
require('dotenv').config();

async function dropIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Drop the username index
    try {
      await db.collection('users').dropIndex('username_1');
      console.log('✅ Dropped username_1 index');
    } catch (error) {
      console.log('Index may not exist:', error.message);
    }

    // Try dropping by key
    try {
      await db.collection('users').dropIndex({ username: 1 });
      console.log('✅ Dropped username index by key');
    } catch (error) {
      console.log('Index may not exist:', error.message);
    }

    console.log('✅ All indexes dropped successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

dropIndex();