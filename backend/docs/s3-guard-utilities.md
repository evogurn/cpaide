# S3 Tenant Isolation Guard Utilities

## Overview
This document describes the reusable S3 tenant isolation guard utilities that provide consistent security validation across the application for upload, download, and background job operations.

## Core Functions

### 1. validateTenantOwnership(s3Key, tenantId)
Validates that an S3 key belongs to the specified tenant by checking the prefix.

```javascript
import s3Guard from '../utils/s3-guard.js';

const isValid = s3Guard.validateTenantOwnership(
  'tenants/tenant_123/documents/raw/doc_456/file.pdf', 
  'tenant_123'
);
// Returns: true

const isInvalid = s3Guard.validateTenantOwnership(
  'tenants/tenant_456/documents/raw/doc_456/file.pdf', 
  'tenant_123'
);
// Returns: false
```

### 2. validateS3KeyStructure(s3Key)
Validates that an S3 key follows the expected structure format.

```javascript
const isValid = s3Guard.validateS3KeyStructure(
  'tenants/tenant_123/documents/raw/doc_456/file.pdf'
);
// Returns: true

const isInvalid = s3Guard.validateS3KeyStructure('invalid/key/format');
// Returns: false
```

### 3. validateS3Key(s3Key, tenantId)
Combines tenant ownership and structure validation.

```javascript
const isValid = s3Guard.validateS3Key(
  'tenants/tenant_123/documents/raw/doc_456/file.pdf', 
  'tenant_123'
);
// Returns: true
```

### 4. guardS3Access(s3Key, tenantId, operation)
Throws an error if S3 key is not valid for the tenant (convenience method).

```javascript
try {
  s3Guard.guardS3Access(
    'tenants/tenant_123/documents/raw/doc_456/file.pdf', 
    'tenant_123',
    'download'
  );
  // Proceed with download
} catch (error) {
  // Handle unauthorized access
  console.error('Access denied:', error.message);
}
```

## Example Usage

### 1. In Upload Service
```javascript
import s3Guard from '../utils/s3-guard.js';

class DocumentUploadService {
  async uploadDocument(tenantId, documentId, fileData) {
    // Generate secure S3 key
    const s3Key = s3Guard.generateSecureS3Key(
      tenantId, 
      documentId, 
      fileData.filename, 
      'raw'
    );
    
    // Validate the generated key
    if (!s3Guard.validateS3Key(s3Key, tenantId)) {
      throw new Error('Invalid S3 key generated');
    }
    
    // Proceed with upload...
  }
}
```

### 2. In Download Service
```javascript
import s3Guard from '../utils/s3-guard.js';

class DocumentDownloadService {
  async downloadDocument(s3Key, tenantId) {
    // Guard access to the S3 key
    s3Guard.guardS3Access(s3Key, tenantId, 'download');
    
    // Proceed with download...
  }
}
```

### 3. In Background Jobs
```javascript
import s3Guard from '../utils/s3-guard.js';

class DocumentProcessingJob {
  async processDocument(s3Key, tenantId) {
    // Validate S3 key before processing
    if (!s3Guard.validateS3Key(s3Key, tenantId)) {
      logger.error('Invalid S3 key for tenant in processing job', { 
        s3Key, 
        tenantId 
      });
      return;
    }
    
    // Proceed with document processing...
  }
}
```

### 4. Bulk Operations
```javascript
import s3Guard from '../utils/s3-guard.js';

class BulkDocumentService {
  async processMultipleDocuments(s3Keys, tenantId) {
    // Filter to only valid keys for the tenant
    const validKeys = s3Guard.filterTenantS3Keys(s3Keys, tenantId);
    
    // Or validate all keys individually
    const validationResults = s3Guard.validateMultipleS3Keys(s3Keys, tenantId);
    
    // Process only valid keys...
  }
}
```

## Security Features

### 1. Directory Traversal Prevention
- Sanitizes S3 keys to prevent `../` or other traversal attempts
- Validates key structure to ensure proper format

### 2. Tenant Isolation Enforcement
- Validates that S3 keys belong to the correct tenant
- Uses both prefix validation and structure validation

### 3. Input Sanitization
- Sanitizes both S3 keys and tenant IDs to prevent injection
- Ensures only safe characters are allowed

### 4. Comprehensive Validation
- Validates tenant ownership
- Validates key structure
- Provides detailed logging for security events

## Integration Points

### 1. Upload Operations
Use `generateSecureS3Key()` and `validateS3Key()` to ensure secure key generation.

### 2. Download Operations
Use `guardS3Access()` to enforce access control before generating presigned URLs.

### 3. Background Jobs
Use `validateS3Key()` to validate keys before processing documents.

### 4. Administrative Functions
Use `filterTenantS3Keys()` for bulk operations that need to process tenant-specific files.

## Error Handling

The guard utilities provide consistent error handling:
- Returns `false` for validation failures
- Throws 403 errors with `guardS3Access()` method
- Provides detailed logging for security events
- Includes operation context in error messages

## Best Practices

1. Always validate S3 keys before using them in operations
2. Use `guardS3Access()` for direct user-facing operations
3. Use `validateS3Key()` for internal validations
4. Log all validation failures for security monitoring
5. Sanitize inputs before passing to S3 operations
6. Use the guard utilities consistently across all S3 operations