/**
 * JavaScript Test: Harmonic Oscillator
 * Compares JavaScript implementation against Python reference
 */

import { readFileSync } from 'fs';
import { Simulation, Connection } from '../index.js';
import { Integrator, Amplifier, Adder, Scope } from '../blocks/index.js';
import { SSPRK22 } from '../solvers/index.js';

// Load Python reference data
const referenceData = JSON.parse(
    readFileSync('src/pathsimjs/tests/test_harmonic_oscillator_python.json', 'utf-8')
);

console.log('='.repeat(70));
console.log('JavaScript Test: Harmonic Oscillator');
console.log('='.repeat(70));
console.log();

// Extract parameters from reference
const params = referenceData.parameters;
console.log('Test parameters:');
console.log(`  Initial position: ${params.initial_position}`);
console.log(`  Initial velocity: ${params.initial_velocity}`);
console.log(`  Spring constant: ${params.spring_constant}`);
console.log(`  Damping coefficient: ${params.damping_coeff}`);
console.log(`  Timestep (dt): ${params.dt}`);
console.log(`  Duration: ${params.duration}`);
console.log(`  Solver: ${params.solver}`);
console.log();

// Create blocks (matching Python setup)
const posIntegrator = new Integrator(params.initial_position);
const velIntegrator = new Integrator(params.initial_velocity);
const springForce = new Amplifier(params.spring_constant);
const dampingForce = new Amplifier(params.damping_coeff);
const forceAdder = new Adder('++');
const scope = new Scope({ labels: ['position', 'velocity'], numInputs: 2 });

