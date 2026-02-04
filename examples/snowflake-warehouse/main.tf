# Example: Snowflake Warehouse Module Usage
#
# This example demonstrates how to use the snowflake-warehouse module
# to create multiple Snowflake warehouses using a map of configurations.

locals {
  warehouses = {
    "adhoc_wh" = {
      name                      = "SNOW_TEST_ADHOC_WH"
      warehouse_size            = "X-SMALL"
      warehouse_type            = "STANDARD"
      auto_resume               = true
      auto_suspend              = 60
      initially_suspended       = true
      min_cluster_count         = 1
      max_cluster_count         = 1
      scaling_policy            = "STANDARD"
      enable_query_acceleration = false
      comment                   = "Development and sandbox warehouse for ad-hoc queries, experimentation, troubleshooting, and testing."
    }
    "load_wh" = {
      name                      = "SNOW_TEST_LOAD_WH"
      warehouse_size            = "X-SMALL"
      warehouse_type            = "STANDARD"
      auto_resume               = true
      auto_suspend              = 60
      initially_suspended       = true
      min_cluster_count         = 1
      max_cluster_count         = 1
      scaling_policy            = "STANDARD"
      enable_query_acceleration = false
      comment                   = "Dedicated ingestion warehouse for loading files from stages into Bronze tables using COPY operations and batch loads."
    }
    "streamlit_wh" = {
      name                      = "SNOW_TEST_STREAMLIT_WH"
      warehouse_size            = "X-SMALL"
      warehouse_type            = "STANDARD"
      auto_resume               = true
      auto_suspend              = 60
      initially_suspended       = true
      min_cluster_count         = 1
      max_cluster_count         = 1
      scaling_policy            = "STANDARD"
      enable_query_acceleration = false
      comment                   = "Lightweight warehouse optimized for low-latency dashboard queries and interactive Streamlit app usage."
    }
    "transform_wh" = {
      name                      = "SNOW_TEST_TRANSFORM_WH"
      warehouse_size            = "X-SMALL"
      warehouse_type            = "STANDARD"
      auto_resume               = true
      auto_suspend              = 60
      initially_suspended       = true
      min_cluster_count         = 1
      max_cluster_count         = 1
      scaling_policy            = "STANDARD"
      enable_query_acceleration = false
      comment                   = "ETL/ELT warehouse for heavy SQL transformations, merges, joins, and pipeline processing from Bronze → Silver → Gold."
    }
  }
}

module "warehouses" {
  source = "../../modules/snowflake-warehouse"

  warehouse_configs = local.warehouses
}
