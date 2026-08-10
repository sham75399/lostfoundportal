require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('☁️ Testing Cloudinary Connection...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || '❌ Missing');
console.log('API Key:', process.env.CLOUDINARY_API_KEY || '❌ Missing');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Cloudinary credentials are missing!');
  console.log('Please add these to your .env file:');
  console.log('CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.log('CLOUDINARY_API_KEY=your_api_key');
  console.log('CLOUDINARY_API_SECRET=your_api_secret');
  process.exit(1);
}

// Test upload a small image
const testImage = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

console.log('📤 Uploading test image...');

cloudinary.uploader.upload_stream(
  { folder: 'lostfound/test' },
  (error, result) => {
    if (error) {
      console.error('❌ Cloudinary upload test failed:', error.message);
      process.exit(1);
    } else {
      console.log('✅ Cloudinary upload test successful!');
      console.log('Test image URL:', result.secure_url);
      process.exit(0);
    }
  }
).end(testImage);