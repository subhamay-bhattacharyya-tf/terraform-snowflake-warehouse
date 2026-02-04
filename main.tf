
# --- Resource definitions

resource "aws_s3_bucket" "s3_bucket" {
  bucket = local.bucket_name
  tags   = local.tags
}

resource "aws_s3_bucket_versioning" "s3_bucket_versioning" {
  bucket = aws_s3_bucket.s3_bucket.id
  versioning_configuration {
    status = local.bucket_versioning ? "Enabled" : "Suspended"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "s3_bucket_sse_configuration" {
  bucket = aws_s3_bucket.s3_bucket.id
  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = local.encryption_algorithm == "aws:kms" ? local.encryption_key_arn : null
      sse_algorithm     = local.encryption_algorithm
    }
    bucket_key_enabled = local.encryption_bucket_key_enabled
  }
}

resource "aws_s3_bucket_intelligent_tiering_configuration" "intelligent_tiering_configuration" {
  for_each = { for idx, config in local.intelligent_tiering_normalized : "config_${idx}" => config }
  bucket   = aws_s3_bucket.s3_bucket.id
  name     = each.value.name
  status   = each.value.enabled ? "Enabled" : "Suspended"
  filter {
    prefix = each.value.prefix
    tags   = each.value.tags
  }
  dynamic "tiering" {
    for_each = each.value.tierings
    content {
      access_tier = tiering.value.access_tier
      days        = tiering.value.days
    }
  }
}

resource "aws_s3_bucket_logging" "s3_bucket_logging" {
  count = local.logging_enabled ? 1 : 0

  bucket        = aws_s3_bucket.s3_bucket.id
  target_bucket = local.logging_bucket
  target_prefix = local.logging_prefix
}

resource "aws_s3_bucket_lifecycle_configuration" "s3_bucket_lifecycle" {
  bucket = aws_s3_bucket.s3_bucket.id

  dynamic "rule" {
    for_each = local.lifecycle_rules_raw
    content {
      id     = rule.value.id
      status = rule.value.enabled ? "Enabled" : "Disabled"

      filter {
        prefix = rule.value.prefix
      }

      dynamic "transition" {
        for_each = rule.value.transition
        content {
          days          = transition.value.days
          storage_class = transition.value.storage_class
        }
      }

      expiration {
        days = rule.value.expiration.days
      }
    }
  }
}
