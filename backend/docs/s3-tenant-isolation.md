# S3 Tenant Isolation for Multi-Tenant RAG System

## Overview
This document describes the S3 bucket structure and tenant isolation implementation for the multi-tenant RAG system in CPAide.

## Bucket Name Pattern
```
cpaide-documents-{env}-{region}
# Examples:
# - cpaide-documents-dev-us-east-1
# - cpaide-documents-prod-us-west-2
```

## S3 Folder (Prefix) Hierarchy
```
tenants/
├── {tenant_id}/
    ├── documents/
    │   ├── raw/
    │   │   └── {document_id}/
    │   │       ├── {filename}
    │   │       └── metadata.json
    │   ├── extracted/
    │   │   └── {document_id}/
    │   │       └── {filename}.txt
    │   ├── chunks/
    │   │   └── {document_id}/
    │   │       ├── chunk_{chunk_id}.json
    │   │       └── index.json
    │   └── embeddings/
    │       └── {document_id}/
    │           ├── embedding_{chunk_id}.json
    │           └── vector_index.json
    ├── ai_models/
    │   └── custom_embeddings/
    │       └── {model_id}/
    │           └── model.bin
    └── metadata/
        ├── documents.json
        ├── processing_jobs.json
        └── audit_logs.json
```

## Security Implementation

### 1. Application-Level Isolation
- All S3 operations validate that the storage key belongs to the authenticated tenant
- Critical security check: `validateTenantAccess()` method ensures storage keys start with correct tenant prefix
- Tenant ID is extracted from JWT token and used for validation
- Frontend never accesses S3 directly - all operations go through backend

### 2. IAM-Level Isolation
The following IAM policy should be attached to the application role to enforce tenant isolation at the IAM level:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:CopyObject"
      ],
      "Resource": "arn:aws:s3:::${bucket-name}/tenants/${aws:userid}/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::${bucket-name}",
      "Condition": {
        "StringLike": {
          "s3:prefix": "tenants/${aws:userid}/*"
        }
      }
    }
  ]
}
```

## Code Implementation

### Storage Key Generation
The `getStorageKey()` utility function generates tenant-specific S3 paths:

```javascript
export const getStorageKey = (tenantId, filename, documentId, fileType = 'raw') => {
  // Map file types to their appropriate S3 paths
  const filePaths = {
    raw: `tenants/${tenantId}/documents/raw/${documentId}/${filename}`,
    extracted: `tenants/${tenantId}/documents/extracted/${documentId}/${filename}.txt`,
    chunk: `tenants/${tenantId}/documents/chunks/${documentId}/chunk_${Date.now()}.json`,
    embedding: `tenants/${tenantId}/documents/embeddings/${documentId}/embedding_${Date.now()}.json`,
    metadata: `tenants/${tenantId}/documents/raw/${documentId}/metadata.json`
  };
  
  return filePaths[fileType] || filePaths.raw;
};
```

### Tenant Validation
The `validateTenantAccess()` method in the file service ensures security:

```javascript
validateTenantAccess(storageKey, tenantId) {
  // Ensure the storage key starts with the correct tenant prefix
  const expectedPrefix = `tenants/${tenantId}/`;
  if (!storageKey.startsWith(expectedPrefix)) {
    logger.error('Tenant access violation attempt', { storageKey, tenantId });
    const error = new Error('Unauthorized access to storage key');
    error.statusCode = 403;
    throw error;
  }
  
  // Additional validation: ensure storage key follows expected format
  const parts = storageKey.split('/');
  if (parts.length < 4 || parts[2] !== 'documents') {
    logger.error('Invalid storage key format', { storageKey, tenantId });
    const error = new Error('Invalid storage key format');
    error.statusCode = 400;
    throw error;
  }
}
```

## RAG Processing Flow

### 1. Document Upload
- Raw documents stored in: `tenants/{tenantId}/documents/raw/{documentId}/{filename}`
- Document metadata stored in: `tenants/{tenantId}/documents/raw/{documentId}/metadata.json`

### 2. Text Extraction
- Extracted text stored in: `tenants/{tenantId}/documents/extracted/{documentId}/{filename}.txt`

### 3. Document Chunking
- Chunks stored in: `tenants/{tenantId}/documents/chunks/{documentId}/chunk_{chunk_id}.json`
- Chunk index stored in: `tenants/{tenantId}/documents/chunks/{documentId}/index.json`

### 4. Embedding Generation
- Embeddings stored in: `tenants/{tenantId}/documents/embeddings/{documentId}/embedding_{chunk_id}.json`
- Vector index stored in: `tenants/{tenantId}/documents/embeddings/{documentId}/vector_index.json`

## Benefits of This Structure

### 1. Security
- Clear tenant boundaries prevent cross-tenant access
- Multiple layers of validation (application + IAM)
- Audit-friendly structure

### 2. Scalability
- Hierarchical structure supports millions of documents
- Efficient prefix-based listing operations
- Parallel processing capabilities

### 3. Maintainability
- Clear separation of concerns
- Consistent naming conventions
- Easy to implement tenant deletion

### 4. Auditability
- All tenant data in single prefix
- Easy to track document lifecycle
- Simplified compliance reporting

## Tenant Deletion

When a tenant is deleted, the entire prefix `tenants/{tenantId}/` can be removed efficiently using S3 batch operations, ensuring complete data isolation and compliance with data retention policies.