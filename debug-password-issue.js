import pkg from '@prisma/client';
import { hashPassword, comparePassword } from './backend/src/utils/bcrypt.js';

const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function debugPasswordIssue(email) {
  try {
    console.log(`🔍 Debugging password issue for user: ${email}`);
    
    // Find the user
    const user = await prisma.user.findFirst({
      where: {
        email: email,
        deletedAt: null
      },
      include: {
        tenant: true,
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('\n📋 User Details:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Name: ${user.firstName} ${user.lastName}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Status: ${user.status}`);
    console.log(`  Tenant: ${user.tenant?.name || 'None'}`);
    console.log(`  Roles: ${user.userRoles?.map(ur => ur.role?.name).join(', ') || 'None'}`);

    // Check password hash characteristics
    console.log('\n🔐 Password Analysis:');
    console.log(`  Password hash length: ${user.password?.length || 0}`);
    console.log(`  Password hash prefix: ${user.password?.substring(0, 10) || 'None'}`);
    console.log(`  Is bcrypt hash: ${user.password?.startsWith('$2b$') || user.password?.startsWith('$2a$') || user.password?.startsWith('$2y$') ? 'Yes' : 'No'}`);

    // Test password comparison with common passwords
    console.log('\n🧪 Password Comparison Tests:');
    
    const testPasswords = ['password123', 'admin123', 'user123', 'test1234', 'welcome123'];
    
    for (const testPass of testPasswords) {
      try {
        const isValid = await comparePassword(testPass, user.password);
        console.log(`  "${testPass}" -> ${isValid ? '✅ MATCHES' : '❌ DOES NOT MATCH'}`);
      } catch (err) {
        console.log(`  "${testPass}" -> ⚠️ Error: ${err.message}`);
      }
    }

    // Try to hash a new password and compare
    console.log('\n🔄 Hash Generation Test:');
    const newPassword = 'TestPass123!';
    const newHash = await hashPassword(newPassword);
    console.log(`  New password: ${newPassword}`);
    console.log(`  Generated hash: ${newHash.substring(0, 20)}...`);
    
    const newMatch = await comparePassword(newPassword, newHash);
    console.log(`  Self-comparison: ${newMatch ? '✅ MATCHES' : '❌ DOES NOT MATCH'}`);

    // Check if the stored hash works with the new password
    const reverseCheck = await comparePassword(newPassword, user.password);
    console.log(`  Stored hash vs new password: ${reverseCheck ? '✅ MATCHES' : '❌ DOES NOT MATCH'}`);

    console.log('\n📊 Summary:');
    console.log(`  User status: ${user.status}`);
    console.log(`  Tenant approval: ${user.tenant?.approvalStatus || 'N/A'}`);
    console.log(`  Last login: ${user.lastLoginAt || 'Never'}`);

  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument
const userEmail = process.argv[2];
if (!userEmail) {
  console.log('Usage: node debug-password-issue.js <user-email>');
  process.exit(1);
}

debugPasswordIssue(userEmail);