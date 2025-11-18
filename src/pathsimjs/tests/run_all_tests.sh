#!/bin/bash
# Run all PathSimJS tests

echo "======================================================================="
echo "PathSimJS Test Suite"
echo "======================================================================="
echo ""

# Track overall status
FAILED=0

# Test 1: Simple Integrator
echo "Running Test 1: Simple Integrator..."
node src/pathsimjs/tests/test_simple_integrator.js
if [ $? -ne 0 ]; then FAILED=$((FAILED+1)); fi
echo ""

# Test 2: Double Integrator
echo "Running Test 2: Double Integrator..."
node src/pathsimjs/tests/test_double_integrator.js
if [ $? -ne 0 ]; then FAILED=$((FAILED+1)); fi
echo ""

# Test 3: Simple Feedback
echo "Running Test 3: Simple Feedback..."
node src/pathsimjs/tests/test_simple_feedback.js
if [ $? -ne 0 ]; then FAILED=$((FAILED+1)); fi
echo ""

# Test 4: Harmonic Oscillator
echo "Running Test 4: Harmonic Oscillator..."
node src/pathsimjs/tests/test_harmonic_oscillator.js
if [ $? -ne 0 ]; then FAILED=$((FAILED+1)); fi
echo ""

# Summary
echo "======================================================================="
echo "Test Summary"
echo "======================================================================="
if [ $FAILED -eq 0 ]; then
    echo "✓ All tests passed!"
    exit 0
else
    echo "✗ $FAILED test(s) failed"
    exit 1
fi
