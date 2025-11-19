# S3 Bucket Setup for Attachments

**Last updated**: 2025-01-XX  
**Purpose**: Complete S3 bucket configuration for Nexa ERP attachments

---

## Prerequisites

- AWS Account with S3 access
- AWS CLI configured (optional, for testing)
- IAM user/role with S3 permissions

---

## Step 1: Create S3 Bucket

### Using AWS Console

1. Navigate to S3 in AWS Console
2. Click "Create bucket"
3. Configure:
   - **Bucket name**: `nexa-attachments-prod` (or `nexa-attachments-dev` for dev)
   - **Region**: `eu-west-2` (London) or your preferred region
   - **Object Ownership**: ACLs disabled (recommended)
   - **Block Public Access**: Enable all (attachments are private)
   - **Versioning**: Enable (recommended for audit trail)
   - **Encryption**: Enable SSE-S3 (or SSE-KMS if using BYOK)
   - **Object Lock**: Disable (unless compliance requires)

### Using AWS CLI

```bash
aws s3api create-bucket \
  --bucket nexa-attachments-prod \
  --region eu-west-2 \
  --create-bucket-configuration LocationConstraint=eu-west-2

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket nexa-attachments-prod \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket nexa-attachments-prod \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

---

## Step 2: Configure CORS

### CORS Policy

Create CORS configuration to allow pre-signed URL uploads from your domain:

```json
[
  {
    "AllowedHeaders": [
      "Content-Type",
      "Content-Length",
      "x-amz-date",
      "x-amz-content-sha256",
      "authorization"
    ],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedOrigins": [
      "https://app.nexaai.co.uk",
      "https://*.nexaai.co.uk"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

### Apply CORS

**Using AWS Console:**
1. Select bucket → Permissions → CORS
2. Paste JSON above
3. Save

**Using AWS CLI:**
```bash
aws s3api put-bucket-cors \
  --bucket nexa-attachments-prod \
  --cors-configuration file://cors.json
```

---

## Step 3: Create IAM Policy

### Policy Document

Create IAM policy for attachment operations:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowPresignedUrlOperations",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:HeadObject"
      ],
      "Resource": "arn:aws:s3:::nexa-attachments-prod/tenants/*"
    },
    {
      "Sid": "AllowListOperations",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::nexa-attachments-prod",
      "Condition": {
        "StringLike": {
          "s3:prefix": "tenants/*"
        }
      }
    }
  ]
}
```

### Attach to IAM User/Role

1. Create IAM user or use existing role
2. Attach policy above
3. Generate access keys (if using user)
4. Store keys securely (use AWS Secrets Manager or environment variables)

---

## Step 4: Configure Bucket Policy (Optional)

For additional security, add bucket policy to restrict access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyNonTenantScopedAccess",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::nexa-attachments-prod",
        "arn:aws:s3:::nexa-attachments-prod/*"
      ],
      "Condition": {
        "StringNotLike": {
          "s3:prefix": "tenants/*"
        }
      }
    }
  ]
}
```

---

## Step 5: Environment Variables

Set in your deployment environment:

```bash
# Required
NEXA_ATTACHMENTS_ENABLED=true
NEXA_ATTACHMENTS_S3_BUCKET=nexa-attachments-prod
NEXA_ATTACHMENTS_S3_REGION=eu-west-2
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# Optional
NEXA_ATTACHMENTS_MAX_SIZE_MB=20
NEXA_ATTACHMENTS_ALLOWED_MIME=application/pdf,image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

---

## Step 6: Lifecycle Policies (Optional)

Configure lifecycle to archive old versions:

```json
{
  "Rules": [
    {
      "Id": "ArchiveOldVersions",
      "Status": "Enabled",
      "Prefix": "tenants/",
      "NoncurrentVersionTransitions": [
        {
          "NoncurrentDays": 90,
          "StorageClass": "GLACIER"
        }
      ],
      "NoncurrentVersionExpiration": {
        "NoncurrentDays": 365
      }
    }
  ]
}
```

Apply:
```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket nexa-attachments-prod \
  --lifecycle-configuration file://lifecycle.json
```

---

## Step 7: Testing

### Test Upload

```bash
# Generate pre-signed URL (via API)
curl -X POST https://app.nexaai.co.uk/api/attachments/upload-url \
  -H "Content-Type: application/json" \
  -d '{
    "entityType": "CustomerInvoice",
    "entityId": "test-123",
    "filename": "test.pdf",
    "mimeType": "application/pdf",
    "size": 1024
  }'

# Upload file using pre-signed URL
curl -X PUT "<presigned-url>" \
  -H "Content-Type: application/pdf" \
  --data-binary @test.pdf
```

### Verify in S3

```bash
aws s3 ls s3://nexa-attachments-prod/tenants/ --recursive
```

---

## Troubleshooting

### Issue: CORS errors in browser

- Check CORS policy allows your origin
- Verify pre-signed URL includes correct headers
- Check browser console for specific CORS error

### Issue: Access Denied

- Verify IAM policy allows required actions
- Check bucket policy doesn't deny access
- Ensure access keys are correct

### Issue: Pre-signed URL expired

- Default expiry is 1 hour
- Regenerate URL if expired
- Consider longer expiry for large uploads (max 7 days)

---

## Security Best Practices

1. **Never expose access keys** in client-side code
2. **Use IAM roles** instead of access keys when possible (e.g., EC2, Lambda)
3. **Enable MFA delete** for production buckets (requires bucket versioning)
4. **Enable CloudTrail** to audit S3 access
5. **Use bucket encryption** (SSE-S3 or SSE-KMS)
6. **Restrict bucket policy** to tenant-scoped paths only
7. **Regularly rotate** access keys

---

## Cost Optimization

1. **Enable lifecycle policies** to move old versions to Glacier
2. **Use Intelligent-Tiering** for unpredictable access patterns
3. **Monitor CloudWatch metrics** for unusual access patterns
4. **Set up billing alerts** for unexpected costs

---

## References

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [S3 CORS Configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html)
- [S3 Pre-signed URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html)

