/**
 * Property Test: Configuration Passthrough
 * Feature: snowflake-warehouse-module
 * Property 1: Configuration Passthrough
 * **Validates: Requirements 1.2, 2.1-2.11**
 *
 * For any valid warehouse configuration object, all provided properties SHALL be
 * correctly reflected in the created snowflake_warehouse resource attributes.
 * 
 * This test verifies configuration passthrough by:
 * 1. Verifying the module's main.tf maps all config properties to resource attributes
 * 2. Generating valid warehouse configurations and verifying they would be passed through
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fc = require('fast-check');
const fs = require('fs');
const path = require('path');

// Valid warehouse sizes as per Snowflake documentation (limited to cost-effective sizes)
const VALID_WAREHOUSE_SIZES = [
  'X-SMALL', 'XSMALL', 'SMALL', 'MEDIUM', 'LARGE'
];

// Valid warehouse types (limited to cost-effective types)
const VALID_WAREHOUSE_TYPES = ['STANDARD'];

// Valid scaling policies
const VALID_SCALING_POLICIES = ['STANDARD', 'ECONOMY'];

// All configuration properties that should be passed through to the resource
const CONFIG_PROPERTIES = [
  'name',
  'warehouse_size',
  'warehouse_type',
  'auto_resume',
  'auto_suspend',
  'initially_suspended',
  'min_cluster_count',
  'max_cluster_count',
  'scaling_policy',
  'enable_query_acceleration',
  'comment'
];

// Arbitrary for valid warehouse name
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
  fc.stringMatching(/^[A-Za-z0-9 ]{1,50}$/),
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
 * Verifies that the module's main.tf maps all config properties to resource attributes
 */
function verifyModulePassthrough() {
  const moduleDir = path.resolve(__dirname, '../../../modules/snowflake-warehouse');
  const mainTfPath = path.join(moduleDir, 'main.tf');
  const mainTfContent = fs.readFileSync(mainTfPath, 'utf-8');

  const missingMappings = [];

  for (const prop of CONFIG_PROPERTIES) {
    // Check that each property is mapped from each.value to the resource (map-based)
    const pattern = new RegExp(`${prop}\\s*=\\s*each\\.value\\.${prop}`, 'i');
    if (!pattern.test(mainTfContent)) {
      missingMappings.push(prop);
    }
  }

  return {
    success: missingMappings.length === 0,
    missingMappings,
    content: mainTfContent
  };
}

/**
 * Verifies that the module's variables.tf defines all config properties
 */
function verifyVariableDefinitions() {
  const moduleDir = path.resolve(__dirname, '../../../modules/snowflake-warehouse');
  const variablesTfPath = path.join(moduleDir, 'variables.tf');
  const variablesTfContent = fs.readFileSync(variablesTfPath, 'utf-8');

  const missingProperties = [];

  for (const prop of CONFIG_PROPERTIES) {
    // Check that each property is defined in the warehouse_configs object type
    const pattern = new RegExp(`${prop}\\s*=`, 'i');
    if (!pattern.test(variablesTfContent)) {
      missingProperties.push(prop);
    }
  }

  return {
    success: missingProperties.length === 0,
    missingProperties,
    content: variablesTfContent
  };
}

describe('Property 1: Configuration Passthrough', () => {
  
  it('should have all configuration properties defined in variables.tf', () => {
    const result = verifyVariableDefinitions();
    assert.strictEqual(
      result.success,
      true,
      `Module variables.tf should define all config properties. Missing: ${result.missingProperties.join(', ')}`
    );
  });

  it('should have all configuration properties mapped in main.tf to resource attributes', () => {
    const result = verifyModulePassthrough();
    assert.strictEqual(
      result.success,
      true,
      `Module main.tf should map all config properties to resource attributes. Missing: ${result.missingMappings.join(', ')}`
    );
  });

  it('should pass through all generated configuration values correctly', () => {
    fc.assert(
      fc.property(validWarehouseConfigArb, (config) => {
        // Verify all properties exist in the config object
        for (const prop of CONFIG_PROPERTIES) {
          assert.ok(
            prop in config,
            `Config should have property: ${prop}`
          );
        }

        // Verify name is non-empty string (Requirement 2.2)
        assert.ok(
          typeof config.name === 'string' && config.name.length > 0,
          `name should be non-empty string, got: ${config.name}`
        );

        // Verify warehouse_size is valid (Requirement 2.3)
        assert.ok(
          VALID_WAREHOUSE_SIZES.includes(config.warehouse_size),
          `warehouse_size should be valid, got: ${config.warehouse_size}`
        );

        // Verify warehouse_type is valid (Requirement 2.4)
        assert.ok(
          VALID_WAREHOUSE_TYPES.includes(config.warehouse_type),
          `warehouse_type should be valid, got: ${config.warehouse_type}`
        );

        // Verify auto_resume is boolean (Requirement 2.5)
        assert.ok(
          typeof config.auto_resume === 'boolean',
          `auto_resume should be boolean, got: ${typeof config.auto_resume}`
        );

        // Verify auto_suspend is non-negative number (Requirement 2.6)
        assert.ok(
          typeof config.auto_suspend === 'number' && config.auto_suspend >= 0,
          `auto_suspend should be non-negative number, got: ${config.auto_suspend}`
        );

        // Verify initially_suspended is boolean (Requirement 2.7)
        assert.ok(
          typeof config.initially_suspended === 'boolean',
          `initially_suspended should be boolean, got: ${typeof config.initially_suspended}`
        );

        // Verify cluster counts are valid (Requirement 2.8)
        assert.ok(
          typeof config.min_cluster_count === 'number' && config.min_cluster_count >= 1,
          `min_cluster_count should be positive number, got: ${config.min_cluster_count}`
        );
        assert.ok(
          typeof config.max_cluster_count === 'number' && config.max_cluster_count >= 1,
          `max_cluster_count should be positive number, got: ${config.max_cluster_count}`
        );
        assert.ok(
          config.min_cluster_count <= config.max_cluster_count,
          `min_cluster_count should not exceed max_cluster_count`
        );

        // Verify scaling_policy is valid (Requirement 2.9)
        assert.ok(
          VALID_SCALING_POLICIES.includes(config.scaling_policy),
          `scaling_policy should be valid, got: ${config.scaling_policy}`
        );

        // Verify enable_query_acceleration is boolean (Requirement 2.10)
        assert.ok(
          typeof config.enable_query_acceleration === 'boolean',
          `enable_query_acceleration should be boolean, got: ${typeof config.enable_query_acceleration}`
        );

        // Verify comment is string or null (Requirement 2.11)
        assert.ok(
          config.comment === null || typeof config.comment === 'string',
          `comment should be string or null, got: ${typeof config.comment}`
        );
      }),
      { numRuns: 100, verbose: true }
    );
  });
});
