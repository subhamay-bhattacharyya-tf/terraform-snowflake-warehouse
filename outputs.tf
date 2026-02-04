
output "s3_bucket_name" {
  value       = aws_s3_bucket.s3_bucket.bucket
  description = "The name of the S3 bucket created."
}

output "s3_bucket_versioning" {
  value       = aws_s3_bucket_versioning.s3_bucket_versioning.versioning_configuration
  description = "The versioning configuration of the S3 bucket."
}

output "s3_bucket_encryption_configuration" {
  value       = aws_s3_bucket_server_side_encryption_configuration.s3_bucket_sse_configuration.rule
  description = "The encryption configuration of the S3 bucket."
}

output "s3_bucket_intelligent_tiering_configuration" {
  value       = aws_s3_bucket_intelligent_tiering_configuration.intelligent_tiering_configuration
  description = "The intelligent tiering configuration of the S3 bucket."
}
output "s3_bucket_logging_configuration" {
  value       = aws_s3_bucket_logging.s3_bucket_logging
  description = "The logging configuration of the S3 bucket."
}
output "s3_bucket_logging_target_bucket" {
  value       = try(aws_s3_bucket_logging.s3_bucket_logging[0].target_bucket, null)
  description = "The target bucket for logging."
}
output "s3_bucket_logging_target_prefix" {
  value       = try(aws_s3_bucket_logging.s3_bucket_logging[0].target_prefix, null)
  description = "The target prefix for logging."
}
output "s3_bucket_logging_id" {
  value       = try(aws_s3_bucket_logging.s3_bucket_logging[0].id, null)
  description = "The ID of the logging configuration."
}
