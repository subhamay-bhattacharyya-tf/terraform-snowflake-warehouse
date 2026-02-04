/**
 * Property Test: Invalid Input Rejection
 * Feature: snowflake-warehouse-module
 * Property 4: Invalid Input Rejection
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
 *
 * For any warehouse configuration object that violates any of the following constraints:
 * - name is empty or null
 * - warehouse_size is not in the valid sizes list
 * - warehouse_type is not in the valid types list
 * - scaling_policy is not in the valid policies list
 * - auto_suspend < 0
 * - min_cluster_count > max_cluster_count
 *
 * The module SHALL reject the configuration with a descriptive validation error.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fc = require('fast-check');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Valid warehouse sizes as per Snowflake documentation (limited to cost-effective sizes)
const VALID_WAREHOUSE_SIZES = [
  'X-SMALL', 'XSMALL', 'SMALL', 'MEDIUM', 'LARGE'
];

// Valid warehouse types (limited to cost-effective types)
const VALID_WAREHOUSE_TYPES = ['STANDARD'];

// Valid scaling policies
const VALID_SCALING_POLICIES = ['STANDARD', 'ECONOMY'];

// ============================================================================
// INVALID INPUT ARBITRARIES
// ============================================================================

// Arbitrary for empty name (Requirement 3.1)
const emptyNameArb = fc.constant('');

// Arbitrary for invalid warehouse size (Requirement 3.2)
const invalidWarehouseSizeArb = fc.stringMatching(/^[A-Z]{2,10}$/)
  .filter(s => !VALID_WAREHOUSE_SIZES.includes(s.toUpperCase()));

// Arbitrary for invalid warehouse type (Requirement 3.3)
const invalidWarehouseTypeArb = fc.stringMatching(/^[A-Z]{3,15}$/)
  .filter(s => !VALID_WAREHOUSE_TYPES.includes(s.toUpperCase()));

// Arbitrary for invalid scaling policy (Requirement 3.4)
const invalidScalingPolicyArb = fc.stringMatching(/^[A-Z]{3,12}$/)
  .filter(s => !VALID_SCALING_POLICIES.includes(s.toUpperCase()));

// Arbitrary for negative auto_suspend (Requirement 3.5)
const negativeAutoSuspendArb = fc.integer({ min: -1000, max: -1 });

// Arbitrary for invalid cluster counts where min > max (Requirement 3.6)
const invalidClusterCountsArb = fc.tuple(
  fc.integer({ min: 2, max: 10 }),
  fc.integer({ min: 1, max: 9 })
).filter(([min, max]) => min > max);

/**
 * Creates a temporary Terraform configuration for testing
 */
function createTestTerraformConfig(config) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'terraform-test-'));
  const moduleDir = path.resolve(__dirname, '../../../modules/snowflake-warehouse');

  // Filter out null comment
  const configForJson = { ...config };
  if (configForJson.comment === null || configForJson.comment === undefined) {
    delete configForJson.comment;
  }

  // Use map format with warehouse key
  const warehouseConfigs = {
    test_wh: configForJson
  };

  const mainTf = `
terraform {
  required_version = ">= 1.3.0"
}

module "warehouses" {
  source = "${moduleDir.replace(/\\/g, '/')}"

  warehouse_configs = ${JSON.stringify(warehouseConfigs, null, 2)}
}
`;

  fs.writeFileSync(path.join(tempDir, 'main.tf'), mainTf);
  return tempDir;
}

/**
 * Runs terraform init and validate on a directory
 * Returns success status and error message
 */
function validateTerraformConfig(tempDir) {
  try {
    execSync('terraform init -backend=false', {
      cwd: tempDir,
      stdio: 'pipe',
      encoding: 'utf-8'
    });

    execSync('terraform validate', {
      cwd: tempDir,
      stdio: 'pipe',
      encoding: 'utf-8'
    });

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.stderr || error.message };
  }
}

/**
 * Cleanup temporary directory
 */
function cleanup(tempDir) {
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (e) {
    // Ignore cleanup errors
  }
}

/**
 * Creates a base valid config that can be modified with invalid values
 */
function createBaseValidConfig() {
  return {
    name: 'TEST_WAREHOUSE',
    warehouse_size: 'X-SMALL',
    warehouse_type: 'STANDARD',
    auto_resume: true,
    auto_suspend: 60,
    initially_suspended: true,
    min_cluster_count: 1,
    max_cluster_count: 1,
    scaling_policy: 'STANDARD',
    enable_query_acceleration: false
  };
}

