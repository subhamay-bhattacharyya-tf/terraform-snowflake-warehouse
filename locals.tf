# --- Parse config file
locals {
  s3_config         = jsondecode(file("${path.module}/${var.config_json_file}"))
  project_name      = try(local.s3_config["tags"]["Project"], null)
  environment_name  = try(local.s3_config["tags"]["Environment"], null)
  tags              = try(local.s3_config["tags"], {})
  bucket_base_name  = try(local.s3_config["bucket-base-name"], null)
  bucket_versioning = try(local.s3_config["versioning"], null)

  # --- Project Name Validation
  project_name_valid = local.project_name != null && length(local.project_name) >= 3 && length(local.project_name) <= 10

  # --- Environment Validation
  environment_name_valid = contains(["devl", "test", "stag", "prod"], local.environment_name)

  # --- Bucket Name Validation
  name_too_short    = local.bucket_base_name == null || length(local.bucket_base_name) < 3
  name_too_long     = length(local.bucket_base_name) > 30
  invalid_chars     = length(regexall("^[a-z0-9][a-z0-9.-]*[a-z0-9]$", local.bucket_base_name)) == 0
  is_ip_format      = length(regexall("^\\d{1,3}(\\.\\d{1,3}){3}$", local.bucket_base_name)) > 0
  has_bad_patterns  = length(regexall("(\\.\\.|\\.-|\\-\\.)", local.bucket_base_name)) > 0
  bucket_name_valid = !(local.name_too_short || local.name_too_long || local.invalid_chars || local.is_ip_format || local.has_bad_patterns)

  bucket_name = "${local.project_name}-${local.bucket_base_name}-${data.aws_region.current.name}-${local.environment_name}"

  # --- Versioning Validation
  bucket_versioning_valid = contains([true, false], local.bucket_versioning)

  # --- Encryption Validation
  encryption_config             = try(local.s3_config["encryption"], {})
  encryption_enabled            = try(local.encryption_config["enabled"], false)
  encryption_type               = try(local.encryption_config["type"], null)
  encryption_key_arn            = try(local.encryption_config["key_arn"], null)
  encryption_bucket_key_enabled = try(local.encryption_config["bucket_key_enabled"], false)
  encryption_algorithm = local.encryption_enabled ? (
    local.encryption_type == "SSE-S3" ? "AES256" : (
      local.encryption_type == "SSE-KMS" ? "aws:kms" : null
    )
  ) : null

  encryption_config_valid = contains([true, false], local.encryption_enabled) && contains([true, false], local.encryption_bucket_key_enabled) && (
    local.encryption_enabled == false || (
      contains(["SSE-S3", "SSE-KMS"], local.encryption_type) && (
        local.encryption_type == "SSE-S3" ||
        (local.encryption_type == "SSE-KMS" && local.encryption_key_arn != null && local.encryption_key_arn != "")
      )
    )
  )

  # --- Intelligent Tiering Validation
  intelligent_tiering_raw = try(local.s3_config["intelligent_tiering_configs"], [])
  intelligent_tiering_normalized = [
    for config in local.intelligent_tiering_raw : merge(config, {
      tags = { for tag in try(config.tags, []) : tag.key => tag.value }
    })
  ]

  intelligent_tiering_config_valid = alltrue([
    for config in local.intelligent_tiering_normalized : (
      can(config.name) &&
      can(config.enabled) &&
      can(config.prefix) &&
      can(config.tierings) &&
      alltrue([
        for tiering in config.tierings : (
          can(tiering.access_tier) &&
          can(tiering.days)
        )
      ])
    )
  ])

  # --- Access Logging Validation
  logging_config  = try(local.s3_config["logging"], {})
  logging_enabled = try(local.logging_config["enabled"], false)
  logging_bucket  = try(local.logging_config["target_bucket"], null)
  logging_prefix  = try(local.logging_config["target_prefix"], null)
  access_logging_valid = local.logging_enabled == false || (
    local.logging_bucket != null && local.logging_bucket != "" &&
    local.logging_prefix != null && local.logging_prefix != ""
  )

  # --- Lifecycle Rules Validation
  lifecycle_rules_raw = try(local.s3_config["lifecycle_rules"], [])
  lifecycle_rules_valid = alltrue([
    for rule in local.lifecycle_rules_raw : (
      can(rule.id) &&
      can(rule.enabled) &&
      can(rule.prefix) &&
      (
        !can(rule.transition) || alltrue([
          for t in rule.transition : (
            can(t.days) &&
            contains([
              "STANDARD", "STANDARD_IA", "ONEZONE_IA",
              "INTELLIGENT_TIERING", "GLACIER", "DEEP_ARCHIVE", "GLACIER_IR"
            ], t.storage_class)
          )
        ])
      ) &&
      (!can(rule.expiration) || can(rule.expiration.days))
    )
  ])
}

# --- Validation Resources
resource "null_resource" "validate_project_name" {
  count = local.project_name_valid ? 0 : 1
  provisioner "local-exec" {
    command = <<EOT
      echo "❌ Invalid project name '${local.project_name}'"
      echo "• Must be 3–10 characters"
      exit 1
    EOT
  }
}

resource "null_resource" "validate_environment_name" {
  count = local.environment_name_valid ? 0 : 1
  provisioner "local-exec" {
    command = <<EOT
      echo "❌ Invalid environment name '${local.environment_name}'"
      echo "• Must be one of: devl, test, stag, prod"
      exit 1
    EOT
  }
}

resource "null_resource" "validate_bucket_name" {
  count = local.bucket_name_valid ? 0 : 1
  provisioner "local-exec" {
    command = <<EOT
      echo "❌ Invalid bucket base name '${local.bucket_base_name}'"
      echo "• Must follow S3 naming conventions"
      exit 1
    EOT
  }
}

resource "null_resource" "validate_bucket_versioning" {
  count = local.bucket_versioning_valid ? 0 : 1
  provisioner "local-exec" {
    command = <<EOT
      echo "❌ Invalid versioning setting"
      echo "• Should be true or false"
      exit 1
    EOT
  }
}

resource "null_resource" "validate_encryption_config" {
  count = local.encryption_config_valid ? 0 : 1
  provisioner "local-exec" {
    command = <<EOT
      echo "❌ Invalid encryption configuration"
      exit 1
    EOT
  }
}

resource "null_resource" "validate_intelligent_tiering" {
  count = local.intelligent_tiering_config_valid ? 0 : 1
  provisioner "local-exec" {
    command = <<EOT
      echo "❌ Invalid intelligent tiering config"
      exit 1
    EOT
  }
}

resource "null_resource" "validate_access_logging" {
  count = local.access_logging_valid ? 0 : 1
  provisioner "local-exec" {
    command = <<EOT
      echo "❌ Invalid access logging configuration"
      echo "• If logging is enabled, both 'target_bucket' and 'target_prefix' must be set"
      exit 1
    EOT
  }
}

resource "null_resource" "validate_lifecycle_rules" {
  count = local.lifecycle_rules_valid ? 0 : 1
  provisioner "local-exec" {
    command = <<EOT
      echo "❌ Invalid lifecycle rule configuration"
      echo "• Ensure valid id, prefix, expiration days and transition storage_class"
      exit 1
    EOT
  }
}
