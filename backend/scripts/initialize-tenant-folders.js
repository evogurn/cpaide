#!/usr/bin/env node

/**
 * Script to initialize folder structure for existing tenants
 * 
 * This script can be used to initialize the folder structure for tenants
 * that were created before the folder initialization feature was implemented,
 * or for tenants where the folder structure was accidentally deleted.
 */

// Note: We're not importing PrismaClient directly since we want to use the same
// instance that's configured in our application
import tenantService from '../src/services/tenant.service.js';

// We'll use the prisma instance from the tenant service
// This ensures we're using the same database configuration

async function initializeTenantFolders(tenantId) {
  try {
    console.log(`Initializing folders for tenant: ${tenantId}`);
    
    // Initialize folders for the tenant
    const initialized = await tenantService.initializeFoldersForExistingTenant(tenantId);
    
    if (initialized) {
      console.log(`Successfully initialized folders for tenant: ${tenantId}`);
    } else {
      console.log(`Folders already exist for tenant: ${tenantId}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error initializing folders for tenant ${tenantId}:`, error.message);
    return false;
  }
}

async function initializeAllTenants() {
  try {
    console.log('Initializing folders for all tenants...');
    
    // Import prisma here to avoid issues with ES modules
    const { default: prisma } = await import('../src/config/db.js');
    
    // Get all tenants
    const tenants = await prisma.tenant.findMany({
      where: { deletedAt: null }
    });
    
    console.log(`Found ${tenants.length} tenants`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const tenant of tenants) {
      try {
        console.log(`\nProcessing tenant: ${tenant.name} (${tenant.id})`);
        const initialized = await tenantService.initializeFoldersForExistingTenant(tenant.id);
        
        if (initialized) {
          console.log(`✓ Initialized folders for tenant: ${tenant.name}`);
          successCount++;
        } else {
          console.log(`- Folders already exist for tenant: ${tenant.name}`);
        }
      } catch (error) {
        console.error(`✗ Error initializing folders for tenant ${tenant.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\nSummary:`);
    console.log(`- Successfully initialized: ${successCount}`);
    console.log(`- Already had folders: ${tenants.length - successCount - errorCount}`);
    console.log(`- Errors: ${errorCount}`);
    
  } catch (error) {
    console.error('Error initializing folders for all tenants:', error.message);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  npm run init-tenant-folders --all          # Initialize folders for all tenants');
    console.log('  npm run init-tenant-folders <tenant-id>    # Initialize folders for specific tenant');
    console.log('');
    console.log('Examples:');
    console.log('  npm run init-tenant-folders --all');
    console.log('  npm run init-tenant-folders 123e4567-e89b-12d3-a456-426614174000');
    return;
  }
  
  if (args[0] === '--all') {
    await initializeAllTenants();
  } else {
    const tenantId = args[0];
    await initializeTenantFolders(tenantId);
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});