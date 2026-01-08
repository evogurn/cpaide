# RAG Ingestion Pipeline Tenant Safety

## Overview
This document explains the tenant isolation measures implemented in the RAG ingestion pipeline to ensure that each tenant's documents are processed securely and without cross-tenant access.

## Tenant Safety Architecture

### 1. S3 Access Isolation
The RAG ingestion pipeline enforces tenant isolation at multiple levels:

#### A. S3 Key Validation
Every S3 operation validates that the key belongs to the correct tenant:
- Uses `s3Guard.validateS3Key()` to ensure S3 keys follow the format: `tenants/{tenantId}/documents/...`
- Prevents access to S3 objects outside the tenant's designated prefix
- Blocks any attempt to access documents from other tenants

#### B. Tenant-Specific Prefixes
When listing or processing documents, the pipeline uses tenant-specific prefixes:
```javascript
const prefix = `tenants/${tenantId}/documents/raw/`;
```
This ensures no bucket-wide scans occur, and only the tenant's documents are accessed.

### 2. Database Integration
The pipeline integrates with the database to maintain tenant context:
- All document queries are scoped by `tenantId`
- Cross-validation between database records and S3 keys
- Document status updates are tenant-isolated

### 3. Vector Database Metadata
Embeddings are stored with tenant metadata to maintain isolation:
```javascript
metadata: {
  tenantId,
  documentId,
  chunkIndex: i,
  text: chunk.text,
  source: s3Key,
}
```

## Pipeline Flow with Tenant Safety

### 1. Single Document Processing
```javascript
async processDocument(s3Key, tenantId, documentId) {
  // Tenant Safety Check 1: Validate S3 key belongs to tenant
  if (!s3Guard.validateS3Key(s3Key, tenantId)) {
    return false; // Deny access
  }
  
  // Fetch document from S3 (tenant-safe)
  const documentBuffer = await this.fetchDocumentFromS3(s3Key);
  
  // Process document...
  
  // Store embeddings with tenant metadata
  await vectorStore.storeEmbedding({
    // ...embedding data...
    metadata: {
      tenantId, // Critical: tenant context preserved
      documentId,
      // ...other metadata
    },
  });
}
```

### 2. Bulk Tenant Processing
```javascript
async processAllTenantDocuments(tenantId) {
  // Tenant Safety Check: Query only tenant's documents
  const documents = await prisma.document.findMany({
    where: { tenantId, /* other conditions */ },
    // No cross-tenant access possible
  });
  
  for (const document of documents) {
    // Additional safety: validate each document's S3 key
    if (document.storageKey && s3Guard.validateS3Key(document.storageKey, tenantId)) {
      await this.processDocument(document.storageKey, tenantId, document.id);
    }
  }
}
```

### 3. Background Job Isolation
The background job processes tenants separately:
```javascript
async processPendingDocuments() {
  // Get tenants with pending documents
  const tenantsWithPendingDocs = await prisma.document.groupBy({
    by: ['tenantId'], // Group by tenant, not cross-tenant
    where: { status: { in: ['PENDING', 'EXTRACTED'] } },
  });

  // Process each tenant separately
  for (const tenantGroup of tenantsWithPendingDocs) {
    const { tenantId } = tenantGroup;
    await ragIngestionService.processAllTenantDocuments(tenantId); // Isolated processing
  }
}
```

## Tenant Safety Measures

### 1. No Bucket-Wide Scans
- The pipeline never performs operations that scan the entire S3 bucket
- All S3 operations use tenant-specific prefixes
- `ListObjectsV2Command` is always called with tenant-scoped prefixes

### 2. Cross-Tenant Access Prevention
- Every operation validates tenant ownership of S3 keys
- Database queries are always scoped by tenant ID
- Vector store operations include tenant metadata

### 3. Tenant Context Propagation
- Tenant ID is passed through the entire pipeline
- All operations maintain tenant context
- No operations rely on global or cross-tenant state

### 4. Input Validation
- All S3 keys are validated using the S3 guard utilities
- Tenant IDs are sanitized before use
- Document IDs are validated against database records

## Integration Points

### 1. Document Upload Integration
When a document is uploaded, the RAG pipeline is triggered:
- The upload service generates a tenant-specific S3 key
- The document is stored in the database with tenant context
- The RAG job processes the document with full tenant isolation

### 2. Background Processing
The RAG processing job ensures continuous ingestion:
- Scheduled processing of pending documents
- Tenant-isolated processing
- Error handling that doesn't affect other tenants

### 3. API Integration
The pipeline can be triggered via API endpoints:
- Authentication middleware ensures tenant context
- All operations validate tenant ownership
- Responses are filtered to tenant-specific data

## Security Validation

The pipeline includes multiple validation layers:

1. **Authentication Layer**: JWT-based tenant context from API layer
2. **Database Layer**: Tenant-scoped queries prevent cross-tenant access
3. **S3 Layer**: S3 guard utilities validate key ownership
4. **Vector Database Layer**: Tenant metadata ensures proper isolation
5. **Application Layer**: Business logic validation at each step

## Error Handling

The pipeline handles errors without compromising tenant isolation:
- Errors are logged with tenant context but don't expose other tenants' data
- Failed processing for one tenant doesn't affect others
- Status updates are tenant-isolated

This implementation ensures that the RAG ingestion pipeline maintains strict tenant isolation while providing efficient document processing for each tenant's documents.