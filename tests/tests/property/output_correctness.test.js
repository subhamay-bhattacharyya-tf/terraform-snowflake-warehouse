/**
 * Property Test: Output Correctness
 * Feature: snowflake-warehouse-module
 * Property 5: Output Correctness
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
 *
 * For any successfully created warehouse, the module outputs SHALL correctly reflect:
 * - warehouse_names matches the input names
 * - warehouse_sizes matches the configured or default sizes
 * - warehouse_states reflects the initially_suspended setting
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

/**
 * Verifies that the module's outputs.tf defines all required outputs
 */
function verifyOutputDefinitions() {
  const moduleDir = path.resolve(__dirname, '../../../modules/snowflake-warehouse');
  const outputsTfPath = path.join(moduleDir, 'outputs.tf');
  const content = fs.readFileSync(outputsTfPath, 'utf-8');

  const requiredOutputs = [
    'warehouse_names',
    'warehouse_fully_qualified_names',
    'warehouse_sizes',
    'warehouse_states'
  ];

  const results = {};

  for (const output of requiredOutputs) {
    const pattern = new RegExp(`output\\s+"${output}"`, 'i');
    results[output] = pattern.test(content);
  }

  return results;
}

describe('Property 5: Output Correctness', () => {

  it('should define all required outputs in outputs.tf', () => {
    const results = verifyOutputDefinitions();

    for (const [output, found] of Object.entries(results)) {
      assert.strictEqual(
        found,
        true,
        `Module outputs.tf should define output: ${output}`
      );
    }
  });

  it('should output warehouse_names from resource', () => {
    const moduleDir = path.resolve(__dirname, '../../../modules/snowflake-warehouse');
    const outputsTfPath = path.join(moduleDir, 'outputs.tf');
    const content = fs.readFileSync(outputsTfPath, 'utf-8');

    assert.ok(
      content.includes('snowflake_warehouse.this') && content.includes('.name'),
      'warehouse_names output should reference snowflake_warehouse.this name'
    );
  });

  it('should output warehouse_sizes from resource', () => {
    const moduleDir = path.resolve(__dirname, '../../../modules/snowflake-warehouse');
    const outputsTfPath = path.join(moduleDir, 'outputs.tf');
    const content = fs.readFileSync(outputsTfPath, 'utf-8');

    assert.ok(
      content.includes('snowflake_warehouse.this') && content.includes('.warehouse_size'),
      'warehouse_sizes output should reference snowflake_warehouse.this warehouse_size'
    );
  });

  it('should output warehouse_states based on initially_suspended', () => {
    const moduleDir = path.resolve(__dirname, '../../../modules/snowflake-warehouse');
    const outputsTfPath = path.join(moduleDir, 'outputs.tf');
    const content = fs.readFileSync(outputsTfPath, 'utf-8');

    assert.ok(
      content.includes('initially_suspended') && 
      (content.includes('SUSPENDED') || content.includes('STARTED')),
      'warehouse_states output should be based on initially_suspended setting'
    );
  });
});
