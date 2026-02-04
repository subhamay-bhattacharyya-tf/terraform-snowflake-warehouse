/**
 * Property Test: Default Value Application
 * Feature: snowflake-warehouse-module
 * Property 2: Default Value Application
 * **Validates: Requirements 1.3**
 *
 * For any warehouse configuration object with omitted optional properties,
 * the module SHALL apply the specified default values:
 * - warehouse_size = "X-SMALL"
 * - warehouse_type = "STANDARD"
 * - auto_resume = true
 * - auto_suspend = 60
 * - initially_suspended = true
 * - min_cluster_count = 1
 * - max_cluster_count = 1
 * - scaling_policy = "STANDARD"
 * - enable_query_acceleration = false
 * - comment = null
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fc = require('fast-check');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Expected default values as defined in variables.tf
const EXPECTED_DEFAULTS = {
  warehouse_size: 'X-SMALL',
  warehouse_type: 'STANDARD',
  auto_resume: true,
  auto_suspend: 60,
  initially_suspended: true,
  min_cluster_count: 1,
  max_cluster_count: 1,
  scaling_policy: 'STANDARD',
  enable_query_acceleration: false,
  comment: null
};

// All optional properties that can be omitted
const OPTIONAL_PROPERTIES = Object.keys(EXPECTED_DEFAULTS);

// Arbitrary for valid warehouse name (required property)
const validNameArb = fc.stringMatching(/^[A-Z][A-Z0-9_]{0,20}$/);

// Arbitrary for subset of optional properties to omit
const omittedPropertiesArb = fc.subarray(OPTIONAL_PROPERTIES, { minLength: 1 });

/**
 * Creates a temporary Terraform configuration for testing (validation only)
 */
function createTestTerraformConfig(config) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'terraform-test-'));
  const moduleDir = path.resolve(__dirname, '../../../modules/snowflake-warehouse');

  // Use map format with warehouse key
  const warehouseConfigs = {
    test_wh: config
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
 * Runs terraform init and validate
 */
function runTerraformValidate(tempDir) {
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
 * Verifies that the module's variables.tf defines the expected default values
 */
function verifyDefaultValuesInVariablesTf() {
  const moduleDir = path.resolve(__dirname, '../../../modules/snowflake-warehouse');
  const variablesTfPath = path.join(moduleDir, 'variables.tf');
  const content = fs.readFileSync(variablesTfPath, 'utf-8');

  const results = {};

  // Check each expected default value
  for (const [prop, expectedDefault] of Object.entries(EXPECTED_DEFAULTS)) {
    let pattern;
    if (expectedDefault === null) {
      pattern = new RegExp(`${prop}\\s*=\\s*optional\\s*\\([^,]+,\\s*null\\s*\\)`, 'i');
    } else if (typeof expectedDefault === 'boolean') {
      pattern = new RegExp(`${prop}\\s*=\\s*optional\\s*\\([^,]+,\\s*${expectedDefault}\\s*\\)`, 'i');
    } else if (typeof expectedDefault === 'number') {
      pattern = new RegExp(`${prop}\\s*=\\s*optional\\s*\\([^,]+,\\s*${expectedDefault}\\s*\\)`, 'i');
    } else {
      pattern = new RegExp(`${prop}\\s*=\\s*optional\\s*\\([^,]+,\\s*"${expectedDefault}"\\s*\\)`, 'i');
    }

    results[prop] = {
      found: pattern.test(content),
      expected: expectedDefault
    };
  }

  return results;
}

describe('Property 2: Default Value Application', () => {

  it('should have all expected default values defined in variables.tf', () => {
    const results = verifyDefaultValuesInVariablesTf();

    for (const [prop, result] of Object.entries(results)) {
      assert.strictEqual(
        result.found,
        true,
        `Default value for ${prop} should be ${JSON.stringify(result.expected)} in variables.tf`
      );
    }
  });

  it('should accept configurations with only required name property (all defaults applied)', () => {
    fc.assert(
      fc.property(validNameArb, (name) => {
        // Create config with only the required name property
        // All optional properties should use their defaults
        const config = { name };

        const tempDir = createTestTerraformConfig(config);
        try {
          const result = runTerraformValidate(tempDir);

          // Terraform should accept the config (validation passes with defaults)
          assert.strictEqual(
            result.success,
            true,
            `terraform validate should succeed when only name is provided. Error: ${result.error}`
          );
        } finally {
          cleanup(tempDir);
        }
      }),
      { numRuns: 100, verbose: true }
    );
  });

  it('should accept configurations with partial optional properties (remaining use defaults)', () => {
    fc.assert(
      fc.property(
        validNameArb,
        omittedPropertiesArb,
        (name, omittedProps) => {
          // Create config with name and some optional properties
          // Properties in omittedProps will use defaults
          const config = { name };

          // Add some properties that are NOT in omittedProps
          for (const prop of OPTIONAL_PROPERTIES) {
            if (!omittedProps.includes(prop)) {
              config[prop] = EXPECTED_DEFAULTS[prop];
            }
          }

          const tempDir = createTestTerraformConfig(config);
          try {
            const result = runTerraformValidate(tempDir);

            assert.strictEqual(
              result.success,
              true,
              `terraform validate should succeed with partial config. Omitted: ${omittedProps.join(', ')}. Error: ${result.error}`
            );
          } finally {
            cleanup(tempDir);
          }
        }
      ),
      { numRuns: 50, verbose: true }
    );
  });

  it('should have correct default value types in variables.tf', () => {
    const moduleDir = path.resolve(__dirname, '../../../modules/snowflake-warehouse');
    const variablesTfPath = path.join(moduleDir, 'variables.tf');
    const content = fs.readFileSync(variablesTfPath, 'utf-8');

    // Verify string defaults are quoted
    assert.ok(
      content.includes('optional(string, "X-SMALL")'),
      'warehouse_size default should be "X-SMALL"'
    );
    assert.ok(
      content.includes('optional(string, "STANDARD")'),
      'warehouse_type and scaling_policy defaults should be "STANDARD"'
    );

    // Verify boolean defaults
    assert.ok(
      content.includes('optional(bool, true)'),
      'auto_resume and initially_suspended defaults should be true'
    );
    assert.ok(
      content.includes('optional(bool, false)'),
      'enable_query_acceleration default should be false'
    );

    // Verify number defaults
    assert.ok(
      content.includes('optional(number, 60)'),
      'auto_suspend default should be 60'
    );
    assert.ok(
      content.includes('optional(number, 1)'),
      'cluster count defaults should be 1'
    );

    // Verify null default for comment
    assert.ok(
      content.includes('optional(string, null)'),
      'comment default should be null'
    );
  });
});
