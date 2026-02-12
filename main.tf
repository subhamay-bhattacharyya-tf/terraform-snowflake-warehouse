# -----------------------------------------------------------------------------
# Terraform Snowflake Warehouse Module
# -----------------------------------------------------------------------------
# This module creates and manages Snowflake warehouses using a map-based
# configuration. It supports creating single or multiple warehouses with
# configurable sizes, auto-suspend, and scaling policies in a single module
# call.
# -----------------------------------------------------------------------------

resource "snowflake_warehouse" "this" {
  for_each = var.warehouse_configs

  name                      = each.value.name
  warehouse_size            = each.value.warehouse_size
  warehouse_type            = each.value.warehouse_type
  auto_resume               = each.value.auto_resume
  auto_suspend              = each.value.auto_suspend
  initially_suspended       = each.value.initially_suspended
  min_cluster_count         = each.value.min_cluster_count
  max_cluster_count         = each.value.max_cluster_count
  scaling_policy            = each.value.scaling_policy
  enable_query_acceleration = each.value.enable_query_acceleration
  comment                   = each.value.comment
}
