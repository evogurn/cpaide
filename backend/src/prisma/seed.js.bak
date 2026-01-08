import prisma from '../config/db.js';
import { hashPassword } from '../utils/bcrypt.js';
import { logger } from '../config/logger.js';

/**
 * Seed database with initial data
 */
async function seed() {
  try {
    logger.info('🌱 Starting database seed...');

    // Create roles
    logger.info('Creating roles...');
    const roles = await Promise.all([
      prisma.role.upsert({
        where: { name: 'SUPER_ADMIN' },
        update: {},
        create: {
          name: 'SUPER_ADMIN',
          description: 'Super administrator with full system access',
          isSystem: true,
        },
      }),
      prisma.role.upsert({
        where: { name: 'TENANT_ADMIN' },
        update: {},
        create: {
          name: 'TENANT_ADMIN',
          description: 'Tenant administrator with full tenant access',
          isSystem: true,
        },
      }),
      prisma.role.upsert({
        where: { name: 'USER' },
        update: {},
        create: {
          name: 'USER',
          description: 'Regular user with standard permissions',
          isSystem: true,
        },
      }),
      prisma.role.upsert({
        where: { name: 'VIEWER' },
        update: {},
        create: {
          name: 'VIEWER',
          description: 'Read-only access',
          isSystem: true,
        },
      }),
    ]);

    logger.info(`✅ Created ${roles.length} roles`);

    // Create permissions
    logger.info('Creating permissions...');
    const permissionData = [
      // Document permissions
      { name: 'document:create', resource: 'document', action: 'create' },
      { name: 'document:read', resource: 'document', action: 'read' },
      { name: 'document:update', resource: 'document', action: 'update' },
      { name: 'document:delete', resource: 'document', action: 'delete' },
      { name: 'document:share', resource: 'document', action: 'share' },
      
      // Folder permissions
      { name: 'folder:create', resource: 'folder', action: 'create' },
      { name: 'folder:read', resource: 'folder', action: 'read' },
      { name: 'folder:update', resource: 'folder', action: 'update' },
      { name: 'folder:delete', resource: 'folder', action: 'delete' },
      { name: 'folder:manage_permissions', resource: 'folder', action: 'manage_permissions' },
      
      // User permissions
      { name: 'user:create', resource: 'user', action: 'create' },
      { name: 'user:read', resource: 'user', action: 'read' },
      { name: 'user:update', resource: 'user', action: 'update' },
      { name: 'user:delete', resource: 'user', action: 'delete' },
      
      // Tenant permissions
      { name: 'tenant:manage', resource: 'tenant', action: 'manage' },
      { name: 'tenant:settings', resource: 'tenant', action: 'settings' },
      
      // AI permissions
      { name: 'ai:query', resource: 'ai', action: 'query' },
      { name: 'ai:manage', resource: 'ai', action: 'manage' },
    ];

    const permissions = await Promise.all(
      permissionData.map(p =>
        prisma.permission.upsert({
          where: { name: p.name },
          update: {},
          create: p,
        })
      )
    );

    logger.info(`✅ Created ${permissions.length} permissions`);

    // Assign permissions to roles
    logger.info('Assigning permissions to roles...');
    
    const superAdminRole = roles.find(r => r.name === 'SUPER_ADMIN');
    const tenantAdminRole = roles.find(r => r.name === 'TENANT_ADMIN');
    const userRole = roles.find(r => r.name === 'USER');
    const viewerRole = roles.find(r => r.name === 'VIEWER');

    // Super Admin - all permissions
    await Promise.all(
      permissions.map(p =>
        prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: superAdminRole.id,
              permissionId: p.id,
            },
          },
          update: {},
          create: {
            roleId: superAdminRole.id,
            permissionId: p.id,
          },
        })
      )
    );

    // Tenant Admin - all except system tenant management
    const tenantAdminPerms = permissions.filter(p => !p.name.startsWith('tenant:'));
    await Promise.all(
      tenantAdminPerms.map(p =>
        prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: tenantAdminRole.id,
              permissionId: p.id,
            },
          },
          update: {},
          create: {
            roleId: tenantAdminRole.id,
            permissionId: p.id,
          },
        })
      )
    );

    // User - document and folder operations + AI query
    const userPerms = permissions.filter(p =>
      p.name.startsWith('document:') || 
      p.name.startsWith('folder:') ||
      p.name === 'ai:query'
    );
    await Promise.all(
      userPerms.map(p =>
        prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: userRole.id,
              permissionId: p.id,
            },
          },
          update: {},
          create: {
            roleId: userRole.id,
            permissionId: p.id,
          },
        })
      )
    );

    // Viewer - read-only
    const viewerPerms = permissions.filter(p => p.action === 'read' || p.name === 'ai:query');
    await Promise.all(
      viewerPerms.map(p =>
        prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: viewerRole.id,
              permissionId: p.id,
            },
          },
          update: {},
          create: {
            roleId: viewerRole.id,
            permissionId: p.id,
          },
        })
      )
    );

    logger.info('✅ Assigned permissions to roles');

    // Create sample tenant
    logger.info('Creating sample tenant...');
    const tenant = await prisma.tenant.upsert({
      where: { subdomain: 'demo' },
      update: {},
      create: {
        name: 'Demo Organization',
        subdomain: 'demo',
        status: 'ACTIVE',
        settings: {
          maxUsers: 50,
          maxStorage: 10737418240, // 10GB
        },
      },
    });

    logger.info('✅ Created sample tenant');

    // Create sample admin user
    logger.info('Creating sample admin user...');
    const hashedPassword = await hashPassword('Admin@123');
    const adminUser = await prisma.user.upsert({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: 'admin@demo.com',
        },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        email: 'admin@demo.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        status: 'ACTIVE',
        emailVerified: true,
      },
    });

    // Assign TENANT_ADMIN role to admin user
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: tenantAdminRole.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: tenantAdminRole.id,
      },
    });

    logger.info('✅ Created admin user: admin@demo.com / Admin@123');

    // Create subscription plans
    logger.info('Creating subscription plans...');
    await Promise.all([
      prisma.subscriptionPlan.upsert({
        where: { name: 'free' },
        update: {},
        create: {
          name: 'free',
          displayName: 'Free Plan',
          description: 'Basic features for individuals',
          price: 0,
          currency: 'USD',
          interval: 'MONTHLY',
          features: {
            maxUsers: 1,
            maxDocuments: 100,
            maxStorage: 1073741824, // 1GB
            aiQueries: 50,
          },
          limits: {
            maxUsers: 1,
            maxDocuments: 100,
            maxStorage: 1073741824,
          },
          isActive: true,
        },
      }),
      prisma.subscriptionPlan.upsert({
        where: { name: 'pro' },
        update: {},
        create: {
          name: 'pro',
          displayName: 'Professional Plan',
          description: 'Advanced features for teams',
          price: 29.99,
          currency: 'USD',
          interval: 'MONTHLY',
          features: {
            maxUsers: 10,
            maxDocuments: 5000,
            maxStorage: 53687091200, // 50GB
            aiQueries: 1000,
          },
          limits: {
            maxUsers: 10,
            maxDocuments: 5000,
            maxStorage: 53687091200,
          },
          isActive: true,
        },
      }),
      prisma.subscriptionPlan.upsert({
        where: { name: 'enterprise' },
        update: {},
        create: {
          name: 'enterprise',
          displayName: 'Enterprise Plan',
          description: 'Unlimited features for large organizations',
          price: 99.99,
          currency: 'USD',
          interval: 'MONTHLY',
          features: {
            maxUsers: -1, // unlimited
            maxDocuments: -1,
            maxStorage: -1,
            aiQueries: -1,
          },
          limits: {
            maxUsers: -1,
            maxDocuments: -1,
            maxStorage: -1,
          },
          isActive: true,
        },
      }),
    ]);

    logger.info('✅ Created subscription plans');

    logger.info('🎉 Database seeding completed successfully!');
  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed
seed();
