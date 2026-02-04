terraform {
  required_version = ">= 1.3.0"

  required_providers {
    snowflake = {
      source  = "Snowflake-Labs/snowflake"
      version = ">= 0.87.0"
    }
  }
}

# Provider configuration placeholder
# Configure authentication using environment variables or a provider block:
#
# Option 1: Environment variables (recommended)
#   export SNOWFLAKE_ACCOUNT="your_account"
#   export SNOWFLAKE_USER="your_user"
#   export SNOWFLAKE_PASSWORD="your_password"
#   export SNOWFLAKE_ROLE="your_role"
#
# Option 2: Provider block (not recommended for production)
# provider "snowflake" {
#   account  = "your_account"
#   user     = "your_user"
#   password = "your_password"
#   role     = "your_role"
# }
