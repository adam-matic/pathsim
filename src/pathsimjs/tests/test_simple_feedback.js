/**
 * JavaScript Test: Simple Feedback
 * Single integrator with negative feedback - should give exponential decay
 */

import { readFileSync } from 'fs';
import { Simulation, Connection } from '../index.js';
import { Integrator, Amplifier, Scope } from '../blocks/index.js';
import { SSPRK22 } from '../solvers/index.js';

// Load Python reference data
const referenceData = JSON.parse(
    readFileSync('src/pathsimjs/tests/test_simple_feedback_python.json', 'utf-8')
);

console.log('='.repeat(70));
console.log('JavaScript Test: Simple Feedback (Exponential Decay)');
console.log('='.repeat(70));
console.log();

// Extract parameters
const params = referenceData.parameters;
console.log('Test parameters:');
console.log(`  Initial value: ${params.initial_value}`);
console.log(`  Feedback gain: ${params.feedback_gain}`);
console.log(`  Equation: dx/dt = ${params.feedback_gain} * x`);
console.log(`  Analytical solution: x(t) = ${params.initial_value} * exp(${params.feedback_gain} * t)`);
console.log();

// Create blocks
const integrator = new Integrator(params.initial_value);
const feedback = new Amplifier(params.feedback_gain);
const scope = new Scope({ labels: ['output'], numInputs: 1 });

// Create simulation
const sim = new Simulation({
    blocks: [integrator, feedback, scope],
    connections: [
        new Connection(integrator.getItem(0), feedback.getItem(0)),
        new Connection(feedback.getItem(0), integrator.getItem(0)),
        new Connection(integrator.getItem(0), scope.getItem(0))
    ],
    dt: params.dt,
    Solver: SSPRK22,
    log: false
});

// Run simulation
console.log('Running JavaScript simulation...');
sim.run(params.duration, true);

// Get results
const jsData = scope.getData();

// Compare
const pyOutput = referenceData.results.output;
const jsOutput = jsData.signals[0];

console.log();
console.log('Results Comparison:');
console.log(`  Python points: ${referenceData.results.num_points}`);
console.log(`  JavaScript points: ${jsData.time.length}`);
console.log();

// Calculate errors
let maxAbsError = 0;
const numComparisons = Math.min(pyOutput.length, jsOutput.length);

for (let i = 0; i < numComparisons; i++) {
    maxAbsError = Math.max(maxAbsError, Math.abs(jsOutput[i] - pyOutput[i]));
}

console.log('Error Analysis:');
console.log(`  Max absolute error: ${maxAbsError.toExponential(6)}`);
console.log();

// Analytical solution
const expectedFinal = params.initial_value * Math.exp(params.feedback_gain * params.duration);

console.log('Final Values:');
console.log(`  Python: ${pyOutput[pyOutput.length - 1].toFixed(8)}`);
console.log(`  JavaScript: ${jsOutput[jsOutput.length - 1].toFixed(8)}`);
console.log(`  Analytical: ${expectedFinal.toFixed(8)}`);
console.log();

const TOLERANCE = 1e-12;
const passed = maxAbsError < TOLERANCE;

console.log('='.repeat(70));
if (passed) {
    console.log('TEST PASSED: JavaScript matches Python at machine precision! ✓');
} else {
    console.log('TEST FAILED: Differences exceed machine precision ✗');
    console.log(`Max error: ${maxAbsError.toExponential(2)}`);
}
console.log('='.repeat(70));

process.exit(passed ? 0 : 1);
