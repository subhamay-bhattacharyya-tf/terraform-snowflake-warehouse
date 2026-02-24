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

# -----------------------------------------------------------------------------
# Warehouse Grants
# -----------------------------------------------------------------------------
# Flatten the grants from all warehouse configs into a map for for_each
locals {
  warehouse_grants = merge([
    for wh_key, wh in var.warehouse_configs : {
      for grant in wh.grants : "${wh_key}_${grant.role_name}" => {
        warehouse_key  = wh_key
        warehouse_name = wh.name
        role_name      = grant.role_name
        privileges     = grant.privileges
      }
    }
  ]...)
}

resource "snowflake_grant_privileges_to_account_role" "warehouse" {
  for_each = local.warehouse_grants

  account_role_name = each.value.role_name
  privileges        = each.value.privileges
  on_account_object {
    object_type = "WAREHOUSE"
    object_name = snowflake_warehouse.this[each.value.warehouse_key].name
  }
}