describe('Property 4: Invalid Input Rejection', () => {

  it('should reject configurations with empty name (Requirement 3.1)', () => {
    fc.assert(
      fc.property(emptyNameArb, (emptyName) => {
        const config = { ...createBaseValidConfig(), name: emptyName };
        const tempDir = createTestTerraformConfig(config);
        try {
          const result = validateTerraformConfig(tempDir);
          assert.strictEqual(
            result.success,
            false,
            `terraform validate should fail for empty name`
          );
          assert.ok(
            result.error.includes('Warehouse name must not be empty'),
            `Error message should mention empty name. Got: ${result.error}`
          );
        } finally {
          cleanup(tempDir);
        }
      }),
      { numRuns: 1, verbose: true }
    );
  });

  it('should reject configurations with invalid warehouse_size (Requirement 3.2)', () => {
    fc.assert(
      fc.property(invalidWarehouseSizeArb, (invalidSize) => {
        const config = { ...createBaseValidConfig(), warehouse_size: invalidSize };
        const tempDir = createTestTerraformConfig(config);
        try {
          const result = validateTerraformConfig(tempDir);
          assert.strictEqual(
            result.success,
            false,
            `terraform validate should fail for invalid warehouse_size: ${invalidSize}`
          );
          assert.ok(
            result.error.includes('Invalid warehouse_size'),
            `Error message should mention invalid warehouse_size. Got: ${result.error}`
          );
        } finally {
          cleanup(tempDir);
        }
      }),
      { numRuns: 3, verbose: true }
    );
  });

  it('should reject configurations with invalid warehouse_type (Requirement 3.3)', () => {
    fc.assert(
      fc.property(invalidWarehouseTypeArb, (invalidType) => {
        const config = { ...createBaseValidConfig(), warehouse_type: invalidType };
        const tempDir = createTestTerraformConfig(config);
        try {
          const result = validateTerraformConfig(tempDir);
          assert.strictEqual(
            result.success,
            false,
            `terraform validate should fail for invalid warehouse_type: ${invalidType}`
          );
          assert.ok(
            result.error.includes('Invalid warehouse_type'),
            `Error message should mention invalid warehouse_type. Got: ${result.error}`
          );
        } finally {
          cleanup(tempDir);
        }
      }),
      { numRuns: 3, verbose: true }
    );
  });

  it('should reject configurations with invalid scaling_policy (Requirement 3.4)', () => {
    fc.assert(
      fc.property(invalidScalingPolicyArb, (invalidPolicy) => {
        const config = { ...createBaseValidConfig(), scaling_policy: invalidPolicy };
        const tempDir = createTestTerraformConfig(config);
        try {
          const result = validateTerraformConfig(tempDir);
          assert.strictEqual(
            result.success,
            false,
            `terraform validate should fail for invalid scaling_policy: ${invalidPolicy}`
          );
          assert.ok(
            result.error.includes('Invalid scaling_policy'),
            `Error message should mention invalid scaling_policy. Got: ${result.error}`
          );
        } finally {
          cleanup(tempDir);
        }
      }),
      { numRuns: 3, verbose: true }
    );
  });

  it('should reject configurations with negative auto_suspend (Requirement 3.5)', () => {
    fc.assert(
      fc.property(negativeAutoSuspendArb, (negativeValue) => {
        const config = { ...createBaseValidConfig(), auto_suspend: negativeValue };
        const tempDir = createTestTerraformConfig(config);
        try {
          const result = validateTerraformConfig(tempDir);
          assert.strictEqual(
            result.success,
            false,
            `terraform validate should fail for negative auto_suspend: ${negativeValue}`
          );
          assert.ok(
            result.error.includes('auto_suspend must be >= 0'),
            `Error message should mention auto_suspend constraint. Got: ${result.error}`
          );
        } finally {
          cleanup(tempDir);
        }
      }),
      { numRuns: 3, verbose: true }
    );
  });

  it('should reject configurations where min_cluster_count > max_cluster_count (Requirement 3.6)', () => {
    fc.assert(
      fc.property(invalidClusterCountsArb, ([minCount, maxCount]) => {
        const config = {
          ...createBaseValidConfig(),
          min_cluster_count: minCount,
          max_cluster_count: maxCount
        };
        const tempDir = createTestTerraformConfig(config);
        try {
          const result = validateTerraformConfig(tempDir);
          assert.strictEqual(
            result.success,
            false,
            `terraform validate should fail when min_cluster_count (${minCount}) > max_cluster_count (${maxCount})`
          );
          assert.ok(
            result.error.includes('min_cluster_count must not exceed max_cluster_count'),
            `Error message should mention cluster count constraint. Got: ${result.error}`
          );
        } finally {
          cleanup(tempDir);
        }
      }),
      { numRuns: 3, verbose: true }
    );
  });
});
