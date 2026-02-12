# -----------------------------------------------------------------------------
# Terraform Snowflake Warehouse Module - Multiple Warehouses Example
# -----------------------------------------------------------------------------
# This example demonstrates how to use the snowflake-warehouse module
# to create multiple Snowflake warehouses using a map of configurations.
# -----------------------------------------------------------------------------

module "warehouses" {
  source = "../.."

  warehouse_configs = var.warehouse_configs
}
