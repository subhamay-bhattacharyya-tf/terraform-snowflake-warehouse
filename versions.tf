# -----------------------------------------------------------------------------
# Terraform Snowflake Warehouse Module - Versions
# -----------------------------------------------------------------------------
# Terraform and provider version constraints for the Snowflake warehouse
# module.
# -----------------------------------------------------------------------------

terraform {
  required_version = ">= 1.3.0"

  required_providers {
    snowflake = {
      source  = "snowflakedb/snowflake"
      version = ">= 0.87.0"
    }
  }
}
