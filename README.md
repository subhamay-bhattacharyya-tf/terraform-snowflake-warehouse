# Terraform Snowflake Module - Warehouse

![Release](https://github.com/subhamay-bhattacharyya-tf/terraform-snowflake-warehouse/actions/workflows/ci.yaml/badge.svg)&nbsp;![Snowflake](https://img.shields.io/badge/Snowflake-29B5E8?logo=snowflake&logoColor=white)&nbsp;![Commit Activity](https://img.shields.io/github/commit-activity/t/subhamay-bhattacharyya-tf/terraform-snowflake-warehouse)&nbsp;![Last Commit](https://img.shields.io/github/last-commit/subhamay-bhattacharyya-tf/terraform-snowflake-warehouse)&nbsp;![Release Date](https://img.shields.io/github/release-date/subhamay-bhattacharyya-tf/terraform-snowflake-warehouse)&nbsp;![Repo Size](https://img.shields.io/github/repo-size/subhamay-bhattacharyya-tf/terraform-snowflake-warehouse)&nbsp;![File Count](https://img.shields.io/github/directory-file-count/subhamay-bhattacharyya-tf/terraform-snowflake-warehouse)&nbsp;![Issues](https://img.shields.io/github/issues/subhamay-bhattacharyya-tf/terraform-snowflake-warehouse)&nbsp;![Top Language](https://img.shields.io/github/languages/top/subhamay-bhattacharyya-tf/terraform-snowflake-warehouse)&nbsp;![Custom Endpoint](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/bsubhamay/73bb06aedb3721ff9a98cfe96f71647a/raw/terraform-snowflake-warehouse.json?)

A Terraform module for creating and managing multiple Snowflake warehouses using a map of configuration objects.

## Features

- Map-based configuration for creating multiple warehouses
- Built-in input validation with descriptive error messages
- Sensible defaults for optional properties
- Outputs keyed by warehouse identifier for easy reference

## Usage

```hcl
locals {
  warehouses = {
    "adhoc_wh" = {
      name                      = "SN_TEST_ADHOC_WH"
      warehouse_size            = "X-SMALL"
      warehouse_type            = "STANDARD"
      auto_resume               = true
      auto_suspend              = 60
      initially_suspended       = true
      min_cluster_count         = 1
      max_cluster_count         = 1
      scaling_policy            = "STANDARD"
      enable_query_acceleration = false
      comment                   = "Development and sandbox warehouse"
    }
    "transform_wh" = {
      name                      = "SN_TEST_TRANSFORM_WH"
      warehouse_size            = "MEDIUM"
      warehouse_type            = "STANDARD"
      auto_resume               = true
      auto_suspend              = 300
      initially_suspended       = true
      min_cluster_count         = 1
      max_cluster_count         = 3
      scaling_policy            = "STANDARD"
      enable_query_acceleration = true
      comment                   = "ETL/ELT warehouse for transformations"
    }
  }
}

module "warehouses" {
  source = "path/to/modules/snowflake-warehouse"

  warehouse_configs = local.warehouses
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
| warehouse_configs | Map of configuration objects for Snowflake warehouses | map(object) | no |

### warehouse_configs Object Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| name | string | - | Warehouse identifier (required) |
| warehouse_size | string | "X-SMALL" | Size of the warehouse |
| warehouse_type | string | "STANDARD" | Type of warehouse (STANDARD) |
| auto_resume | bool | true | Auto-resume when queries are submitted |
| auto_suspend | number | 60 | Seconds of inactivity before auto-suspend |
| initially_suspended | bool | true | Start in suspended state |
| min_cluster_count | number | 1 | Minimum number of clusters |
| max_cluster_count | number | 1 | Maximum number of clusters |
| scaling_policy | string | "STANDARD" | Scaling policy (STANDARD, ECONOMY) |
| enable_query_acceleration | bool | false | Enable query acceleration |
| comment | string | null | Description of the warehouse |

### Valid Warehouse Sizes

X-SMALL, SMALL, MEDIUM, LARGE

## Outputs

| Name | Description |
|------|-------------|
| warehouse_names | Map of warehouse names keyed by identifier |
| warehouse_fully_qualified_names | Map of fully qualified warehouse names |
| warehouse_sizes | Map of warehouse sizes |
| warehouse_states | Map of warehouse states (STARTED or SUSPENDED) |
| warehouses | All warehouse resources |

## Validation

The module validates inputs and provides descriptive error messages for:

- Empty warehouse name
- Invalid warehouse size
- Invalid warehouse type
- Invalid scaling policy
- Negative auto_suspend value
- min_cluster_count exceeding max_cluster_count

## License

MIT License - See [LICENSE](LICENSE) for details.
