/**
 * Property Test: Valid Input Acceptance
 * Feature: snowflake-warehouse-module
 * Property 3: Valid Input Acceptance
 * **Validates: Requirements 1.1, 2.1**
 *
 * For any warehouse configuration object where:
 * - name is a non-empty string
 * - warehouse_size is a valid size enum
 * - warehouse_type is a valid type enum
 * - scaling_policy is a valid policy enum
 * - auto_suspend >= 0
 * - min_cluster_count <= max_cluster_count
 *
 * The module SHALL accept the configuration without validation errors.
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

// Arbitrary for valid warehouse name (non-empty, alphanumeric with underscores)
const validNameArb = fc.stringMatching(/^[A-Z][A-Z0-9_]{0,20}$/);

// Arbitrary for valid warehouse size
const validWarehouseSizeArb = fc.constantFrom(...VALID_WAREHOUSE_SIZES);

// Arbitrary for valid warehouse type
const validWarehouseTypeArb = fc.constantFrom(...VALID_WAREHOUSE_TYPES);

// Arbitrary for valid scaling policy
const validScalingPolicyArb = fc.constantFrom(...VALID_SCALING_POLICIES);

// Arbitrary for valid auto_suspend (>= 0)
const validAutoSuspendArb = fc.integer({ min: 0, max: 3600 });

// Arbitrary for valid cluster counts (min <= max)
const validClusterCountsArb = fc.tuple(
  fc.integer({ min: 1, max: 10 }),
  fc.integer({ min: 1, max: 10 })
).map(([a, b]) => [Math.min(a, b), Math.max(a, b)]);

// Arbitrary for optional comment
const optionalCommentArb = fc.option(
  fc.stringMatching(/^[A-Za-z0-9 ]{0,50}$/),
  { nil: null }
);


// Arbitrary for complete valid warehouse configuration
const validWarehouseConfigArb = fc.record({
  name: validNameArb,
  warehouse_size: validWarehouseSizeArb,
  warehouse_type: validWarehouseTypeArb,
  auto_resume: fc.boolean(),
  auto_suspend: validAutoSuspendArb,
  initially_suspended: fc.boolean(),
  cluster_counts: validClusterCountsArb,
  scaling_policy: validScalingPolicyArb,
  enable_query_acceleration: fc.boolean(),
  comment: optionalCommentArb
}).map(config => ({
  name: config.name,
  warehouse_size: config.warehouse_size,
  warehouse_type: config.warehouse_type,
  auto_resume: config.auto_resume,
  auto_suspend: config.auto_suspend,
  initially_suspended: config.initially_suspended,
  min_cluster_count: config.cluster_counts[0],
  max_cluster_count: config.cluster_counts[1],
  scaling_policy: config.scaling_policy,
  enable_query_acceleration: config.enable_query_acceleration,
  comment: config.comment
}));

/**
 * Creates a temporary Terraform configuration for testing
 */
function createTestTerraformConfig(config) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'terraform-test-'));
  const moduleDir = path.resolve(__dirname, '../../../modules/snowflake-warehouse');

  // Filter out null comment
  const configForJson = { ...config };
  if (configForJson.comment === null) {
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
    return { success: false, error: error.message };
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

describe('Property 3: Valid Input Acceptance', () => {
  it('should accept any valid warehouse configuration without validation errors', () => {
    fc.assert(
      fc.property(validWarehouseConfigArb, (config) => {
        const tempDir = createTestTerraformConfig(config);
        try {
          const result = validateTerraformConfig(tempDir);
          assert.strictEqual(
            result.success,
            true,
            `terraform validate should succeed for valid config: ${JSON.stringify(config)}\nError: ${result.error}`
          );
        } finally {
          cleanup(tempDir);
        }
      }),
      { numRuns: 10, verbose: true }
    );
  });
});
