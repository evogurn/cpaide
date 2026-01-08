# Safe Tenant Deletion Workflow for S3

## Overview
This document outlines the safe tenant deletion workflow for S3 in a prefix-isolated multi-tenant setup. The workflow ensures that only the specified tenant's data is deleted without impacting other tenants.

## Deletion Steps

### 1. Pre-Deletion Validation
- Validate tenant ID format and existence in the database
- Verify tenant has no active users (optional, configurable)
- Validate S3 prefix format to prevent injection attacks

### 2. Object Listing
- List all S3 objects under the tenant prefix: `tenants/{tenantId}/`
- Use continuation tokens for large datasets
- Validate that all objects belong to the correct tenant

### 3. Batch Deletion
- Delete objects in batches of 1000 (S3 DeleteObjects limit)
- Process each batch and log results
- Continue with remaining batches even if some fail

### 4. Verification
- List objects again to verify deletion
- Confirm no objects remain under the tenant prefix
- Log verification results

### 5. Audit Logging
- Record deletion in audit logs
- Include count of deleted objects
- Capture deletion timestamp and operator

## Sample Code

```javascript
import tenantDeletionService from '../services/tenant-deletion.service.js';

// Delete S3 data for a tenant
try {
  const result = await tenantDeletionService.deleteTenantS3Data('tenant_123');
  console.log(`Deleted ${result.deletedCount} objects for tenant`);
} catch (error) {
  console.error('Tenant deletion failed:', error.message);
}

// Complete tenant deletion (S3 + database)
try {
  const result = await tenantDeletionService.deleteTenantComplete('tenant_123', false);
  console.log('Tenant deletion completed:', result);
} catch (error) {
  console.error('Complete tenant deletion failed:', error.message);
}
```

## Safety Checks

### 1. Input Validation
- Sanitize tenant ID to prevent path traversal
- Validate tenant exists in database before deletion
- Confirm S3 prefix format is valid

### 2. Tenant Isolation
- Use `s3Guard.filterTenantS3Keys()` to ensure only tenant's objects are processed
- Verify all objects belong to the correct tenant before deletion
- Never perform bucket-wide operations

### 3. Batch Processing
- Delete objects in batches of 1000 to stay within S3 limits
- Continue processing if individual batches fail
- Log errors without stopping the entire process

### 4. Verification
- Verify deletion by listing objects after deletion
- Confirm no objects remain under tenant prefix
- Fail if verification shows remaining objects

## Risks and Mitigations

### 1. Cross-Tenant Data Deletion Risk
**Risk**: Accidentally deleting data from other tenants
**Mitigation**: 
- Use S3 guard utilities to validate object keys
- Verify all objects belong to the target tenant
- Use specific prefixes for all operations

### 2. Incomplete Deletion Risk
**Risk**: Some objects not deleted due to errors
**Mitigation**:
- Implement verification step after deletion
- Log all deletion results
- Retry failed batches if possible

### 3. Performance Risk
**Risk**: Deletion taking too long for large tenants
**Mitigation**:
- Process objects in batches
- Use continuation tokens for large listings
- Implement progress tracking

### 4. Data Loss Risk
**Risk**: Accidental deletion of important data
**Mitigation**:
- Require confirmation before deletion
- Implement soft deletion period (configurable)
- Log all deletion activities for audit

### 5. Race Condition Risk
**Risk**: New objects created during deletion
**Mitigation**:
- Deactivate tenant before deletion
- Implement locking mechanism if needed
- Verify no new objects exist after deletion

## Audit and Logging Considerations

### 1. Audit Trail
- Log all deletion requests with tenant ID and timestamp
- Record number of objects deleted
- Capture operator information (system or user)

### 2. Error Logging
- Log all errors during deletion process
- Include tenant ID and object keys in error logs
- Track partial failures and retries

### 3. Compliance Logging
- Maintain logs for compliance requirements
- Include verification results
- Record successful and failed deletion attempts

## Integration Points

### 1. Database Integration
- Validate tenant exists before S3 deletion
- Update tenant status in database
- Coordinate with database deletion process

### 2. Notification System
- Notify tenant administrators before deletion
- Send completion notifications
- Alert on deletion failures

### 3. Backup Systems
- Coordinate with backup systems if applicable
- Ensure deleted data is also removed from backups
- Handle retention policy requirements

This workflow ensures safe, isolated tenant deletion while maintaining system integrity and compliance requirements.