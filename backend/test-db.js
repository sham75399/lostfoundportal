const mongoose = require('mongoose');
require('dotenv').config();

console.log('📡 Testing MongoDB Connection...');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connection Successful!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection Failed:');
    console.error('Error:', err.message);
    process.exit(1);
  });