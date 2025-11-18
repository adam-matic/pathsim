#!/usr/bin/env python3
"""
Python Reference Test: Simple Integrator
Generates reference output for JavaScript comparison
"""

import numpy as np
import json
from pathsim import Simulation, Connection
from pathsim.blocks import Constant, Integrator, Scope
from pathsim.solvers import SSPRK22

# Create blocks
constant = Constant(1.0)
integrator = Integrator(0.0)
scope = Scope(labels=["output"])

# Create simulation
sim = Simulation(
    blocks=[constant, integrator, scope],
    connections=[
        Connection(constant[0], integrator[0]),
        Connection(integrator[0], scope[0])
    ],
    dt=0.1,
    Solver=SSPRK22,
    log=False
)

# Run simulation
sim.run(10.0, reset=True)

# Extract data
time_data, data = scope.read()
time_data = time_data.tolist()
output_data = data[0].tolist()

# Save to JSON for JavaScript comparison
output = {
    "test": "simple_integrator",
    "parameters": {
        "constant_value": 1.0,
        "initial_value": 0.0,
        "dt": 0.1,
        "duration": 10.0,
        "solver": "SSPRK22"
    },
    "results": {
        "time": time_data,
        "output": output_data,
        "num_points": len(time_data)
    }
}

with open("test_simple_integrator_python.json", "w") as f:
    json.dump(output, f, indent=2)

print("Python reference test completed:")
print(f"  Time points: {len(time_data)}")
print(f"  Initial value: {output_data[0]:.6f}")
print(f"  Final value: {output_data[-1]:.6f}")
print(f"  Expected final: ~10.0")
print(f"  Error: {abs(output_data[-1] - 10.0):.6e}")
