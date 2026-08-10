const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testRegister() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Test user data
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      phone: '1234567890'
    };

    console.log('📝 Testing registration with:', testUser);

    // Check if user exists
    const existingUser = await db.collection('users').findOne({ email: testUser.email });
    if (existingUser) {
      console.log('⚠️ User already exists, deleting...');
      await db.collection('users').deleteOne({ email: testUser.email });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testUser.password, salt);

    // Create user
    const result = await db.collection('users').insertOne({
      name: testUser.name,
      email: testUser.email,
      password: hashedPassword,
      phone: testUser.phone,
      role: 'user',
      isVerified: false,
      createdAt: new Date()
    });

    console.log('✅ User created with ID:', result.insertedId);

    // Verify user was created
    const savedUser = await db.collection('users').findOne({ email: testUser.email });
    console.log('✅ User found in database:', savedUser);

    console.log('✅ Test successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testRegister();