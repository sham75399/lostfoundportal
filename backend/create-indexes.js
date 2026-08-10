const mongoose = require('mongoose');
require('dotenv').config();

async function createIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Create text indexes for lost items
    await db.collection('lostitems').createIndex(
      { title: "text", description: "text" },
      { name: "text_search" }
    );
    console.log('✅ Created text index on lostitems');

    // Create text indexes for found items
    await db.collection('founditems').createIndex(
      { title: "text", description: "text" },
      { name: "text_search" }
    );
    console.log('✅ Created text index on founditems');

    console.log('✅ All indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  }
}

createIndexes();