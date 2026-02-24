# Multiple Warehouses Example

This example demonstrates how to create multiple Snowflake warehouses using the terraform-snowflake-warehouse module with a map-based configuration.

## Usage

```hcl
module "warehouses" {
  source = "github.com/subhamay-bhattacharyya-tf/terraform-snowflake-warehouse"

  warehouse_configs = {
    "adhoc_wh" = {
      name                      = "ADHOC_WH"
      warehouse_size            = "X-SMALL"
      warehouse_type            = "STANDARD"
      auto_resume               = true
      auto_suspend              = 60
      initially_suspended       = true
      min_cluster_count         = 1
      max_cluster_count         = 1
      scaling_policy            = "STANDARD"
      enable_query_acceleration = false
      comment                   = "Ad-hoc queries warehouse"
      grants = [
        {
          role_name  = "ANALYST_ROLE"
          privileges = ["USAGE", "OPERATE"]
        }
      ]
    }
    "load_wh" = {
      name                      = "LOAD_WH"
      warehouse_size            = "X-SMALL"
      warehouse_type            = "STANDARD"
      auto_resume               = true
      auto_suspend              = 60
      initially_suspended       = true
      min_cluster_count         = 1
      max_cluster_count         = 1
      scaling_policy            = "STANDARD"
      enable_query_acceleration = false
      comment                   = "Data loading warehouse"
      grants = [
        {
          role_name  = "LOADER_ROLE"
          privileges = ["USAGE", "OPERATE", "MODIFY"]
        }
      ]
    }
    "transform_wh" = {
      name                      = "TRANSFORM_WH"
      warehouse_size            = "MEDIUM"
      warehouse_type            = "STANDARD"
      auto_resume               = true
      auto_suspend              = 120
      initially_suspended       = true
      min_cluster_count         = 1
      max_cluster_count         = 3
      scaling_policy            = "STANDARD"
      enable_query_acceleration = true
      comment                   = "ETL/ELT transformations warehouse"
      grants = [
        {
          role_name  = "TRANSFORMER_ROLE"
          privileges = ["USAGE", "OPERATE"]
        },
        {
          role_name  = "DBT_ROLE"
          privileges = ["USAGE", "OPERATE", "MODIFY"]
        }
      ]
    }
  }
}
```

## Requirements

| Name | Version |
|------|---------|
| terraform | >= 1.3.0 |
| snowflake | >= 0.87.0 |

## Inputs

| Name | Description | Type | Required |
|------|-------------|------|----------|
| warehouse_configs | Map of warehouse configuration objects | `map(object)` | yes |
| snowflake_organization_name | Snowflake organization name | `string` | yes |
| snowflake_account_name | Snowflake account name | `string` | yes |
| snowflake_user | Snowflake username | `string` | yes |
| snowflake_role | Snowflake role | `string` | yes |
| snowflake_private_key | Snowflake private key for JWT auth | `string` | yes |

## Outputs

| Name | Description |
|------|-------------|
| warehouse_names | Map of warehouse names keyed by identifier |
| warehouse_fully_qualified_names | Map of fully qualified warehouse names |
| warehouse_sizes | Map of warehouse sizes |
| warehouse_states | Map of warehouse states (STARTED or SUSPENDED) |
| warehouses | All warehouse resources |
