# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0](https://github.com/subhamay-bhattacharyya-tf/terraform-snowflake-warehouse/compare/v1.0.1...v2.0.0) (2026-02-10)

### ⚠ BREAKING CHANGES

* update Snowflake provider source to snowflakedb/snowflake
* update Snowflake provider source to snowflakedb/snowflake
* upgrade Snowflake provider to >= 0.99.0
* Provider changed from snowflakedb/snowflake to Snowflake-Labs/snowflake. Users must update their provider configuration.

- Update provider source from snowflakedb/snowflake to Snowflake-Labs/snowflake
- Bump minimum required version from >= 0.99.0 to >= 0.87.0
- Align with official Snowflake Labs provider namespace
* Provider changed from snowflakedb/snowflake to Snowflake-Labs/snowflake. Users must update their provider configuration.

- Integrate semantic-release plugins directly into CI workflow
- Remove standalone release.yaml workflow file
- Delete .kiro/specs/snowflake-warehouse-module documentation files
- Remove .terraform.lock.hcl lock file
- Delete utils/command.sh and utils/console-test.txt utility files
- Update snowflake-warehouse module configuration files
- Streamline CI/CD pipeline by consolidating release steps into main workflow

### Features

* update Snowflake provider source to snowflakedb/snowflake ([4ff43bf](https://github.com/subhamay-bhattacharyya-tf/terraform-snowflake-warehouse/commit/4ff43bf438dce65727dfbf4e362eeaa279f1efd4))
* update Snowflake provider source to snowflakedb/snowflake ([faaae65](https://github.com/subhamay-bhattacharyya-tf/terraform-snowflake-warehouse/commit/faaae65854568b6611d7ae64e81172d8befe37a1))
* update Snowflake provider to Snowflake-Labs/snowflake ([5245ec8](https://github.com/subhamay-bhattacharyya-tf/terraform-snowflake-warehouse/commit/5245ec8b45eaa5fa9d95a1872a12e619b0f1797d))
* update Snowflake provider to Snowflake-Labs/snowflake ([4eb40f6](https://github.com/subhamay-bhattacharyya-tf/terraform-snowflake-warehouse/commit/4eb40f687972847c3d9971da8e6390a6ad242258))
* upgrade Snowflake provider to >= 0.99.0 ([514c171](https://github.com/subhamay-bhattacharyya-tf/terraform-snowflake-warehouse/commit/514c17132586a7588e4613d93aca24e6b3e1fcae))

## [unreleased]

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
