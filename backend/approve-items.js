const mongoose = require('mongoose');
require('dotenv').config();

async function approveItems() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Approve all lost items
    const lostResult = await db.collection('lostitems').updateMany(
      {},
      { $set: { isApproved: true } }
    );
    console.log(`✅ Approved ${lostResult.modifiedCount} lost items`);

    // Approve all found items
    const foundResult = await db.collection('founditems').updateMany(
      {},
      { $set: { isApproved: true } }
    );
    console.log(`✅ Approved ${foundResult.modifiedCount} found items`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

approveItems();