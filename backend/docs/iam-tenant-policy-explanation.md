# IAM Policy for Tenant-Specific S3 Access

## Policy Overview
This IAM policy enforces strict prefix-based isolation for a single tenant in a shared S3 bucket, allowing only specific S3 operations within the tenant's designated prefix.

## IAM Policy JSON
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::rag-docs-prod/tenants/t_123/*"
    }
  ]
}
```

## Explanation of Each Permission

### 1. Policy Version
- `"Version": "2012-10-17"`: Specifies the version of the IAM policy language to use

### 2. Statement Elements

#### Effect
- `"Effect": "Allow"`: Allows the specified actions (as opposed to "Deny" which would block them)

#### Actions
- `"s3:GetObject"`: Allows reading/downloading objects from the S3 bucket
  - Required for retrieving documents, extracted text, chunks, and embeddings
  - Enables document download functionality and RAG system access to stored content

- `"s3:PutObject"`: Allows uploading/creating objects in the S3 bucket
  - Required for storing new documents, extracted text, chunks, and embeddings
  - Enables document upload functionality in the RAG system

- `"s3:DeleteObject"`: Allows deleting objects from the S3 bucket
  - Required for removing documents when they're deleted from the system
  - Enables proper cleanup of tenant data when documents are removed

#### Resource
- `"Resource": "arn:aws:s3:::rag-docs-prod/tenants/t_123/*"`: Specifies exactly which resources the actions apply to
  - `arn:aws:s3:::`: The standard ARN prefix for S3 resources
  - `rag-docs-prod`: The specific bucket name
  - `/tenants/t_123/*`: Restricts access to only objects within the `tenants/t_123/` prefix
  - The `*` wildcard allows access to all objects within that prefix and its subdirectories

## Security Benefits

### 1. Strict Isolation
- Tenant `t_123` can only access objects in the `tenants/t_123/` prefix
- No access to other tenants' data in prefixes like `tenants/t_456/`, `tenants/t_789/`, etc.
- No access to other bucket areas outside the tenant prefix

### 2. Minimal Permissions
- Only grants the three essential S3 operations needed for document management
- Does not include unnecessary permissions like `s3:ListAllMyBuckets`
- Follows the principle of least privilege

### 3. Prevention of Cross-Tenant Access
- The specific prefix restriction ensures no access to other tenants' data
- Even if a tenant somehow constructs a request for another tenant's objects, the policy will deny it
- Works in conjunction with application-level validation for defense-in-depth security

## Integration with Application-Level Security

This IAM policy should be used together with application-level tenant validation to create a defense-in-depth approach:

1. **IAM Level**: Blocks unauthorized access at the AWS level
2. **Application Level**: Validates tenant context from JWT tokens and enforces additional business logic

This dual-layer approach ensures that even if one layer is compromised, the other provides protection.