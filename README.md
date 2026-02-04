# Terraform Snowflake Module - Warehouse

![Release](https://github.com/subhamay-bhattacharyya-tf/terraform-snowflake-warehouse/actions/workflows/ci.yaml/badge.svg)&nbsp;![Snowflake](https://img.shields.io/badge/Snowflake-29B5E8?logo=snowflake&logoColor=white)&nbsp;![Commit Activity](https://img.shields.io/github/commit-activity/t/subhamay-bhattacharyya-tf/terraform-snowflake-warehouse)&nbsp;![Last Commit](https://img.shields.io/github/last-commit/subhamay-bhattacharyya-tf/terraform-snowflake-warehouse)&nbsp;![Release Date](https://img.shields.io/github/release-date/subhamay-bhattacharyya-tf/terraform-snowflake-warehouse)&nbsp;![Repo Size](https://img.shields.io/github/repo-size/subhamay-bhattacharyya-tf/terraform-snowflake-warehouse)&nbsp;![File Count](https://img.shields.io/github/directory-file-count/subhamay-bhattacharyya-tf/terraform-snowflake-warehouse)&nbsp;![Issues](https://img.shields.io/github/issues/subhamay-bhattacharyya-tf/terraform-snowflake-warehouse)&nbsp;![Top Language](https://img.shields.io/github/languages/top/subhamay-bhattacharyya-tf/terraform-snowflake-warehouse)&nbsp;![Custom Endpoint](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/bsubhamay/73bb06aedb3721ff9a98cfe96f71647a/raw/terraform-snowflake-warehouse.json?)

A Terraform module for creating and managing Snowflake warehouses with a single configuration object.

## Features

- Single object variable for all warehouse configuration
- Built-in input validation with descriptive error messages
- Sensible defaults for optional properties
- Outputs for downstream resource references

## Usage

```hcl
module "warehouse" {
  source = "path/to/modules/snowflake-warehouse"

  warehouse_config = {
    name                      = "MY_WAREHOUSE"
    warehouse_size            = "SMALL"
    warehouse_type            = "STANDARD"
    auto_resume               = true
    auto_suspend              = 300
    initially_suspended       = true
    min_cluster_count         = 1
    max_cluster_count         = 2
    scaling_policy            = "STANDARD"
    enable_query_acceleration = false
    comment                   = "My data warehouse"
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
| warehouse_config | Configuration object for the Snowflake warehouse | object | yes |

### warehouse_config Object

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| name | string | - | Warehouse identifier (required) |
| warehouse_size | string | "X-SMALL" | Size of the warehouse |
| warehouse_type | string | "STANDARD" | Type of warehouse (STANDARD, SNOWPARK-OPTIMIZED) |
| auto_resume | bool | true | Auto-resume when queries are submitted |
| auto_suspend | number | 60 | Seconds of inactivity before auto-suspend |
| initially_suspended | bool | true | Start in suspended state |
| min_cluster_count | number | 1 | Minimum number of clusters |
| max_cluster_count | number | 1 | Maximum number of clusters |
| scaling_policy | string | "STANDARD" | Scaling policy (STANDARD, ECONOMY) |
| enable_query_acceleration | bool | false | Enable query acceleration |
| comment | string | null | Description of the warehouse |

### Valid Warehouse Sizes

X-SMALL, SMALL, MEDIUM, LARGE, X-LARGE, 2X-LARGE, 3X-LARGE, 4X-LARGE, 5X-LARGE, 6X-LARGE

## Outputs

| Name | Description |
|------|-------------|
| warehouse_name | The name of the created warehouse |
| warehouse_fully_qualified_name | The fully qualified name of the warehouse |
| warehouse_size | The size of the warehouse |
| warehouse_state | The state of the warehouse (STARTED or SUSPENDED) |

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
