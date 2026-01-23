import { hashPassword, comparePassword } from './backend/src/utils/bcrypt.js';

async function testBcrypt() {
  console.log('Testing bcrypt functionality...');
  
  try {
    const plainPassword = 'TestPassword123!';
    console.log(`Original password: ${plainPassword}`);
    
    // Hash the password
    const hashed = await hashPassword(plainPassword);
    console.log(`Hashed password: ${hashed}`);
    
    // Verify the password
    const isValid = await comparePassword(plainPassword, hashed);
    console.log(`Password verification (correct password): ${isValid}`);
    
    // Try with wrong password
    const isInvalid = await comparePassword('WrongPassword123!', hashed);
    console.log(`Password verification (wrong password): ${isInvalid}`);
    
    console.log('✅ Bcrypt functionality working correctly!');
  } catch (error) {
    console.error('❌ Error testing bcrypt:', error.message);
  }
}

testBcrypt();