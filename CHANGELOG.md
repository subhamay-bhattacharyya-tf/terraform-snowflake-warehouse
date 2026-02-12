# Changelog

All notable changes to this project will be documented in this file.

## [2.1.0](https://github.com/subhamay-bhattacharyya-tf/terraform-snowflake-warehouse/compare/v2.0.0...v2.1.0) (2026-02-12)

### Features

* refactor repository to single module layout ([28709db](https://github.com/subhamay-bhattacharyya-tf/terraform-snowflake-warehouse/commit/28709db2f85a2d3bb19bec382b9659173ac5c3f8))

### Bug Fixes

* standardize Terraform file headers and comments ([5b5a9d8](https://github.com/subhamay-bhattacharyya-tf/terraform-snowflake-warehouse/commit/5b5a9d8d782b1de0451e06f824f44fe70bbc0a1c))

## [unreleased]

### 🚀 Features

- Refactor repository to single module layout

### 🐛 Bug Fixes

- Standardize Terraform file headers and comments

### 📚 Documentation

- Update CHANGELOG.md [skip ci]
- Update CHANGELOG.md [skip ci]

### ⚙️ Miscellaneous Tasks

- Update gitignore to exclude macOS system files
- Update gitignore to exclude utils directory
## [2.0.0] - 2026-02-10

### 🚀 Features

- [**breaking**] Update Snowflake provider to Snowflake-Labs/snowflake
- [**breaking**] Update Snowflake provider to Snowflake-Labs/snowflake
- [**breaking**] Upgrade Snowflake provider to >= 0.99.0
- [**breaking**] Update Snowflake provider source to snowflakedb/snowflake
- [**breaking**] Update Snowflake provider source to snowflakedb/snowflake

### 📚 Documentation

- Update CHANGELOG.md [skip ci]
- Update CHANGELOG.md [skip ci]
- Update CHANGELOG.md [skip ci]
- Update CHANGELOG.md [skip ci]
- Update CHANGELOG.md [skip ci]

### ⚙️ Miscellaneous Tasks

- *(release)* Version 2.0.0 [skip ci]
## [1.0.1] - 2026-02-06

### 🐛 Bug Fixes

- *(snowflake)* Update JWT authenticator to SNOWFLAKE_JWT and remove extra blank line

### 🚜 Refactor

- *(test)* Migrate to gosnowflake config builder for JWT authentication
- *(test)* Improve warehouse property fetching and remove extra blank line

### 📚 Documentation

- Update CHANGELOG.md [skip ci]
- Update CHANGELOG.md [skip ci]
- Update CHANGELOG.md [skip ci]
- Update CHANGELOG.md [skip ci]
- Update CHANGELOG.md [skip ci]
- Update CHANGELOG.md [skip ci]
- Update CHANGELOG.md [skip ci]
- Update CHANGELOG.md [skip ci]

### 🎨 Styling

- *(snowflake-warehouse)* Add blank line after module header comment

### ⚙️ Miscellaneous Tasks

- *(testing)* Migrate from Jest to Terratest and restructure examples
- *(github-actions)* Migrate authentication to key-pair and remove property tests
- *(github-actions)* Enhance Terratest output visibility and remove conditional gate
- *(test)* Update Go dependencies and add go.sum
- *(testing)* Migrate to key-pair authentication and add go mod tidy
- *(github-actions)* Add pipefail option to Terratest commands and update Snowflake provider source
- *(release)* Version 1.0.1 [skip ci]
## [1.0.0] - 2026-02-04

### 🚀 Features

- *(snowflake-warehouse)* Support multiple warehouses via map configuration

### 🚜 Refactor

- Restructure project to modular Terraform architecture

### 📚 Documentation

- *(readme)* Update badges to reflect Snowflake focus
- Update CHANGELOG.md [skip ci]

### 🎨 Styling

- *(snowflake-warehouse)* Add periods to output descriptions

### ⚙️ Miscellaneous Tasks

- *(github-actions)* Add permissions and token for changelog generation
- *(release)* Version 1.0.0 [skip ci]
