# Snowflake Warehouse Example

This example demonstrates how to use the `snowflake-warehouse` module to create a Snowflake warehouse.

## Usage

```hcl
module "warehouse" {
  source = "../../modules/snowflake-warehouse"

  warehouse_config = {
    name                      = "SN_TEST_STREAMLIT_WH"
    warehouse_size            = "X-SMALL"
    warehouse_type            = "STANDARD"
    auto_resume               = true
    auto_suspend              = 60
    initially_suspended       = true
    min_cluster_count         = 1
    max_cluster_count         = 1
    scaling_policy            = "STANDARD"
    enable_query_acceleration = false
    comment                   = "Test warehouse for Streamlit applications"
  }
}
```

## Prerequisites

Configure Snowflake provider authentication using environment variables:

```bash
export SNOWFLAKE_ACCOUNT="your_account"
export SNOWFLAKE_USER="your_user"
export SNOWFLAKE_PASSWORD="your_password"
export SNOWFLAKE_ROLE="your_role"
```

## Running the Example

```bash
terraform init
terraform plan
terraform apply
```

## Outputs

| Name | Description |
|------|-------------|
| warehouse_name | The name of the created warehouse |
| warehouse_fully_qualified_name | The fully qualified name of the warehouse |
| warehouse_size | The size of the warehouse |
| warehouse_state | The state of the warehouse (STARTED or SUSPENDED) |