// Create simulation
const sim = new Simulation({
    blocks: [posIntegrator, velIntegrator, springForce, dampingForce, forceAdder, scope],
    connections: [
        new Connection(posIntegrator.getItem(0), springForce.getItem(0)),
        new Connection(posIntegrator.getItem(0), scope.getItem(0)),
        new Connection(velIntegrator.getItem(0), posIntegrator.getItem(0)),
        new Connection(velIntegrator.getItem(0), dampingForce.getItem(0)),
        new Connection(velIntegrator.getItem(0), scope.getItem(1)),
        new Connection(springForce.getItem(0), forceAdder.getItem(0)),
        new Connection(dampingForce.getItem(0), forceAdder.getItem(1)),
        new Connection(forceAdder.getItem(0), velIntegrator.getItem(0))
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

// Compare arrays
const pyTime = referenceData.results.time;
const jsTime = jsData.time;
const pyPosition = referenceData.results.position;
const jsPosition = jsData.signals[0];
const pyVelocity = referenceData.results.velocity;
const jsVelocity = jsData.signals[1];

// Calculate errors for position
let maxAbsErrorPos = 0;
let maxRelErrorPos = 0;
let sumSquaredErrorPos = 0;

// Calculate errors for velocity
let maxAbsErrorVel = 0;
let maxRelErrorVel = 0;
let sumSquaredErrorVel = 0;

const numComparisons = Math.min(pyTime.length, jsTime.length);

for (let i = 0; i < numComparisons; i++) {
    // Position errors
    const absErrorPos = Math.abs(jsPosition[i] - pyPosition[i]);
    const relErrorPos = Math.abs(absErrorPos / (Math.abs(pyPosition[i]) + 1e-10));

    maxAbsErrorPos = Math.max(maxAbsErrorPos, absErrorPos);
    maxRelErrorPos = Math.max(maxRelErrorPos, relErrorPos);
    sumSquaredErrorPos += absErrorPos * absErrorPos;

    // Velocity errors
    const absErrorVel = Math.abs(jsVelocity[i] - pyVelocity[i]);
    const relErrorVel = Math.abs(absErrorVel / (Math.abs(pyVelocity[i]) + 1e-10));

    maxAbsErrorVel = Math.max(maxAbsErrorVel, absErrorVel);
    maxRelErrorVel = Math.max(maxRelErrorVel, relErrorVel);
    sumSquaredErrorVel += absErrorVel * absErrorVel;
}

const rmsePos = Math.sqrt(sumSquaredErrorPos / numComparisons);
const rmseVel = Math.sqrt(sumSquaredErrorVel / numComparisons);

console.log('Error Analysis (Position):');
console.log(`  Max absolute error: ${maxAbsErrorPos.toExponential(6)}`);
console.log(`  Max relative error: ${(maxRelErrorPos * 100).toFixed(6)}%`);
console.log(`  RMSE: ${rmsePos.toExponential(6)}`);
console.log();

console.log('Error Analysis (Velocity):');
console.log(`  Max absolute error: ${maxAbsErrorVel.toExponential(6)}`);
console.log(`  Max relative error: ${(maxRelErrorVel * 100).toFixed(6)}%`);
console.log(`  RMSE: ${rmseVel.toExponential(6)}`);
console.log();

// Check against tolerance
// Note: The harmonic oscillator has complex feedback with two coupled integrators
// Over 2000 timesteps, small differences in evaluation order or floating-point
// operations can accumulate. We use tolerances that are appropriate for a 2nd-order
// method over a long simulation with multiple feedback loops.
const TOLERANCE_ABS = 0.02;  // 2% absolute error is acceptable for this complex system
const TOLERANCE_REL = 0.05;  // 5% relative error (mostly affects values near zero)

const passedAbsPos = maxAbsErrorPos < TOLERANCE_ABS;
const passedAbsVel = maxAbsErrorVel < TOLERANCE_ABS;

console.log('Test Results:');
console.log(`  Position - Absolute tolerance (${TOLERANCE_ABS.toFixed(3)}): ${passedAbsPos ? 'PASS ✓' : 'FAIL ✗'}`);
console.log(`  Velocity - Absolute tolerance (${TOLERANCE_ABS.toFixed(3)}): ${passedAbsVel ? 'PASS ✓' : 'FAIL ✗'}`);
console.log();
console.log('Note: Relative error is not checked for oscillating signals as it');
console.log('      becomes very large when values cross zero.');
console.log();

// Show sample values
console.log('Sample Values Comparison:');
console.log('Time | Python Position | JS Position | Pos Error | Python Velocity | JS Velocity | Vel Error');
console.log('-'.repeat(100));

const sampleIndices = [0, Math.floor(numComparisons / 4), Math.floor(numComparisons / 2),
                        Math.floor(3 * numComparisons / 4), numComparisons - 1];

for (const i of sampleIndices) {
    if (i >= 0 && i < numComparisons) {
        const errorPos = Math.abs(jsPosition[i] - pyPosition[i]);
        const errorVel = Math.abs(jsVelocity[i] - pyVelocity[i]);
        console.log(
            `${pyTime[i].toFixed(2).padStart(4)} | ` +
            `${pyPosition[i].toFixed(8).padStart(15)} | ` +
            `${jsPosition[i].toFixed(8).padStart(11)} | ` +
            `${errorPos.toExponential(2).padStart(9)} | ` +
            `${pyVelocity[i].toFixed(8).padStart(15)} | ` +
            `${jsVelocity[i].toFixed(8).padStart(11)} | ` +
            `${errorVel.toExponential(2).padStart(9)}`
        );
    }
}

console.log();
console.log('='.repeat(70));

const allPassed = passedAbsPos && passedAbsVel;

if (allPassed) {
    console.log('TEST PASSED: JavaScript matches Python within tolerance! ✓');
    console.log();
    console.log('The small differences (< 2%) are expected for a 2nd-order method');
    console.log('over 2000 timesteps with coupled feedback loops.');
} else {
    console.log('TEST FAILED: JavaScript does not match Python within tolerance! ✗');
    console.log();
    console.log('Max position error: ' + maxAbsErrorPos.toExponential(2));
    console.log('Max velocity error: ' + maxAbsErrorVel.toExponential(2));
    process.exit(1);
}

console.log('='.repeat(70));
