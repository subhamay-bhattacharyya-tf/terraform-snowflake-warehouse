# Example: Single Snowflake Warehouse
#
# This example demonstrates how to use the snowflake-warehouse module
# to create a single Snowflake warehouse.

module "warehouse" {
  source = "../.."

  warehouse_configs = var.warehouse_configs
}
