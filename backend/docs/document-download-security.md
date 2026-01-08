# Secure Document Download Implementation

## Overview
This document explains the security measures implemented in the document download functionality for the multi-tenant RAG system.

## Security Architecture

### 1. Multi-Layer Validation
The system implements multiple layers of validation before generating presigned download URLs:
- **Tenant Ownership Validation**: Ensures document belongs to authenticated user's tenant
- **Role-Based Access Control**: Validates user has required permissions for document access
- **S3 Key Validation**: Confirms S3 object key format and tenant ownership
- **Database Consistency**: Verifies document exists and is not deleted

### 2. Backend Logic Flow

#### Validation Process
```javascript
// The validation sequence is:
1. Validate document exists in user's tenant
2. Check user roles against document/folder permissions
3. Validate S3 key format and tenant ownership
4. Generate presigned URL if all validations pass
```

## Validation Logic

### 1. Tenant Ownership Validation
- Fetches document from database using tenant-scoped query
- Ensures `document.tenantId === user.tenantId`
- Prevents cross-tenant document access

### 2. Role-Based Access Control
- Checks user roles against document's allowed roles
- Falls back to folder-level permissions if document has no specific roles
- Default access granted if no role restrictions exist

### 3. S3 Key Validation
- Verifies S3 key follows format: `tenants/{tenantId}/documents/...`
- Ensures key belongs to authenticated user's tenant
- Prevents access to arbitrary S3 keys

### 4. Document State Validation
- Checks that document is not soft-deleted (`deletedAt: null`)
- Ensures document has a valid S3 storage key

## API Endpoints

### GET /api/document-download/download-url/:documentId
**Purpose**: Generate presigned download URL for secure document access
**Authentication**: JWT required
**Security**: Enforces tenant isolation and role-based access

**Response**:
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://s3.amazonaws.com/bucket/...?presigned=true",
    "documentId": "doc_123",
    "fileName": "document.pdf",
    "mimeType": "application/pdf"
  },
  "message": "Download URL generated successfully"
}
```

### GET /api/document-download/validate/:documentId
**Purpose**: Validate document access without generating URL
**Authentication**: JWT required
**Security**: Performs same validations as download URL generation

## Failure Scenarios

### 1. Unauthorized Access Attempts
- **Scenario**: User tries to access document from different tenant
- **Validation**: Tenant ownership check fails
- **Result**: 403 Forbidden response

### 2. Insufficient Role Permissions
- **Scenario**: User without required role tries to access restricted document
- **Validation**: Role-based access check fails
- **Result**: 403 Forbidden response

### 3. Invalid S3 Key Format
- **Scenario**: Document has malformed or unauthorized S3 key
- **Validation**: S3 key format validation fails
- **Result**: 403 Forbidden response

### 4. Non-Existent Document
- **Scenario**: Document ID doesn't exist or is deleted
- **Validation**: Document lookup returns null
- **Result**: 403 Forbidden response

### 5. Missing Authentication
- **Scenario**: Request without valid JWT or missing user context
- **Validation**: Authentication middleware fails
- **Result**: 401 Unauthorized response

## Key Security Features

### 1. No Arbitrary S3 Key Access
- S3 keys are validated against database records
- Tenant prefix is enforced in key validation
- Prevents direct access to S3 objects without proper authorization

### 2. JWT-Based Context
- All validations use tenant ID from JWT token
- Never trusts client-provided tenant context
- Ensures users can only access their own tenant's documents

### 3. Role-Based Permissions
- Granular access control at document and folder level
- Supports different user roles with varying permissions
- Flexible permission model for complex organizational structures

### 4. Input Validation
- All inputs are validated before processing
- Document IDs are validated against database records
- S3 keys are validated for proper format and ownership

## Integration with Existing System

The document download service integrates with:
- Authentication middleware for user validation
- Existing document management system
- S3 storage with tenant isolation
- Role-based access control (RBAC) system
- Database with tenant-scoped queries

## Defense-in-Depth Approach

This implementation follows the "Dual-Layer Tenant Isolation Enforcement" pattern:
1. **Application Layer**: Validates tenant context from JWT and enforces role-based access
2. **Infrastructure Layer**: AWS IAM policies provide additional access control

This ensures that even if one layer is compromised, the other provides protection.