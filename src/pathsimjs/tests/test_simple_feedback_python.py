#!/usr/bin/env python3
"""
Python Reference Test: Simple Feedback
Single integrator with negative feedback (exponential decay)
"""

import numpy as np
import json
from pathsim import Simulation, Connection
from pathsim.blocks import Integrator, Amplifier, Scope
from pathsim.solvers import SSPRK22

# Create blocks - dx/dt = -x (exponential decay)
integrator = Integrator(1.0)  # Initial value 1.0
feedback = Amplifier(-1.0)     # Negative feedback
scope = Scope(labels=["output"])

# Create simulation
sim = Simulation(
    blocks=[integrator, feedback, scope],
    connections=[
        Connection(integrator[0], feedback[0]),
        Connection(feedback[0], integrator[0]),
        Connection(integrator[0], scope[0])
    ],
    dt=0.01,
    Solver=SSPRK22,
    log=False
)

# Run simulation
sim.run(5.0, reset=True)

# Extract data
time_data, data = scope.read()
time_data = time_data.tolist()
output_data = data[0].tolist()

# Save to JSON
output = {
    "test": "simple_feedback",
    "parameters": {
        "initial_value": 1.0,
        "feedback_gain": -1.0,
        "dt": 0.01,
        "duration": 5.0,
        "solver": "SSPRK22"
    },
    "results": {
        "time": time_data,
        "output": output_data,
        "num_points": len(time_data)
    }
}

with open("test_simple_feedback_python.json", "w") as f:
    json.dump(output, f, indent=2)

print("Python simple feedback test completed:")
print(f"  Time points: {len(time_data)}")
print(f"  Initial value: {output_data[0]:.6f}")
print(f"  Final value: {output_data[-1]:.6f}")
print(f"  Expected final (exp(-5)): {np.exp(-5.0):.6f}")
print(f"  Error: {abs(output_data[-1] - np.exp(-5.0)):.6e}")
