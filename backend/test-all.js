const mongoose = require('mongoose');
require('dotenv').config();

const testUris = [
  { 
    name: 'Current .env', 
    uri: process.env.MONGODB_URI 
  },
  { 
    name: 'Local MongoDB', 
    uri: 'mongodb://localhost:27017/lostfound' 
  },
  { 
    name: 'Direct Connection', 
    uri: process.env.MONGODB_URI + '&directConnection=true' 
  }
];

async function testConnection(uri, name) {
  console.log(`\n📡 Testing ${name}...`);
  try {
    await mongoose.connect(uri, { 
      serverSelectionTimeoutMS: 10000,
      family: 4 
    });
    console.log(`✅ ${name} - Connected!`);
    await mongoose.disconnect();
    return true;
  } catch (err) {
    console.log(`❌ ${name} - Failed: ${err.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🔍 Testing MongoDB Connections...\n');
  let connected = false;
  
  for (const test of testUris) {
    if (test.uri) {
      const result = await testConnection(test.uri, test.name);
      if (result) {
        connected = true;
        console.log(`\n🎉 Working connection: ${test.name}`);
        console.log(`📝 Add this to your .env:\nMONGODB_URI=${test.uri}`);
        break;
      }
    }
  }
  
  if (!connected) {
    console.log('\n❌ No connection worked. Try installing MongoDB locally:');
    console.log('1. Download: https://www.mongodb.com/try/download/community');
    console.log('2. Install and start MongoDB');
    console.log('3. Use: MONGODB_URI=mongodb://localhost:27017/lostfound');
  }
}

runTests();