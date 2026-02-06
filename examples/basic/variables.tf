variable "warehouse_configs" {
  description = "Map of configuration objects for Snowflake warehouses"
  type = map(object({
    name                      = string
    warehouse_size            = optional(string, "X-SMALL")
    warehouse_type            = optional(string, "STANDARD")
    auto_resume               = optional(bool, true)
    auto_suspend              = optional(number, 60)
    initially_suspended       = optional(bool, true)
    min_cluster_count         = optional(number, 1)
    max_cluster_count         = optional(number, 1)
    scaling_policy            = optional(string, "STANDARD")
    enable_query_acceleration = optional(bool, false)
    comment                   = optional(string, null)
  }))
  default = {}
}
