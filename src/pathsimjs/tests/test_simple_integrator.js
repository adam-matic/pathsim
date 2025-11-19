/**
 * JavaScript Test: Simple Integrator
 * Compares JavaScript implementation against Python reference
 */

import { readFileSync } from 'fs';
import { Simulation, Connection } from '../index.js';
import { Constant, Integrator, Scope } from '../blocks/index.js';
import { SSPRK22 } from '../solvers/index.js';

// Load Python reference data
const referenceData = JSON.parse(
    readFileSync('src/pathsimjs/tests/test_simple_integrator_python.json', 'utf-8')
);

console.log('='.repeat(70));
console.log('JavaScript Test: Simple Integrator');
console.log('='.repeat(70));
console.log();

// Extract parameters from reference
const params = referenceData.parameters;
console.log('Test parameters:');
console.log(`  Constant value: ${params.constant_value}`);
console.log(`  Initial value: ${params.initial_value}`);
console.log(`  Timestep (dt): ${params.dt}`);
console.log(`  Duration: ${params.duration}`);
console.log(`  Solver: ${params.solver}`);
console.log();

// Create blocks (matching Python setup)
const constant = new Constant(params.constant_value);
const integrator = new Integrator(params.initial_value);
const scope = new Scope({ labels: ['output'], numInputs: 1 });

// Create simulation
const sim = new Simulation({
    blocks: [constant, integrator, scope],
    connections: [
        new Connection(constant.getItem(0), integrator.getItem(0)),
        new Connection(integrator.getItem(0), scope.getItem(0))
    ],
    dt: params.dt,
    Solver: SSPRK22,
    log: false
});

// Run simulation
console.log('Running JavaScript simulation...');
const startTime = performance.now();
sim.run(params.duration, true);
const endTime = performance.now();
console.log(`  Runtime: ${((endTime - startTime) / 1000).toFixed(6)}s`);
console.log();

// Get JavaScript results
const jsData = scope.getData();

// Compare results
console.log('Comparing results:');
console.log(`  Python points: ${referenceData.results.num_points}`);
console.log(`  JavaScript points: ${jsData.time.length}`);
console.log();

// Compare time arrays
const pyTime = referenceData.results.time;
const jsTime = jsData.time;
const pyOutput = referenceData.results.output;
const jsOutput = jsData.signals[0];

// Calculate errors
let maxAbsError = 0;
let maxRelError = 0;
let sumSquaredError = 0;
const numComparisons = Math.min(pyTime.length, jsTime.length);

for (let i = 0; i < numComparisons; i++) {
    const absError = Math.abs(jsOutput[i] - pyOutput[i]);
    const relError = Math.abs(absError / (pyOutput[i] + 1e-10));

    maxAbsError = Math.max(maxAbsError, absError);
    maxRelError = Math.max(maxRelError, relError);
    sumSquaredError += absError * absError;
}

const rmse = Math.sqrt(sumSquaredError / numComparisons);

console.log('Error Analysis:');
console.log(`  Max absolute error: ${maxAbsError.toExponential(6)}`);
console.log(`  Max relative error: ${(maxRelError * 100).toFixed(6)}%`);
console.log(`  RMSE: ${rmse.toExponential(6)}`);
console.log();

// Check against tolerance
const TOLERANCE_ABS = 1e-6;
const TOLERANCE_REL = 1e-4;

const passedAbs = maxAbsError < TOLERANCE_ABS;
const passedRel = maxRelError < TOLERANCE_REL;

console.log('Test Results:');
console.log(`  Absolute tolerance (${TOLERANCE_ABS.toExponential(0)}): ${passedAbs ? 'PASS ✓' : 'FAIL ✗'}`);
console.log(`  Relative tolerance (${(TOLERANCE_REL * 100).toFixed(2)}%): ${passedRel ? 'PASS ✓' : 'FAIL ✗'}`);
console.log();

// Show sample values
console.log('Sample Values Comparison:');
console.log('  Time | Python Output | JavaScript Output | Error');
console.log('  ' + '-'.repeat(60));

const sampleIndices = [0, Math.floor(numComparisons / 4), Math.floor(numComparisons / 2),
                        Math.floor(3 * numComparisons / 4), numComparisons - 1];

for (const i of sampleIndices) {
    if (i >= 0 && i < numComparisons) {
        const error = Math.abs(jsOutput[i] - pyOutput[i]);
        console.log(
            `  ${pyTime[i].toFixed(2).padStart(5)} | ` +
            `${pyOutput[i].toFixed(8).padStart(13)} | ` +
            `${jsOutput[i].toFixed(8).padStart(17)} | ` +
            `${error.toExponential(2)}`
        );
    }
}

console.log();
console.log('='.repeat(70));

if (passedAbs && passedRel) {
    console.log('TEST PASSED: JavaScript matches Python within tolerance! ✓');
} else {
    console.log('TEST FAILED: JavaScript does not match Python within tolerance! ✗');
    process.exit(1);
}

console.log('='.repeat(70));
