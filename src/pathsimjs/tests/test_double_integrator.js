/**
 * JavaScript Test: Double Integrator
 * Simpler test than harmonic oscillator - just cascaded integrators
 */

import { readFileSync } from 'fs';
import { Simulation, Connection } from '../index.js';
import { Constant, Integrator, Scope } from '../blocks/index.js';
import { SSPRK22 } from '../solvers/index.js';

// Load Python reference data
const referenceData = JSON.parse(
    readFileSync('src/pathsimjs/tests/test_double_integrator_python.json', 'utf-8')
);

console.log('='.repeat(70));
console.log('JavaScript Test: Double Integrator');
console.log('='.repeat(70));
console.log();

// Extract parameters
const params = referenceData.parameters;
console.log('Test parameters:');
console.log(`  Acceleration: ${params.acceleration}`);
console.log(`  Initial velocity: ${params.initial_velocity}`);
console.log(`  Initial position: ${params.initial_position}`);
console.log(`  Timestep (dt): ${params.dt}`);
console.log(`  Duration: ${params.duration}`);
console.log();

// Create blocks
const accel = new Constant(params.acceleration);
const velInt = new Integrator(params.initial_velocity);
const posInt = new Integrator(params.initial_position);
const scope = new Scope({ labels: ['position', 'velocity'], numInputs: 2 });

// Create simulation
const sim = new Simulation({
    blocks: [accel, velInt, posInt, scope],
    connections: [
        new Connection(accel.getItem(0), velInt.getItem(0)),
        new Connection(velInt.getItem(0), posInt.getItem(0)),
        new Connection(posInt.getItem(0), scope.getItem(0)),
        new Connection(velInt.getItem(0), scope.getItem(1))
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
const pyTime = referenceData.results.time;
const pyPosition = referenceData.results.position;
const pyVelocity = referenceData.results.velocity;
const jsPosition = jsData.signals[0];
const jsVelocity = jsData.signals[1];

console.log();
console.log('Results Comparison:');
console.log(`  Python points: ${referenceData.results.num_points}`);
console.log(`  JavaScript points: ${jsData.time.length}`);
console.log();

// Calculate errors
let maxAbsErrorPos = 0;
let maxAbsErrorVel = 0;
const numComparisons = Math.min(pyTime.length, jsData.time.length);

for (let i = 0; i < numComparisons; i++) {
    maxAbsErrorPos = Math.max(maxAbsErrorPos, Math.abs(jsPosition[i] - pyPosition[i]));
    maxAbsErrorVel = Math.max(maxAbsErrorVel, Math.abs(jsVelocity[i] - pyVelocity[i]));
}

console.log('Error Analysis:');
console.log(`  Position max error: ${maxAbsErrorPos.toExponential(6)}`);
console.log(`  Velocity max error: ${maxAbsErrorVel.toExponential(6)}`);
console.log();

// Check final values
const expectedVel = params.acceleration * params.duration;
const expectedPos = params.initial_position + 0.5 * params.acceleration * params.duration ** 2;

console.log('Final Values:');
console.log(`  Python Position: ${pyPosition[pyPosition.length - 1].toFixed(6)}`);
console.log(`  JS Position: ${jsPosition[jsPosition.length - 1].toFixed(6)}`);
console.log(`  Expected (analytical): ${expectedPos.toFixed(6)}`);
console.log();
console.log(`  Python Velocity: ${pyVelocity[pyVelocity.length - 1].toFixed(6)}`);
console.log(`  JS Velocity: ${jsVelocity[jsVelocity.length - 1].toFixed(6)}`);
console.log(`  Expected (analytical): ${expectedVel.toFixed(6)}`);
console.log();

// More relaxed tolerance for accumulated error over many steps
const TOLERANCE = 1e-12;  // Machine precision level

const passed = (maxAbsErrorPos < TOLERANCE) && (maxAbsErrorVel < TOLERANCE);

console.log('='.repeat(70));
if (passed) {
    console.log('TEST PASSED: JavaScript matches Python at machine precision! ✓');
} else {
    console.log('TEST FAILED: Differences exceed machine precision ✗');
    console.log(`Position error: ${maxAbsErrorPos.toExponential(2)}`);
    console.log(`Velocity error: ${maxAbsErrorVel.toExponential(2)}`);
}
console.log('='.repeat(70));

process.exit(passed ? 0 : 1);
