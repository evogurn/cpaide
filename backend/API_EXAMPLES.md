# API Testing Examples

Complete collection of API requests for testing the backend.

## Setup

```bash
# Base URL
BASE_URL=http://localhost:5000/api

# After login, save your token
TOKEN=your_access_token_here
TENANT_ID=your_tenant_id_here
```

## 1. Health Check

```bash
curl $BASE_URL/health
```

## 2. Authentication

### Register User
```bash
curl -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "tenantId": "'$TENANT_ID'"
  }'
```

### Login
```bash
curl -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "Admin@123",
    "tenantId": "'$TENANT_ID'"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGc..."
  }
}
```

### Get Current User
```bash
curl $BASE_URL/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Refresh Token
```bash
curl -X POST $BASE_URL/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your_refresh_token"
  }'
```

### Logout
```bash
curl -X POST $BASE_URL/auth/logout \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your_refresh_token"
  }'
```

## 3. Folders

### Create Folder
```bash
curl -X POST $BASE_URL/folders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Documents",
    "metadata": {
      "description": "Personal documents folder"
    }
  }'
```

### Create Subfolder
```bash
curl -X POST $BASE_URL/folders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tax Documents",
    "parentId": "parent_folder_id"
  }'
```

### List Folders
```bash
# Root folders
curl "$BASE_URL/folders" \
  -H "Authorization: Bearer $TOKEN"

# Subfolders
curl "$BASE_URL/folders?parentId=folder_id" \
  -H "Authorization: Bearer $TOKEN"

# With pagination
curl "$BASE_URL/folders?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Folder
```bash
curl $BASE_URL/folders/folder_id \
  -H "Authorization: Bearer $TOKEN"
```

### Update Folder
```bash
curl -X PATCH $BASE_URL/folders/folder_id \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Folder Name"
  }'
```

### Move Folder
```bash
curl -X POST $BASE_URL/folders/folder_id/move \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetParentId": "new_parent_id"
  }'
```

### Delete Folder
```bash
curl -X DELETE $BASE_URL/folders/folder_id \
  -H "Authorization: Bearer $TOKEN"
```

## 4. Documents

### Get Pre-signed Upload URL
```bash
curl -X POST $BASE_URL/documents/upload-url \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "report.pdf",
    "contentType": "application/pdf"
  }'
```

### Create Document (after upload)
```bash
curl -X POST $BASE_URL/documents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Annual Report 2024",
    "originalName": "report.pdf",
    "mimeType": "application/pdf",
    "size": 1048576,
    "storageKey": "tenants/xxx/documents/report-123.pdf",
    "folderId": "folder_id",
    "tags": ["report", "2024", "annual"],
    "metadata": {
      "year": 2024,
      "department": "Finance"
    }
  }'
```

### List Documents
```bash
# All documents
curl "$BASE_URL/documents" \
  -H "Authorization: Bearer $TOKEN"

# Documents in folder
curl "$BASE_URL/documents?folderId=folder_id" \
  -H "Authorization: Bearer $TOKEN"

# Filter by status
curl "$BASE_URL/documents?status=READY" \
  -H "Authorization: Bearer $TOKEN"

# Filter by tags
curl "$BASE_URL/documents?tags=report,2024" \
  -H "Authorization: Bearer $TOKEN"

# With pagination
curl "$BASE_URL/documents?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Search Documents
```bash
curl "$BASE_URL/documents/search?query=annual+report" \
  -H "Authorization: Bearer $TOKEN"

curl "$BASE_URL/documents/search?query=tax&folderId=folder_id&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Document
```bash
curl $BASE_URL/documents/document_id \
  -H "Authorization: Bearer $TOKEN"
```

### Get Download URL
```bash
curl $BASE_URL/documents/document_id/download \
  -H "Authorization: Bearer $TOKEN"
```

### Update Document
```bash
curl -X PATCH $BASE_URL/documents/document_id \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Document Name",
    "tags": ["updated", "tag"],
    "metadata": {
      "reviewed": true
    }
  }'
```

### Move Document
```bash
curl -X POST $BASE_URL/documents/document_id/move \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetFolderId": "new_folder_id"
  }'
```

### Delete Document
```bash
curl -X DELETE $BASE_URL/documents/document_id \
  -H "Authorization: Bearer $TOKEN"
```

### Restore Document
```bash
curl -X POST $BASE_URL/documents/document_id/restore \
  -H "Authorization: Bearer $TOKEN"
```

## 5. AI / RAG

### Semantic Search Query
```bash
curl -X POST $BASE_URL/ai/query \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the tax deductions for 2024?",
    "limit": 5,
    "minScore": 0.7
  }'
```

### Search in Specific Folder
```bash
curl -X POST $BASE_URL/ai/query \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "compliance requirements",
    "folderId": "folder_id",
    "limit": 10
  }'
```

### Reprocess Document
```bash
curl -X POST $BASE_URL/ai/reprocess/document_id \
  -H "Authorization: Bearer $TOKEN"
```

## 6. Users (Admin)

### Create User
```bash
curl -X POST $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "firstName": "Jane",
    "lastName": "Smith",
    "roleIds": ["role_id"]
  }'
```

### List Users
```bash
curl "$BASE_URL/users?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

curl "$BASE_URL/users?status=ACTIVE" \
  -H "Authorization: Bearer $TOKEN"
```

### Get User
```bash
curl $BASE_URL/users/user_id \
  -H "Authorization: Bearer $TOKEN"
```

### Update User
```bash
curl -X PATCH $BASE_URL/users/user_id \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "status": "INACTIVE"
  }'
```

### Assign Roles
```bash
curl -X POST $BASE_URL/users/user_id/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleIds": ["role_id_1", "role_id_2"]
  }'
```

### Delete User
```bash
curl -X DELETE $BASE_URL/users/user_id \
  -H "Authorization: Bearer $TOKEN"
```

## 7. Tenants (Super Admin Only)

### Create Tenant
```bash
curl -X POST $BASE_URL/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Company Inc",
    "subdomain": "newcompany",
    "settings": {
      "maxUsers": 50,
      "maxStorage": 10737418240
    }
  }'
```

### List Tenants
```bash
curl "$BASE_URL/tenants" \
  -H "Authorization: Bearer $TOKEN"

curl "$BASE_URL/tenants?status=ACTIVE&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Tenant
```bash
curl $BASE_URL/tenants/tenant_id \
  -H "Authorization: Bearer $TOKEN"
```

### Update Tenant
```bash
curl -X PATCH $BASE_URL/tenants/tenant_id \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Company Name",
    "status": "ACTIVE"
  }'
```

### Delete Tenant
```bash
curl -X DELETE $BASE_URL/tenants/tenant_id \
  -H "Authorization: Bearer $TOKEN"
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "statusCode": 200
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE",
  "details": { ... },
  "statusCode": 400
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved",
  "data": {
    "items": [...],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Testing with Postman

1. Import this as a collection
2. Set up environment variables:
   - `base_url`: http://localhost:5000/api
   - `token`: (auto-populated after login)
   - `tenant_id`: your tenant ID

3. Use the login endpoint to get a token
4. Token is automatically used in subsequent requests

## Testing with HTTPie

```bash
# Install HTTPie
pip install httpie

# Login
http POST $BASE_URL/auth/login email=admin@demo.com password=Admin@123 tenantId=$TENANT_ID

# Use token
http GET $BASE_URL/folders "Authorization: Bearer $TOKEN"
```
