require('dotenv').config();

console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);
console.log('JWT_SECRET value:', process.env.JWT_SECRET || 'NOT SET');

if (!process.env.JWT_SECRET) {
  console.log('\n❌ JWT_SECRET is NOT being loaded from .env');
  console.log('Check:');
  console.log('1. .env file exists in backend folder');
  console.log('2. JWT_SECRET is spelled correctly');
  console.log('3. No spaces around the = sign');
  console.log('4. No quotes around the value');
}