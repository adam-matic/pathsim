// Simple debug script to trace SSPRK22 execution
import { SSPRK22 } from '../solvers/SSPRK22.js';

console.log('='.repeat(70));
console.log('Debug: SSPRK22 Execution Trace');
console.log('='.repeat(70));

const solver = new SSPRK22(1.0);  // Initial value = 1.0

console.log('\nInitial state:', solver.get());

// Buffer before timestep
solver.buffer(0.1);
console.log('After buffer, history:', solver.history);

// Stage 0
console.log('\n' + '-'.repeat(70));
console.log('STAGE 0: t + 0.0*dt');
console.log('-'.repeat(70));
solver.stage = 0;
const f0 = 1.0;  // Constant derivative
console.log('Input f:', f0);
const [s0, e0, sc0] = solver.step(f0, 0.1);
console.log('After stage 0 step:');
console.log('  State x:', solver.get());
console.log('  k[0]:', solver.k[0]);
console.log('  Expected x: 1.0 + 0.1 * 1.0 = 1.1');

// Stage 1
console.log('\n' + '-'.repeat(70));
console.log('STAGE 1: t + 1.0*dt');
console.log('-'.repeat(70));
solver.stage = 1;
const f1 = 1.0;  // Constant derivative (should be evaluated at x=1.1)
console.log('Input f:', f1);
const [s1, e1, sc1] = solver.step(f1, 0.1);
console.log('After stage 1 step:');
console.log('  State x:', solver.get());
console.log('  k[1]:', solver.k[1]);
console.log('  Expected x: 1.0 + 0.1 * (0.5*1.0 + 0.5*1.0) = 1.1');

console.log('\n' + '='.repeat(70));
console.log('Final state:', solver.get());
console.log('Expected: 1.1 (constant rate integration)');
console.log('='.repeat(70));
